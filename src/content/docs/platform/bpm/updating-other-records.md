---
title: Update other records from a BPM
description: Change records other than the one being saved, using business object calls or direct database writes, at the right stage and inside a transaction.
env: both
sidebar:
  order: 11
sources:
  - title: "EpiUsers: Set field in another table, pre-process method to post-process"
    url: https://www.epiusers.help/t/set-field-in-another-table-pre-process-method-to-post-process/114413
---

Sooner or later a directive needs to change a record that isn't the one being saved: stamp all of a
job's operations when the job is released, log a change to a UD table, update quote lines when a CRM
task is completed. This page covers where to do that, the ways to do it, and the traps.

## Why Set Field doesn't reach other tables

A **Set Field** widget changes rows in the method's tableset, and a save only carries the rows the user
changed. If a user ticks **Released** on a job header, `JobEntry.Update` receives the `JobHead` row; the
job's operations aren't in the call. Setting a field on "all `JobOper` rows" therefore changes nothing,
because there are no `JobOper` rows to change. To touch other records, you have to fetch them yourself.

## Do it in post-processing

Update the record being saved in pre-processing, and update *other* records in post-processing. If the
main save fails validation, post-processing never runs, so you don't end up with related records
changed for a save that didn't happen.

Detecting the change often has to happen in pre-processing, while the before-image is available. Pass
what you found to post-processing as shown in
[Pass data from pre- to post-processing](/platform/bpm/passing-data-pre-to-post/).

## Three ways to write

| Approach | Pros | Cons |
|---|---|---|
| **Invoke BO Method** widget, or a service call in code | Runs Epicor's validation and business logic, same as a user save | More setup; two services in one directive can clash on tableset types |
| **Epicor Function** called from the directive | Reusable, and isolates services that would clash | Another object to maintain |
| **Direct `Db` write** in custom code | Short and fast | Skips business logic entirely |

Use a business object (directly or through a function) whenever the change has consequences: status
changes, quantities, anything with costs or inventory. Keep direct writes for simple, self-contained
fields such as comments, UD fields and counters.

## Example: stamp every operation when a job is released

This continues the example from
[Pass data from pre- to post-processing](/platform/bpm/passing-data-pre-to-post/): pre-processing on
`JobEntry.Update` detected the release and put the job number in `callContextBpmData.Character01`.
Post-processing now writes a comment on all the job's operations:

```csharp
string jobNum = callContextBpmData.Character01;
callContextBpmData.Character01 = "";
if (string.IsNullOrEmpty(jobNum)) return;

using (var txScope = IceContext.CreateDefaultTransactionScope())
{
    var ops = Db.JobOper
        .Where(o => o.Company == Session.CompanyID && o.JobNum == jobNum)
        .ToList();

    foreach (var op in ops)
    {
        op.CommentText = "Released for production.";
    }

    Db.Validate();
    txScope.Complete();
}
```

- `CreateDefaultTransactionScope()` wraps the writes in a transaction.
- `Db.Validate()` saves your pending changes through Epicor's data layer.
- `txScope.Complete()` commits. If the code throws before this line, nothing is committed.

The same shape works in a **Standard** data directive, which is also a safe place for follow-up writes
because the triggering save has already committed. For example, a Standard directive on the CRM `Task`
table can raise the confidence percentage on a quote's lines as each sales task is completed.

## Example: write a history row to a UD table

Some values aren't tracked the way you might expect. Epicor's change log, for instance, records changes
*after* a record is created but not the value it was created with, so the first entry for a job's
production quantity only appears on its first change. And emailing on every change quickly becomes
noise.
<!-- TODO verify: where the change log is configured in current versions, to link to it from here -->

A dependable alternative is to write your own history row to a UD table (`UD01` to `UD40`) each time
the value changes, then report on it with a BAQ. Create UD rows through the UD business object so
Epicor fills in the system fields. For UD tables, use `GetaNewUDxx` to start a new row:

```csharp
using (var udSvc = Ice.Assemblies.ServiceRenderer.GetService<Ice.Contracts.UD01SvcContract>(Db))
{
    var uds = new Ice.Tablesets.UD01Tableset();
    udSvc.GetaNewUD01(ref uds);

    var hist = uds.UD01[uds.UD01.Count - 1];
    hist.Key1 = jobNum;
    hist.Key2 = DateTime.Now.ToString("yyyyMMddHHmmssfff");
    hist.Character01 = Session.UserID;
    hist.Number01 = oldQty;
    hist.Number02 = newQty;

    udSvc.Update(ref uds);
}
```

<!-- TODO verify: compile this snippet on a current version; the directive needs a reference to the UD01 contract assembly -->

The UD key fields together must be unique, so include something like a timestamp in one of them.
Custom code that calls a service needs a reference to that service's contract assembly, added in the
directive's usings and references settings.

The widget-only version of the same thing uses **Fill Table by Query** to build the row and **Invoke BO
Method** to call `Ice.BO.UD01.UpdateExt`.

## Example: act on records a process just created

Process methods often report what they created in their own tableset. After the Order Job Wizard runs,
for example, a post-processing directive on `Erp.BO.OrderJobWiz.CreateJobs` can loop over the
`JWOrderRel` rows, whose `JobNum` field holds each job the wizard just created, and apply follow-up
changes to those jobs.

## Things to watch

- **Loops.** If post-processing calls the same business object (updating other sales orders from a
  sales order directive, say), your directives run again for those calls. Guard with a marker in
  `callContextBpmData`.
- **Tableset clashes.** Calling two services whose tablesets share type names in one directive can stop
  it compiling. Move one of the calls into an Epicor Function.
- **Refreshing the screen.** Changes to other records don't appear on the user's screen until it
  reloads them.
- **Materialize before writing.** End the query with `.ToList()` before looping and changing rows. See
  [Fix "There is already an open DataReader"](/platform/bpm/ef-core-open-datareader/).

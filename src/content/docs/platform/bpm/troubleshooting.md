---
title: Common BPM problems
description: Symptoms, causes and fixes for directives that don't fire, fire twice, don't save their changes, throw null errors, loop or slow a screen down.
env: both
sidebar:
  order: 16
sources:
  - title: "EpiUsers: BPM message pops up twice"
    url: https://www.epiusers.help/t/bpm-message-pops-up-twice/46919
  - title: "EpiUsers: Set field in another table, pre-process method to post-process"
    url: https://www.epiusers.help/t/set-field-in-another-table-pre-process-method-to-post-process/114413
---

Quick fixes for the problems that come up most often when building directives. Each section starts
with what you see, then explains why and what to do.

## The directive doesn't run at all

**Symptom:** nothing happens: no message, no change, no error.

**Cause:** usually one of these:

- The directive isn't **Enabled**, or its group has been disabled.
- It's on the wrong method. The screen calls `MasterUpdate` or `UpdateMaster` rather than `Update`, or
  Kinetic and Classic call different methods for the same action.
- The first condition is never true, for example because it tests **the added row** on an edit.

**Fix:** trace the action (see [Find the method a screen calls](/platform/bpm/finding-the-right-method/))
and confirm the method. Then add a temporary **Show Message** straight after **Start** to prove the
directive runs, and move it past each condition in turn to find where the flow stops.

## A message or email appears twice, or on every save

**Symptom:** a message you meant to show once appears twice in one save, or again every time the
record is saved afterwards.

**Cause:** the condition checks a *state* ("approved is true") rather than a *change*. A state stays
true on every later save, and a single save can call the method more than once.

**Fix:** use "field has been changed from `false` to `true`" (or from *any* to the value you care about)
on **the changed row**. See [BPM conditions](/platform/bpm/conditions/#check-for-a-change-not-a-state).

## Set Field on another table does nothing

**Symptom:** a directive on one table's save (for example `JobEntry.Update` when the job header
changes) uses Set Field on a related table (`JobOper`), and the related records never change.

**Cause:** Set Field only changes rows in the call's tableset, and the call only contains what the user
changed. The related rows aren't there to set.

**Fix:** read and update the related records yourself, in post-processing or a data directive, with
custom code or a business object call. Put the condition in code alongside the update if the widgets
make it awkward. See [Update other records from a BPM](/platform/bpm/updating-other-records/).

## Changes made in post-processing aren't saved

**Symptom:** a post-processing directive sets a field, the screen shows the new value, but after
reopening the record the old value is back.

**Cause:** by post-processing, the base method has already written to the database. Editing `ds` only
changes what's returned to the screen.

**Fix:** change the current record in pre-processing or an In-Transaction data directive. If it really
must happen afterwards, update the database record explicitly.

## Emails from the Send E-mail widget don't arrive

**Symptom:** the directive clearly runs, but no email turns up and no error is shown.

**Cause:** asynchronous sends happen in the background, so failures aren't reported to the user.

**Fix:** switch the widget to synchronous and test again. That has resolved missing emails outright for
some sites, and otherwise shows you the actual SMTP error. Also check the SMTP settings and the From
address your mail server will accept. See
[Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/).

## "Sequence contains no elements"

**Symptom:** the save fails with:

```text
Sequence contains no elements
```

**Cause:** the code uses `First()` or `Single()` on a query or table that returned nothing.

**Fix:** use `FirstOrDefault()` and check for `null` before using the result.

## "Object reference not set to an instance of an object."

**Symptom:** the save fails with:

```text
Object reference not set to an instance of an object.
```

**Cause:** something in the code is `null`: a lookup that found nothing, an empty UD field, a date with
no value, or `ds.Table[0]` on a table without the row you expected.

**Fix:** check lookups for `null`, use `?? ""` on strings from queries, and avoid calling `.ToString()`
on values that can be empty. Filter tableset rows by `RowMod` instead of indexing
(see [The BPM tableset](/platform/bpm/dataset-and-rowmod/#dont-assume-the-first-row-is-the-one-you-want)).

## The directive runs over and over, or the screen hangs

**Symptom:** a save takes far longer than usual, messages repeat many times, or the call times out.

**Cause:** the directive calls a business object whose own directives (or this same one) trigger again,
for example a sales order directive that updates other sales orders.

**Fix:** set a marker in `callContextBpmData` before making the nested call, and make the directive's
first condition skip when the marker is set. See
[Pass data from pre- to post-processing](/platform/bpm/passing-data-pre-to-post/#things-to-know-about-callcontextbpmdata).

## A screen became slow after adding a directive

**Symptom:** saves or searches on one screen are noticeably slower since a directive went live.

**Cause:** usually a database query inside a loop, a query without a company or key filter, or a
designed query or BAQ running on every call.

**Fix:** move lookups out of loops into one dictionary query, filter on indexed keys, and put cheap
conditions first so expensive checks only run when needed. See
[Query the database with LINQ](/platform/bpm/linq-queries/#dont-query-inside-a-loop) and
[BPM conditions](/platform/bpm/conditions/#keep-conditions-cheap).

## "There is already an open DataReader associated with this Connection"

See [Fix "There is already an open DataReader"](/platform/bpm/ef-core-open-datareader/).

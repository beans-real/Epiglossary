---
title: Report quantity from an Epicor Function
description: Report completed quantity against one or many job operations server-side in an Epicor Function using the Labor and ReportQty services, and call it from a button on a Kinetic MES screen.
env: kinetic
sidebar:
  order: 4
---

In Classic MES, "one button reports this step" was usually a customization that filled the Report Quantity form and saved it (see [Customizing Report Quantity](/classic/mes/job-stage-buttons/)). Kinetic has no client-side C#, and chaining several service calls in Application Studio events gets fragile fast. The robust replacement is an **Epicor Function** that does the whole transaction on the server, called from a single event.

This page shows the function. The same code works from anywhere that can call a function: an MES button, a dashboard, a REST integration.

## What the function has to do

Reporting quantity needs an **active labor detail** (the activity the employee is clocked into) for the operation. So, for each operation:

1. Reuse the employee's active labor detail on that operation if there is one.
2. Otherwise, find the employee's active labor header (they must be clocked in) and start a new labor detail on the operation.
3. Report the quantity against that labor detail.
4. Optionally, end the activity again, so a one-click report doesn't leave labor running.

## Function setup

- **Signature**: inputs `empID` (string), `jobNum` (string), `asmSeq` (int), `oprSeq` (int), `qty` (decimal); output `message` (string).
- **References**: the services `Erp.BO.Labor` and `Erp.BO.ReportQty`, and read access to the tables `LaborHed`, `LaborDtl`, `JobOper`, `JobOpDtl` and `EmpBasic`.

## The code

```csharp
string company = Session.CompanyID;
int hedSeq = 0;
int dtlSeq = 0;
bool startedHere = false;

// 1. Already working on this operation?
var open = Db.LaborDtl
    .Where(d => d.Company == company && d.EmployeeNum == empID && d.ActiveTrans
             && d.JobNum == jobNum && d.AssemblySeq == asmSeq && d.OprSeq == oprSeq)
    .Select(d => new { d.LaborHedSeq, d.LaborDtlSeq })
    .FirstOrDefault();

if (open != null)
{
    hedSeq = open.LaborHedSeq;
    dtlSeq = open.LaborDtlSeq;
}
else
{
    // 2. Must be clocked in
    hedSeq = Db.LaborHed
        .Where(h => h.Company == company && h.EmployeeNum == empID && h.ActiveTrans)
        .Select(h => h.LaborHedSeq)
        .FirstOrDefault();
    if (hedSeq == 0)
        throw new Ice.BLException($"Employee {empID} is not clocked in.");

    var op = Db.JobOper
        .Where(o => o.Company == company && o.JobNum == jobNum && o.AssemblySeq == asmSeq && o.OprSeq == oprSeq)
        .Select(o => new { o.OpCode })
        .FirstOrDefault();
    var res = Db.JobOpDtl
        .Where(o => o.Company == company && o.JobNum == jobNum && o.AssemblySeq == asmSeq && o.OprSeq == oprSeq)
        .Select(o => new { o.ResourceGrpID, o.ResourceID })
        .FirstOrDefault();
    string expense = Db.EmpBasic
        .Where(e => e.Company == company && e.EmpID == empID)
        .Select(e => e.ExpenseCode)
        .FirstOrDefault();
    if (op == null)
        throw new Ice.BLException($"Operation {jobNum}/{asmSeq}/{oprSeq} was not found.");

    // start the activity
    CallService<Erp.Contracts.LaborSvcContract>(labor =>
    {
        var ts = labor.GetByID(hedSeq);
        labor.GetNewLaborDtl(ref ts, hedSeq);

        var dtl = ts.LaborDtl[ts.LaborDtl.Count - 1];
        dtl.JobNum = jobNum;
        dtl.AssemblySeq = asmSeq;
        dtl.OprSeq = oprSeq;
        dtl.OpCode = op.OpCode;
        dtl.ResourceGrpID = res?.ResourceGrpID ?? "";
        dtl.ResourceID = res?.ResourceID ?? "";
        dtl.ExpenseCode = expense ?? "";
        dtl.LaborQty = 0;
        dtl.RowMod = "A";
        labor.Update(ref ts);

        dtlSeq = ts.LaborDtl[ts.LaborDtl.Count - 1].LaborDtlSeq;
    });
    startedHere = true;
}

// 3. Report the quantity
CallService<Erp.Contracts.ReportQtySvcContract>(rq =>
{
    var rqTs = rq.GetNewReportQty(empID, hedSeq, dtlSeq);   // keep the returned tableset
    var row = rqTs.ReportQty[0];
    row.JobNum = jobNum;
    row.AssemblySeq = asmSeq;
    row.OprSeq = oprSeq;
    row.CurrentQty = qty;

    string opMessage;
    rq.ReportQuantity(hedSeq, dtlSeq, out opMessage, ref rqTs);
    message = opMessage;
});

// 4. End the activity if this call started it
if (startedHere)
{
    CallService<Erp.Contracts.LaborSvcContract>(labor =>
    {
        var ts = labor.GetByID(hedSeq);
        var dtl = ts.LaborDtl.FirstOrDefault(d => d.LaborDtlSeq == dtlSeq);
        if (dtl != null && dtl.ActiveTrans)
        {
            dtl.RowMod = "U";
            labor.EndActivity(ref ts);
            labor.Update(ref ts);
        }
    });
}
```

<!-- TODO verify: GetNewReportQty(empID, laborHedSeq, laborDtlSeq), ReportQuantity(laborHedSeq, laborDtlSeq, out msg, ref ts) and EndActivity(ref ts) signatures against your release's service contracts -->

## How it works, and the traps

- **Keep what the service returns.** `GetNewReportQty` *returns* the tableset to fill. Creating your own empty tableset and ignoring the return value compiles, runs without error, and reports nothing at all.
- **Setting fields directly skips defaulting.** On the screen, typing a job and operation runs `Change...` methods that fill the op code, resource group and so on. Setting the columns directly doesn't, which is why the code looks those values up itself. Trace the MES screen doing the same job by hand to see what it fills in; see [Find the method a screen calls](/platform/bpm/finding-the-right-method/).
- **Don't create duplicate activities.** Step 1 reuses an existing active labor detail. Without it, a double-click starts a second activity on the same operation.
- **End only what you started.** Step 4 leaves an activity the operator started themselves alone.
- **Clocked-in check.** Throwing a clear `BLException` gives the operator a readable message in MES instead of a failure deep inside the Labor service.

## Several operations per press

When one press should report several operations (for example the same step on every subassembly), wrap steps 1 to 4 in a loop over a list of `(asmSeq, oprSeq)` pairs. Two things matter once you loop:

- **Deduplicate.** If the list comes from a BAQ with joins, the same operation can appear more than once. Keep a `HashSet<string>` of `"job|asm|opr"` keys and skip repeats, or you'll report the quantity twice.
- **Read once, then loop.** Load the job's operations, resources and the employee's active labor details into dictionaries before the loop, with `.ToList()` on each query, rather than querying the database inside it. See [Query the database with LINQ](/platform/bpm/linq-queries/) and [Fix "There is already an open DataReader"](/platform/bpm/ef-core-open-datareader/).

While you're developing, a small logging helper that calls `this.PublishInfoMessage(...)` at each step (with a flag to switch it off) makes it obvious which step a failure happens in.

## Calling it from Kinetic MES

1. In an Application Studio layer on the MES screen, add a button for the step.
2. Give it an event on **Click** that calls the function (the function widget is described in [Calling BAQs, services and functions](/kinetic/application-studio/calling-services/)), passing the employee ID, job, assembly, operation and quantity from the screen's data views.
3. Show the returned `message`, then refresh the screen's labor data.

Finding which data view holds the clocked-in employee on your MES screen is easiest in the browser's debugging tools; see [Debugging](/kinetic/application-studio/debugging/).

:::caution
Test with a real clocked-in employee in a test environment, and check the results in **Time and Expense Entry** and on the job's operations. Labor and quantity postings affect costing and scheduling as soon as they're saved.
:::

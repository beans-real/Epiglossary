---
title: Labor entry BPMs
description: Patterns for directives on Labor.Update, including finding the activity being ended, limiting reported quantity, correcting the resource, and turning off move requests.
env: both
sidebar:
  order: 15
---

Labor is one of the busiest places for BPMs. Every clock-in, end activity and time entry goes through
`Erp.BO.Labor.Update`, whether it comes from MES, Time and Expense Entry or a shop-floor integration.
That makes it a good place to enforce shop-floor rules, and a place where a slow or careless directive
is felt by everyone.

## Find the activity being ended

Most labor rules apply when the operator *finishes* an activity and reports quantity. In the labor
tableset that's an updated `LaborDtl` row with `EndActivity` set:

```csharp
var ending = ds.LaborDtl
    .Where(l => l.RowMod == IceRow.ROWSTATE_UPDATED && l.EndActivity)
    .ToList();
```

Other useful fields on `LaborDtl`:

| Field | Meaning |
|---|---|
| `LaborType` | `"P"` production, `"S"` setup, `"I"` indirect |
| `LaborQty` | Quantity reported on this entry |
| `JobNum`, `AssemblySeq`, `OprSeq` | The job operation being worked |
| `EmployeeNum` | The employee's ID |
| `ReWork` | The entry is rework |
| `ResourceGrpID`, `ResourceID`, `JCDept` | Where the time and cost are charged |

Put rules that validate or change these rows in **pre-processing**. Changes made to `ds` in
post-processing go back to the screen but aren't saved.

## Example: don't report more than the previous operation completed

A common request: an operation can't report more good parts than the operation before it has
completed. This pre-processing directive checks each production entry being ended:

```csharp
foreach (var labor in ds.LaborDtl.Where(l =>
    l.RowMod == IceRow.ROWSTATE_UPDATED && l.EndActivity &&
    l.LaborType == "P" && !l.ReWork && l.LaborQty > 0))
{
    var ops = Db.JobOper
        .Where(o => o.Company == labor.Company && o.JobNum == labor.JobNum
                 && o.AssemblySeq == labor.AssemblySeq && o.OprSeq <= labor.OprSeq)
        .OrderByDescending(o => o.OprSeq)
        .Select(o => new { o.OprSeq, o.QtyCompleted })
        .Take(2)
        .ToList();

    if (ops.Count < 2) continue;   // first operation on the assembly: nothing to compare

    var thisOp = ops[0];
    var prevOp = ops[1];

    if (thisOp.QtyCompleted + labor.LaborQty > prevOp.QtyCompleted)
    {
        throw new Ice.BLException(
            $"Operation {prevOp.OprSeq} has only completed {prevOp.QtyCompleted:0.##}. " +
            $"Operation {labor.OprSeq} can't report more than that.");
    }
}
```

It reads both operations in a single query, and only runs for production entries that report a
quantity, so indirect time and setup aren't slowed down.

**Limitations to decide on before you roll it out:**

- **Different quantity per parent.** If operations have different quantities per parent, compare
  per-parent quantities rather than raw quantities.
- **Overlapping operations.** Operations set to run start-to-start work in parallel, so the next one
  may legitimately report before the previous one does.
- **Subcontract operations.** Their completed quantity comes from receipts rather than labor, so decide
  how an operation that follows one should be checked.
- **Editing old entries.** The check assumes the entry's quantity isn't already counted in
  `QtyCompleted`, which holds when ending an activity. Editing already-posted labor needs different
  handling.

A simpler alternative is to require the previous operation to be marked complete (`JobOper.OpComplete`).
It's far less code, but it relies on operators completing operations consistently.

## Example: charge time to the employee's resource

If operators can clock onto any operation from any terminal, labor can end up charged to the wrong
resource or department. This pre-processing directive replaces them with the employee's own defaults at
clock-out:

```csharp
foreach (var labor in ds.LaborDtl.Where(l => l.RowMod == IceRow.ROWSTATE_UPDATED && l.EndActivity))
{
    var emp = Db.EmpBasic
        .Where(e => e.Company == labor.Company && e.EmpID == labor.EmployeeNum)
        .Select(e => new { e.ResourceGrpID, e.ResourceID, e.JCDept })
        .FirstOrDefault();

    if (emp == null || string.IsNullOrEmpty(emp.ResourceID)) continue;

    labor.ResourceGrpID = emp.ResourceGrpID;
    labor.ResourceID = emp.ResourceID;
    labor.JCDept = emp.JCDept;
}
```

Variations:

- **Use the scheduled resource instead.** The operation's scheduled production and setup details are
  in `JobOpDtl`, identified by `JobOper.PrimaryProdOpDtl` and `JobOper.PrimarySetupOpDtl`. Map
  production entries to the first and setup entries to the second.
- **Burden rate.** Changing the resource doesn't necessarily change `LaborDtl.BurdenRate`. If yours
  must follow the new resource, read the resource's (or resource group's) burden settings and set the
  rate yourself. A percentage burden type means the labor rate times the percentage; a flat type means
  the rate as entered.
  <!-- TODO verify: does Labor.Update recalculate BurdenRate when ResourceID changes in pre-processing? -->

Make sure the rest of your shop-floor reporting agrees. If a third-party terminal system expects its own
resource on the labor record, remapping in Epicor can break that system's reports. Often the cleaner
fix is to stop operators clocking onto operations that aren't scheduled on their resource.

## Example: turn off move requests

When an activity is ended with **Request Move** ticked, Epicor raises a request to move the completed
quantity on, to the next operation or to stock. If your shop doesn't use move requests, stray ones
clutter the material queue.

1. Create a pre-processing directive on `Erp.BO.Labor.Update`.
2. Add **Set Field**: set `LaborDtl.RequestMove` (check the exact field name in your version) of **all rows** to `false`.

If some resources should always move their output automatically, configure that on the resource rather
than relying on operators ticking the box.

## Keep labor directives fast

- Filter on `RowMod`, `EndActivity` and `LaborType` before any database query.
- Query only the operation rows you need, and select only the columns you use.
- Clock-ins and clock-outs happen in bursts at shift change; a directive that takes a second per call
  holds up a queue of operators.

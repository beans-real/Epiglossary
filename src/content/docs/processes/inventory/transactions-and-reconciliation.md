---
title: Inventory transactions and WIP reconciliation
description: How inventory transactions become GL entries, how to use the Inventory/WIP Reconciliation report, why ADJ-CST lines appear when a part was received at zero cost, and how to find the latest receipt from PartTran.
env: both
sources:
  - title: "EpiUsers: Inventory variance in transaction history"
    url: https://www.epiusers.help/t/inventory-variance-in-transaction-history/88771/15
sidebar:
  order: 2
---

Every quantity or cost movement in Epicor writes a `PartTran` row, and labor writes `LaborDtl` rows. Those
rows don't hit the general ledger immediately. They sit as uncaptured activity until **Capture COS/WIP
Activity** sends them through the posting engine. Reconciling inventory and WIP with the GL is mostly
about understanding that gap.

For what each transaction code means, see [Inventory transaction types](/reference/transaction-types/).

## From transaction to GL

1. A user or process moves stock: a receipt, an issue, a shipment, an adjustment. Epicor writes
   `PartTran` with the quantity, the extended cost split into material, labor, burden, subcontract and
   material burden, and the dates.
2. The transaction is visible straight away in trackers and reports, but it isn't posted.
3. **Capture COS/WIP Activity** runs (often nightly). It applies the **COS and WIP** posting rules to
   each captured row, writes the GL lines (`TranGLC`) and journal details, and marks the rows posted.
4. Month-end closes the period. Locked transactions can no longer be changed or reversed directly.

Two dates matter on every row: `TranDate` (the date the transaction applies to, which drives the
accounting period) and `SysDate`/`SysTime` (when it was actually entered).

## The Inventory/WIP Reconciliation report

**Production Management > Job Management > Reports > Inventory/WIP Reconciliation** lists inventory and
labor transactions with the GL accounts they post to, grouped the way you choose. Use it to:

- Tie the inventory and WIP balance sheet accounts back to the transactions behind them.
- Preview what the next **Capture COS/WIP Activity** run will post, before it runs. The report
  simulates the capture, so it shows accounts even for uncaptured rows.
- Check whether a specific transaction has already posted (the report shows a posted-to-GL flag). This
  is how to confirm whether something can still be reversed.

Key parameters:

| Parameter | Tip |
|---|---|
| **Book** | Pick the book you're reconciling |
| Date type | **Transaction Apply Date** selects by `TranDate`, which matches GL periods. **Transaction System Date** selects by when rows were entered, which is better for "what happened yesterday" |
| **GL Account** | Leave blank for all, or enter one account to see only rows that touch it |
| **Include Offsetting Accounts** | With one account selected, also shows the other side of each entry. Example: an `MFG-STK` of 100 debits inventory 100 and credits WIP material 90 and WIP burden 10. Filtering on WIP material without offsets shows only the 90 credit; with offsets you see all three lines |
| Detail level | **Full** lists every transaction. The summarised options roll up by date, job/part and transaction type for a quicker tie-out |
| **Current Site** | Limit to the current site when reconciling a multi-site company |

Costs on the report are in the part's base UOM, so quantities may not match a transaction entered in
another UOM.

## Why is there an ADJ-CST I didn't enter?

**Symptom:** a part's transaction history shows `ADJ-CST` (cost adjustment) rows on days nobody made an
adjustment, sometimes for the full value of a PO receipt.

**Cause:** the part uses standard costing and was received while its standard cost was still zero.

1. At receipt, inventory is valued at the standard cost (zero), so the whole PO price becomes a variance,
   posted as an `ADJ-CST`.
2. Later someone sets the standard cost. Epicor revalues everything on hand at the new standard, which
   writes another `ADJ-CST` for the value of the whole stock.
3. The parts are then issued to jobs at the new, non-zero cost.

The history lists these in `TranDate` order, but they happened in `SysDate` order, which is why they look
out of place. If the issue in step 3 had happened before step 2, the parts would have gone to the job at
zero cost and the job would look far more profitable than it was.

**Prevention:**

- Set standard costs before the first receipt.
- Consider a BPM that blocks inventory transactions for parts with a zero standard cost, with exceptions
  for transaction types where zero is legitimate (non-inventory receipts, sales kits).
- Decide deliberately which GL accounts the two kinds of `ADJ-CST` post to. If both use the same
  account they net out, which hides the problem as well as the noise.

## Finding the most recent receipt

A PO receipt's **Receipt Date** has no time, so when several receipts of the same part arrive on the same
day you can't tell from the receipt which came last. Two ways around it:

- **Purchase Advisor** lists every receipt of a part, most recent first. See
  [Purchase orders: dates, GL accounts and receipts](/processes/purchasing/purchase-orders/).
- Query `PartTran`, which has the system time:

```sql
SELECT TOP (1) pt.PartNum, pt.PONum, pt.PackSlip, pt.TranDate, pt.SysDate, pt.SysTime, pt.TranQty
FROM   Erp.PartTran pt
WHERE  pt.Company = 'EPIC06'
  AND  pt.PartNum = 'PART-1001'
  AND  pt.TranType IN ('PUR-STK', 'PUR-MTL', 'PUR-INS', 'PUR-SUB', 'PUR-UKN')
ORDER BY pt.SysDate DESC, pt.SysTime DESC, pt.TranNum DESC;
```

In a BAQ, sort on `SysDate` then `SysTime` descending and return the top row per part with a subquery or
a ranking calculated field.

## Related pages

- [Job costing and WIP](/processes/jobs-manufacturing/job-costing-and-wip/)
- [Inventory transaction types](/reference/transaction-types/)
- [RMA disposition can't be deleted](/processes/quality-rma/rma-process/#a-disposition-cant-be-deleted-after-posting)

---
title: Job costing and WIP
description: How costs build up on a job, how the Work in Process report splits them into WIP, cost to inventory and cost of sales, why it sometimes shows duplicate labor lines, and how the resource group efficiency figures are calculated.
env: both
sidebar:
  order: 6
---

Every transaction against a job carries a cost. Epicor totals those costs, then decides how much of the
total has already left the job (received to stock or shipped) and how much is still work in process
(WIP). Knowing where each number comes from makes the **Work in Process** report and month-end much
less mysterious.

## Where job costs come from

| Cost bucket | Source rows |
|---|---|
| Material | `PartTran` rows for material issues and receipts to the job: `STK-MTL`, `STK-ASM`, `PUR-MTL`, material adjustments, returns from inspection and DMR |
| Subcontract | `PartTran` rows for subcontract receipts (`PUR-SUB`) and their adjustments |
| Labor | `LaborDtl`: labor hours × labor rate |
| Burden | `LaborDtl`: burden hours × burden rate |

Salvage (`SVG-STK`) *reduces* material cost. Moves out to a DMR (`MTL-DMR`, `SUB-DMR`) also take cost out
of WIP.

Costs leave the job in two ways:

- **Cost to inventory (CTI):** parts received to stock (`MFG-STK`).
- **Cost of sales (COS):** parts shipped straight from the job (`MFG-CUS`), and whatever is left when the
  job is closed.

## How the WIP report splits the costs

**Production Management > Job Management > Reports > Work In Process** calculates, for each open job,
as of a cutoff date:

```text
WIP = to-date cost - (cost to inventory + cost of sales)
```

It works per cost bucket (labor, burden, material, subcontract) and per job detail line (each job
material and each operation), which keeps over- and under-consumption on one line from distorting the
others.

The steps:

1. **Quantity relieved.** Add up quantity shipped from the job (`MFG-CUS`) and quantity received to stock
   (`MFG-STK`) up to the cutoff date.
2. **Shortcuts.**
   - Nothing relieved yet: everything is WIP.
   - Relieved at least the full production quantity (or the completed quantity on a completed job), and
     something has shipped: everything is relieved and WIP is zero.
   - Received to stock but nothing shipped: WIP is reduced by the cost to inventory only; COS is zero.
3. **Otherwise, relieve line by line.** For each material or operation, work out how much *should* have
   been used for the relieved quantity: the line's planned quantity per finished part × quantity
   relieved. That share of the line's actual cost is treated as relieved. If the line has consumed less
   than its standard so far, all of its cost is relieved.
4. **Remove cost to inventory from COS** so a part isn't counted twice.

Because the calculation uses actual quantities against estimates, a job that has consumed more
material or hours than planned keeps the overrun in WIP until it closes. Closing the job pushes whatever
remains to cost of sales or manufacturing variance.

## Capture COS/WIP Activity

The WIP report is a calculation. The GL only changes when **Capture COS/WIP Activity**
(**Production Management > Job Management > General Operations**) runs. Typically it's scheduled
nightly or run at period end.

| Option | Effect |
|---|---|
| **Ending** date | Last date whose transactions are captured |
| **Post Cost of Sales / MFG Variance** | Calculates COS and manufacturing variance on jobs and creates the variance `PartTran` rows |
| **Post to General Ledger** | Sends the captured part and labor transactions through the posting engine to GL journals. Needs the **Inventory** GL interface turned on in Company Configuration |

Once a closed job has been captured, it's flagged `JobHead.WIPCleared` and skipped by later runs,
unless it's reopened or new costs arrive.

To reconcile the GL with these transactions, use the
[Inventory/WIP Reconciliation report](/processes/inventory/transactions-and-reconciliation/).

## Duplicated labor lines in WIP detail

**Symptom:** a WIP or labor detail report shows what looks like the same labor transaction twice for a
job, one line with the full production quantity and one with zero.

**Cause:** labor was reported after the job's **Production Qty** changed. The later labor is costed
against the new quantity, so the job ends up with labor records split across two quantity bases. Jobs
whose quantity changes often show this most.

**Fix:** check the labor records before adjusting anything. If each `LaborDtl` row appears once in the
table, the "duplicate" is a reporting artefact. When you build your own WIP BAQ, group labor by the
`LaborDtl` key rather than joining through quantity fields, so the extra rows don't multiply costs.

**Prevention:** settle a job's production quantity before labor starts, and avoid repeated quantity
changes on jobs already in progress.

## Resource group efficiency

The **Resource Group Efficiency** report summarises labor by resource group for a date range. It's
useful for spotting trends and checking burden rates. The main measures:

| Measure | Formula |
|---|---|
| Setup efficiency | setup earned hours ÷ actual setup hours |
| Production efficiency | production earned hours ÷ actual production hours |
| Efficiency | (setup earned + production earned) ÷ (setup + production hours) |
| Rework % | rework hours ÷ direct hours |
| Coverage % | (direct hours − rework − added-operation hours) ÷ direct hours |
| Performance % | efficiency × coverage |
| Utilization % | direct hours ÷ capacity, where capacity = production days × hours per resource × number of resources |

Percentages are floored at zero and capped at 999.99. The production-day count comes from the production
calendar; if the calendar is missing, the report fails.

:::note
Department totals won't match the **Employee Efficiency** report. Resource group efficiency counts all
hours booked *at* the resource group, whoever worked them. Employee efficiency counts hours by each
employee's home department.
:::

## Related pages

- [Inventory transaction types](/reference/transaction-types/)
- [Inventory transactions and WIP reconciliation](/processes/inventory/transactions-and-reconciliation/)
- [How inventory flows through jobs](/processes/jobs-manufacturing/inventory-flow-through-jobs/)

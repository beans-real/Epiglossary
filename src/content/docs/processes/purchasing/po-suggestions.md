---
title: PO suggestions
description: How Generate Suggestions builds purchase suggestions, sensible settings for a scheduled daily run, how buyers turn suggestions into POs, and what to do when an upgrade breaks the scheduled task.
env: both
sidebar:
  order: 3
---

PO suggestions are Epicor's list of what to buy, when and how much. They're built from time-phased
supply and demand, and buyers review them before converting them to purchase orders. If the suggestions
are stale or wrong, buyers stop trusting them and go back to spreadsheets, so a reliable scheduled run
is worth setting up carefully.

## Where suggestions come from

**Generate Suggestions** (**Material Management > Purchase Management > General Operations > Generate
Suggestions**) looks at:

- Material requirements on jobs (direct job material and job subcontract operations)
- Inventory requirements: minimum on-hand, safety stock and reorder points against time-phased supply
- Requisitions sent to purchasing (these are kept, not rebuilt)
- Unlinked buy-to-order sales order releases
- Purchase contract schedules, if you include contract parts

For lead time it uses the part's (or site's) purchase lead time, falling back to the lead time on the
primary supplier's price list.

**Process MRP** can also create PO suggestions as part of its run. If MRP runs nightly, you may not need a
separate Generate Suggestions run; if purchasing wants fresh suggestions more often than MRP runs, you
do.

## Recommended settings for a scheduled run

| Setting | Suggested value | Why |
|---|---|---|
| **Processing option** | **Regenerative** | Rebuilds all time-phased suggestions, so nothing stale survives. Net change is faster but can leave old suggestions behind |
| **Allow Historical Dates** | Selected | Lets suggestions for late demand keep their real (past) due dates, so buyers can see how late they are, instead of being pushed to today |
| **Include Contract PO Parts** | Selected if you use purchase contracts | Otherwise parts on active contracts are skipped |
| Logging level | Suggestions, overwrite | A readable log of what was created, replaced each run |
| **Process date** | Dynamic, today | So a recurring run always uses the current date |
| **Number of processes** | 2 or 3 | Parallel processing speeds up large runs. Cloud tenants are capped |
| Schedule | Daily, early morning, **Recurring** | Buyers start the day with fresh suggestions |

Only one Generate Suggestions run can happen at a time, so don't schedule it to overlap MRP.

<!-- TODO screenshot: Generate Suggestions with the settings above -->

Run scheduled tasks under a dedicated service user rather than a person's login, so they keep running
when people leave or change passwords.

## Working the suggestions

1. **New PO Suggestions** shows suggestions for new POs, filtered by buyer, site and cut-off date. Buyers
   review quantity, supplier and dates, mark lines **Reviewed**, and generate POs, RFQs or supplier
   forecasts from the selected lines.
2. **Change PO Suggestions** shows suggested changes to existing POs: expedite, delay, increase, reduce
   or cancel.
3. **Buyer Workbench** brings suggestions, RFQs and open POs together in one place for a buyer.

The buyer on a suggestion comes from the part (or part class). Suggestions with no buyer are easy to
miss, so make sure every purchased part has one. See [Buyers and suppliers](/processes/purchasing/buyers-and-suppliers/).

## When suggestions stop after an upgrade

**Symptom:** after an Epicor upgrade, the recurring Generate Suggestions task no longer runs, or errors
immediately, and suggestions go stale.

**Cause:** the scheduled task records from the old version don't match the new one.

**Fix:** delete the recurring task and create it again with the same settings. If the task can't be
deleted from **System Monitor**, Epicor Support has a data fix that removes the orphaned system task
records (`FX_Del_SysTaskTables`). Recreate the schedule afterwards.

**Prevention:** keep a record of every recurring task's settings (screenshots are fine) so they can be
recreated quickly after each upgrade.

## Related pages

- [Buyers and suppliers](/processes/purchasing/buyers-and-suppliers/)
- [Purchase orders: dates, GL accounts and receipts](/processes/purchasing/purchase-orders/)

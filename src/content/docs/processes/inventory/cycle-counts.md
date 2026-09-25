---
title: Cycle counts
description: The cycle count process from period to posting, how to count a single part without running part selection, and how to use that to clear a fractional quantity a quantity adjustment can't fix.
env: both
sidebar:
  order: 3
---

Cycle counting checks a slice of inventory at a time instead of shutting down for a full physical count.
Epicor runs both through the same set of screens: define when, choose which parts, print tags, count,
review variances and post. The postings are quantity adjustments that correct on-hand to what was
counted.

## The standard flow

All screens are under **Material Management > Inventory Management**.

| Step | Screen | What happens |
|---|---|---|
| 1. Define the period | **Setup > Cycle Count Period Definition** | A numbered period (01 to 99 per year) with start and end dates |
| 2. Schedule the count | **General Operations > Cycle Count Schedule Maintenance** | A schedule for one warehouse and period. **Perform Part Selection** picks parts using the warehouse's count method (random or repetitive) and ABC codes |
| 3. Adjust the selection (optional) | **General Operations > Cycle Count Part Selection Update** | Add or remove parts on a cycle |
| 4. Generate and print tags | **Count Cycle Maintenance**, **Generate Tags** and **Print Tags** | One tag per part/bin, plus blank tags for stock found in unexpected places |
| 5. Start the count | **Count Cycle Maintenance**, **Start Count Sequence** | Freezes each part's unit cost and pre-count on-hand quantity, and sets the cycle to *Count Started* |
| 6. Count | **General Operations > Count Tag Entry** | Enter the counted quantity and mark each tag **Returned** |
| 7. Review variances | **Count Cycle Maintenance**, **Count Variance Calculation/Report** | Compares counted with frozen quantities and flags parts outside tolerance |
| 8. Explain out-of-tolerance parts | **General Operations > Count Discrepancy Reason** | A reason code for each out-of-tolerance part |
| 9. Post | **Count Cycle Maintenance**, **Post Counts** | Adjusts on-hand and completes the cycle |

For a full physical inventory, skip steps 1 to 3 and start from **Initialize Physical Inventory**
instead. The rest is the same.

:::tip
Run **Start Count Sequence** when nobody is transacting in that warehouse. It briefly blocks inventory
activity while the snapshot is taken, and any movement between the snapshot and the count shows up as a
variance.
:::

## Why Post Counts posts nothing

**Post Counts** skips a part when:

- any of its tags hasn't been marked **Returned**;
- the variance report hasn't been run since the counts were entered;
- it's out of tolerance and has no discrepancy reason code.

Fix whichever applies, run the variance report again, and post.

## Counting a single part

Sometimes you need to count one or two parts right now without a full selection run. You can build a
cycle by hand:

1. **Cycle Count Period Definition**: create a period whose start and end are today.
2. **Cycle Count Schedule Maintenance**: create a schedule for the warehouse and that period. Save, but
   **don't** run **Perform Part Selection**.
3. **Cycle Count Part Selection Update**: open the new cycle, add a line for each part to count, and
   save.
4. **Count Cycle Maintenance**: open the cycle, **Generate Tags**, **Print Tags**, then **Start Count
   Sequence**.
5. **Count Tag Entry**: select all tags for the cycle, enter quantities, tick **Returned**, enter who
   counted, and save.
6. **Count Cycle Maintenance**: run **Count Variance Calculation/Report**, then **Post Counts**.
7. If posting reports no parts, enter a reason code in **Count Discrepancy Reason** and post again.

:::caution
Period numbers run from 01 to 99 per year. Each ad-hoc single-part count uses one, so practising this in
production can exhaust the year's periods, after which you can't create new cycles until the next year.
Rehearse in a test copy of the database.
:::

In recent versions the part selection screen is labelled **Cycle Count Part / PCID Selection Update**.

## Fixing a fractional quantity in a whole-number UOM

**Symptom:** a part stocked in a whole-number UOM (for example `EA`) shows a fractional on-hand such as
20.5, and **Quantity Adjustment** won't let you remove the 0.5 because the UOM doesn't allow decimals.

**Cause:** a conversion or an old transaction left a fraction in the bin. The quantity adjustment screen
validates the adjustment quantity against the UOM's rounding, so it can't enter the fraction needed.

**Fix:** use a single-part cycle count as above and count the bin as **0**. Posting the count writes an
adjustment for the full on-hand, fraction included. Then add the correct whole quantity back with a
normal quantity adjustment (or count the real quantity directly if you're confident in it).

## Related pages

- [Negative inventory and on-hand problems](/processes/inventory/negative-inventory/)
- [Inventory transaction types](/reference/transaction-types/)

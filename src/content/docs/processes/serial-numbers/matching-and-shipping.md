---
title: Serial matching and shipping
description: Link component serials to the parent they were built into at the right point in the job, and fix the errors that stop matching or shipping serialized jobs.
env: both
sidebar:
  order: 4
---

**Serial matching** records which component serial numbers went into which parent serial number. It's
what lets you open a finished unit's serial months later and see every serialized part inside it. It
is also the step most likely to go wrong, because it only works at a certain point in the job.

## Where matching happens

There are two places to match:

- **At job receipt.** With full lower-level tracking, receiving a serialized job (for example in **Job
  Receipt to Inventory**) asks for the component serials that went into each parent serial as part of
  the receipt. This is the flow Epicor expects: matching happens as the finished unit leaves the job.
- **In Serial Matching.** The **Serial Matching** screen lets you match before receipt, or fix
  matching afterwards. Enter a parent serial that belongs to a job and it works in *job mode*, offering
  only component serials issued to that job; enter one with no job and it works in *serial mode*.

The site's **serial matching warning** setting decides whether unmatched components at receipt are
ignored, warned about or block the receipt.

## The order that works

1. Assign parent serials to the job (**Serial Number Assignment**, or at the serial-required
   operation).
2. Issue the serialized components to the job, selecting their serials. They now show as WIP on the
   job.
3. **Match** components to parents, in **Serial Matching** or during job receipt.
4. Receive the finished units to inventory (or ship them from the job).

The rule to remember: **match while the component serials are still in WIP.** Once they have moved to
**Consumed** without being matched, they no longer appear as available to match.

## Available to Match shows nothing

**Symptom:** in **Serial Matching**, on the **Available to Match** tab for a material, **Retrieve**
returns no serial numbers, even though the components were issued with serials. The job can't be
closed, or its demand filled, because matching isn't complete.

**Cause:** labor was reported before the matching was done, and the component serials changed from
WIP to **Consumed**. Consumed serials aren't offered for matching.

**Fix:**

- **If you can, recall the labor.** Reversing the labor transactions returns the component serials to
  WIP. Match them, then re-enter the labor.
- **If the labor can't be recalled:**
  1. In **Serial Number Maintenance**, change each affected component serial from Consumed back to
     WIP. Make sure **Fully Matched** is *not* selected.
  2. In **Serial Matching**, go to the material's matching details, enter the component serial number
     and click **Unmatch** to clear any partial link.
  3. Retrieve on **Available to Match** again, select the serials and match them normally.

**Prevention:** make matching part of the routine before the completing labor is reported, or rely on
matching at job receipt, and train the people reporting labor on that order.

## A serialized job won't ship

**Symptom:** shipping a serialized part from a job, or from stock, fails because serial numbers are
needed, and none are offered when you try to select them.

**Cause:** the serials the shipment needs were never created or never reached the right status. Two
common reasons:

- The job's method has **Serial Numbers Required From This Operation** on an operation, and the units
  were completed there without serials being recorded, or the flag is on the wrong operation.
- Nobody assigned serials to the job at all, so there's nothing for the shipment to pick.

**Fix:**

1. Check which operation on the job has **Serial Numbers Required From This Operation** selected, and
   whether labor at that operation recorded serial numbers.
2. Check the job's serials in **Serial Number Assignment** or the **Serial Number Tracker**.
3. Assign or correct the serials, then return to the shipment line and use the **Serial Numbers**
   button to retrieve and select them.

## Related

- [How serial tracking works](/processes/serial-numbers/serial-number-logic/): statuses and the
  serial-required operation flag
- [Troubleshooting serial numbers](/processes/serial-numbers/troubleshooting/)

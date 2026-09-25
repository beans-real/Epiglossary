---
title: Troubleshooting serial numbers
description: Trace what happened to a serial number, and fix overridden masks, wrong prefixes, serials on the wrong job, and statuses that block the next transaction.
env: both
sidebar:
  order: 6
---

Serial number problems nearly always come down to a serial being in the wrong status, on the wrong
job, or in the wrong format. Start by finding out what happened to it, then undo or redo the right
transaction.

## First: find out what happened

- The **Serial Number Tracker** shows a serial's current status and location, its transaction history
  and, on the lower-level serials tab, the component serials matched to it.
- For anything the tracker doesn't make clear, query the `SNTran` table. It holds a row for every
  serial number transaction, so filtering it by part and serial number and sorting by date shows the
  whole story. `SerialNo` holds the current state.

Knowing the last transaction tells you which one to reverse.

## A user overrode the mask and broke the sequence

**Symptom:** a serial number on a part doesn't follow the part's format, and the numbers generated
afterwards clash with it or no longer run in order.

**Cause:** in **Serial Number Assignment**, users can type their own serial number instead of taking
the one generated from the mask. The mask's sequence carries on independently, so the typed number sits
outside it, or collides with a number the mask produces later.

**Fix:** if the serial hasn't been fully processed, walk it back and remove it:

1. In **Serial Number Assignment**, open the job, open the serial number selection and move the serial
   from **Selected** back to **Available**.
2. If no labor has been posted against it, this deletes it outright. If labor has been posted, it's
   left with the status Unassign.
3. Delete the leftover serial in **Serial Number Maintenance** if it is still there, then assign a
   correctly generated one.

**Prevention:** add a **validation** mask to the part so typed serials must match the format, and
train users to use the generate option. See
[Serial number masks and prefixes](/processes/serial-numbers/masks-and-prefixes/#two-kinds-of-mask).

## New serials have the wrong prefix

**Cause:** the part's site record still holds an old serial prefix, often carried over from earlier
setup.

**Fix:** correct `SNPrefix` on the affected parts' site records, in bulk with a **Part Plant** DMT
update. See [Fixing prefixes in bulk with DMT](/processes/serial-numbers/masks-and-prefixes/#fixing-prefixes-in-bulk-with-dmt).
Existing serials keep their numbers.

## A serial was assigned to the wrong job

**Fix:** in **Serial Number Assignment** for the wrong job, move the serial back from **Selected** to
**Available**:

- With no labor posted against it, the serial is deleted completely. Recreate it on the right job, by
  typing it in if you need the same number.
- With labor already posted, it becomes **Unassign**. Open the right job in **Serial Number
  Assignment**, type the serial number in and select it to reassign it.

## A serial is in the wrong status

**Cause:** a transaction was done out of order, reversed partly, or done without the serials that
should have gone with it.

**Fix:** put it right with the transaction that normally sets the status you want, rather than editing
the status directly:

| Serial is | Should be | Do this |
|---|---|---|
| Inventory | WIP | Issue it to the job |
| WIP | Inventory | Return the material to the warehouse |
| Inspection | Inventory | Complete it in inspection processing |
| Consumed | WIP or available | Unmatch it in **Serial Matching** (see [matching](/processes/serial-numbers/matching-and-shipping/#available-to-match-shows-nothing)) |
| Shipped | Inventory | Reverse the shipment |
| DMR | Anything else | Disposition it in DMR processing |

Editing the status in **Serial Number Maintenance** is a last resort, for cases like the matching fix
where no reversing transaction exists.

## Matching or shipping problems

- **Available to Match is empty**, or a serialized job **won't ship**: see
  [Serial matching and shipping](/processes/serial-numbers/matching-and-shipping/).

---
title: How serial tracking works
description: The site-level tracking options, lower-level tracking and matching warnings, serial number statuses, and the rules that decide when Epicor asks for a serial number.
env: both
sidebar:
  order: 2
---

Epicor's serial number behavior is driven by a few settings made once per site and per part. Knowing
what they do explains most of what users experience: why a screen suddenly demands serial numbers, why
a serial disappears from a list, and why the order of transactions matters.

## Settings that control tracking

### Site: how much to track

In **Site Configuration**, on the serial tracking settings for inventory, each site chooses one of:

| Option | Epicor asks for serials… | Suits |
|---|---|---|
| **Full Serial Tracking** | On every transaction for a serialized part: receipts (purchase, transfer, job, RMA), adjustments, counts, issues, moves and shipments | Sites that need full traceability inside the building |
| **Outbound Serial Tracking Only** | Only when the part ships, to a customer or on a transfer order | Sites that only need to know which serial went to which customer |
| **No Serial Tracking** | Never | Sites that don't serialize |

A separate **Record Serial Numbers on Inventory Move** setting decides whether moving a serialized
part between bins in the same warehouse also needs serials. Moves outside that always do.

### Site: components inside assemblies

The **lower level** serial tracking option decides whether Epicor keeps the parent/child link between
a finished unit and the serialized components built into it:

- **Full lower level tracking:** when you receive a serialized job, Epicor looks for serialized
  materials on the job and asks which component serials went into each parent serial.
- **Outbound only:** the component serials are asked for when the product ships.
- **None:** no component link is required (you can still record one in **Serial Matching**).

The **serial matching warning** setting decides what happens when components aren't matched at job
receipt: no warning, a warning you can override, or a hard stop until everything is matched.

### Part: is it serialized?

A part is serialized when **Track Serial Numbers** is selected in **Part Maintenance**. Its serial
format (the mask or prefix used to generate numbers) is set from the same screen. See
[Serial number masks and prefixes](/processes/serial-numbers/masks-and-prefixes/).

### Operation: from when does the job need serials?

On a job or part method, an operation can have **Serial Numbers Required From This Operation**
selected. From the moment that operation is completed, every later transaction for the job's parts
needs serial numbers: the labor that completes it asks for the serials of the units being finished,
and so do receipts and shipments after it.

Put the flag on the operation where a unit first becomes identifiable, typically where the serial
plate or label is applied.

## Serial number statuses

Every serial number has one status at a time. The ones you'll meet most:

| Status | Meaning |
|---|---|
| `WIP` | Assigned to a job in progress (either a parent being built or a component issued to it) |
| `Inventory` | In stock, available to issue, pick or ship |
| `Consumed` | Built into a parent through serial matching, or issued to a job where no matching is done |
| `Picked` / `Packed` | On a customer order, being prepared for shipment |
| `Shipped` | Shipped to the customer |
| `Inspection` / `DMR` / `Rejected` | Held in inspection, on a DMR, or rejected |
| `Unassign` | Taken off a job after activity had already been recorded against it |
| `Adjusted` / `Misc-Issue` | Adjusted out of stock, or issued as a miscellaneous issue |

The status is what makes serial problems feel stubborn. Screens only offer serials in the status they
expect: **Available to Match** only shows component serials that are still in WIP on the job; a
shipment only offers serials in inventory (or on the job, for shipments from a job).

:::tip[Fix statuses with transactions, not by editing]
**Serial Number Maintenance** lets you change a status in some cases, but the clean fix is to reverse
or redo the transaction that set it: return material to put a serial back in inventory, reverse a
shipment, unmatch in **Serial Matching** to undo Consumed. That keeps the history in `SNTran` honest.
:::

## Where serial numbers come from

Serials can be generated or entered at:

- **Purchase receipts** and **transfer order receipts**
- **Jobs**: in **Serial Number Assignment** before or during production, or at labor for the
  serial-required operation
- **Job receipts** to inventory, to another job or to salvage
- **Quantity adjustments** and **cycle counts**
- **RMA receipts**
- **Customer shipments**, when the site tracks outbound only

## Design considerations

- **Customer-supplied serials.** If the customer supplies the serial numbers and the parent and its
  components carry the *same* number, the relationship is already obvious from the numbers. Ask
  whether you need lower-level matching at all before building a process around it.
- **Uniqueness.** Masks can build serials from several elements (prefix, sequence, date, part number).
  The more of them you use, the easier it is to keep serials unique across parts and sites, and the
  longer the numbers get. Decide on the format before go-live; changing it later is painful.
- **Match at the right time.** Matching has to happen while component serials are still in WIP. See
  [Serial matching and shipping](/processes/serial-numbers/matching-and-shipping/).

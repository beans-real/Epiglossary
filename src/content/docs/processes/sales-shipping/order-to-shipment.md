---
title: Order to shipment
description: How a sales order becomes a packed, freighted and shipped pack in Customer Shipment Entry, what each pack status means, why order changes don't reach an existing pack, and how master packs and early-shipment checks fit in.
env: both
sources:
  - title: "EpiUsers: Changes to SO in Order Entry do not carry over to Customer Shipment Entry"
    url: https://www.epiusers.help/t/changes-to-so-in-order-entry-does-not-carry-over-to-customer-shipment-entry/123402
sidebar:
  order: 2
---

A sales order says what the customer wants and when. Getting it out of the door involves supply (stock or
a job), a pack in **Customer Shipment Entry**, often a carrier manifest, and finally an invoice. This page
walks through the flow and the places it commonly trips up.

## The flow

1. **Order entry.** Sales enters the order in **Sales Order Entry**: lines (part, quantity, price) and
   releases (ship date, ship-to, ship via, quantity per date).
2. **Supply.** Each release is filled from stock, or linked to a job (make direct) whose output ships
   straight from WIP. See [The job lifecycle](/processes/jobs-manufacturing/job-lifecycle/).
3. **Pick and pack.** Shipping creates a pack (packing slip) in **Customer Shipment Entry** and adds lines
   from the order's releases, from stock or from the job.
4. **Freight.** If you use a manifest system (such as a Quick Ship integration) the pack is freighted: the
   carrier assigns tracking numbers and charges.
5. **Stage and ship.** The pack is marked **Shipped**, either directly or in batches through **Stage Ship
   Confirm Entry**. This writes the inventory transactions (`STK-CUS` from stock, `MFG-CUS` from a job).
6. **Invoice.** Shipped packs are pulled into an AR invoice group in **AR Invoice Entry** and posted.

## Pack statuses

| Status | Meaning | How it gets there |
|---|---|---|
| **Open** | Being packed; lines can change | New pack, or reopened |
| **Closed** | Packing finished, ready to freight | Close the pack |
| **Freighted** | Sent to the manifest system; has tracking and charges | **Freight** action (manifest-enabled workstation) |
| **Staged** | Waiting in a staging area to be confirmed shipped | **Stage** action, with a stage name |
| **Shipped** | Out of the door; inventory relieved | **Shipped** check box, or **Ship Confirm** in Stage Ship Confirm Entry |

**Unfreight** reverses **Freight** (Freighted back to Closed) and removes the tracking and charges from
the manifest. **Unstage** in Stage Ship Confirm Entry takes a pack back out of a stage. If a pack gets stuck
between these states, see [Freight and Quick Ship errors](/processes/sales-shipping/freight-and-quick-ship-errors/).

## Order changes don't reach an existing pack

**Symptom:** sales changes the ship via, billing type, address or other shipping details on the order,
but the pack shipping has already created still shows the old values. Freighting then fails or uses the
wrong carrier details.

**Cause:** the pack (`ShipHead`) copies these values from the order (`OrderHed`, `OrderRel`) when it's
created. After that it's an independent record; later order changes don't flow to it.

**Options:**

1. **Update the pack** with the same change. Simple, but shipping has to know a change was made.
2. **Delete and recreate the pack** so it picks up the current order values.
3. **Sync with a BPM.** A post-processing directive on the order's save can find open, unshipped packs
   for that order and update the matching fields on `ShipHead`. Only touch packs that aren't freighted or
   shipped. See [Update other records from a BPM](/platform/bpm/updating-other-records/).
4. **Get it right up front.** A BPM that refuses to save an order release without a valid ship via and
   billing details means shipping never inherits bad data. See
   [Messages and exceptions](/platform/bpm/messages-and-exceptions/).

Which one fits depends on who owns shipping decisions. If sales routinely picks a generic "best way"
and leaves carrier choice to shipping, option 1 is normal. If sales is supposed to choose the exact
service, options 3 and 4 enforce it.

## Master packs

**Master Pack Shipment Entry** groups several packs into one shipment, so they can be freighted and
shipped together. A master pack has one shipment type (sales order, transfer, subcontract or
miscellaneous) and only accepts packs of that type.

A practical use: make each master pack a truck or pallet going out, with the individual customer packs
on it as its members. The master pack gets the freight and tracking; each pack keeps its own lines and
invoice.

Whether you freight individual packs or master packs is set per workstation (the manifest weight capture
point: **Pack ID**, **Master Pack** or **Both**). On a master pack, **Freight Pack IDs Individually**
sends each pack to the manifest as its own container.

## Stopping early shipments

Epicor doesn't block shipping a release before its ship date. If customers penalise early deliveries,
two approaches work:

- **Flag and block.** Add a check box (a UD field) on the order release, such as *Do not ship early*.
  A BPM on shipment save refuses to ship a flagged release more than a set number of days before its
  ship-by date.
- **Report instead of block.** A dashboard of packs shipped before their release's ship date, reviewed
  weekly, catches the habit without stopping urgent shipments.

## Completed but not shipped

A common report compares what jobs have finished with what has shipped:

- **Make to stock:** completed quantity is received to a bin (`MFG-STK`), so on-hand for finished goods
  already tells you what's waiting.
- **Make to order:** completed quantity stays on the job until shipped. Join the job's demand link to the
  order release (`JobProd` to `OrderRel`), then to shipment lines (`ShipDtl`), and compare
  `JobHead.QtyCompleted` with quantity shipped.

## Related pages

- [Freight and Quick Ship errors](/processes/sales-shipping/freight-and-quick-ship-errors/)
- [Customer part numbers and order data](/processes/sales-shipping/customer-parts-and-order-data/)
- [Inventory transaction types](/reference/transaction-types/)

---
title: Customer part numbers and order data
description: How Customer Part Cross Reference feeds sales orders (and why an order line can show the wrong description), using attributes instead of UD fields, retiring ship-to addresses, and the Invalid Prc Con Num error.
env: both
sources:
  - title: "EpiUsers: How to make a ShipTo address inactive/active"
    url: https://www.epiusers.help/t/how-to-make-a-shipto-address-inactive-active/53580
sidebar:
  order: 4
---

Customer master data shapes every sales order: which part number the customer quotes, what description
prints on their paperwork, and where it ships. This page covers the customer-side records that most
often surprise people.

## Customer part cross reference

Customers often have their own part numbers. **Customer Part Cross Reference** (**Sales Management >
Order Management > Setup > Customer Part Cross Reference**) maps a customer's part number (and optionally
revision and description) to your internal part.

1. Choose the customer.
2. Select **New**, pick your internal part, and enter the **Customer Part Number**, **Customer
   Revision** and **Description**.
3. Save.

Order entry can then accept either number. The customer's number is stored on the order line
(`OrderDtl.XPartNum`), prints on customer-facing documents, and is available for BAQs. In the cross
reference table itself (`CustXPrt`) the customer's number is also `XPartNum`. The customer part shown in
**Part Maintenance** reads from the same cross reference.

## "The order line shows the wrong description"

**Symptom:** a part added to a sales order line comes in with a description that doesn't match **Part
Maintenance**.

**Cause:** the customer has a cross reference for that part, and the cross reference has its own
description. For that customer, the cross reference description is used instead of the part master's.
It's a separate copy, so changing the part description later doesn't update it.

**Fix:** update the description on the customer's cross reference record (or clear it if you want the
part description). Existing order lines keep what they were given; edit them if needed.

**Prevention:** when you rename a part, check `CustXPrt` for cross references with their own
descriptions and decide whether to update them too.

## Attributes instead of UD fields

Customers and suppliers can carry **Attributes**: user-defined characteristics (for example *ISO
certified* or *Requires CoC*) selected from a list you maintain. Attributes are stored as related records,
so you get extra classification without adding UD columns to the database, and they're available to BAQs
and reports. Use UD fields when you need a typed value on the record itself; use attributes for tags.

## Retiring a ship-to address

Old ship-to addresses clutter order entry, but deleting them isn't allowed once they've been used. Older
versions had no way to mark a ship-to inactive, so the usual workarounds were renaming it (prefixing
the name with something like "DO NOT USE") or a BPM that hides it from ship-to lists
([Filter and extend list results](/platform/bpm/customize-list-results/)). Epicor announced an
**Inactive** option for ship-to records for Kinetic 2023.2; if your version has it, use that.

## "Invalid Prc Con Num" when changing an order

**Symptom:** saving a change to an existing sales order fails with an *Invalid Prc Con Num* error.

**Cause:** the order header points at a customer contact number that is no longer valid, so validation
fails on every save.

**Fix:** Epicor Support provides a data fix for this, `FX_Upd_OrderHed_ShpConNum_to0`, which (as its name
says) resets the ship-to contact number on the order header to zero. Request it through a support case
rather than editing the table yourself, then pick the correct contact on the order again.

## Related pages

- [Order to shipment](/processes/sales-shipping/order-to-shipment/)
- [Methods, revisions and mass changes](/processes/jobs-manufacturing/methods-and-revisions/) for
  tracking customer drawing revisions
- [Auto-number customer and supplier IDs](/platform/bpm/auto-numbering-ids/)

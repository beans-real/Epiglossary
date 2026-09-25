---
title: Buyers and suppliers
description: Set up buyers with PO limits, approvers and authorized users, set up suppliers so their POs, receipts and payments behave, and fix the supplier price update error.
env: both
sidebar:
  order: 2
---

Two setup records drive most of purchasing: the **buyer**, who is allowed to spend money, and the
**supplier**, who is paid for it. Getting them right up front avoids blocked POs, missing suggestions and
invoices that don't show up for payment.

## Buyers

A buyer is a person who can place purchase orders. Buyers appear on POs, filter PO suggestions and are
assigned to parts and part classes.

**Material Management > Purchase Management > Setup > Buyer**

1. Enter a **Buyer ID**. It's used in searches, filters and reports, and can't be changed later, so pick
   a stable code rather than a person's initials if people change roles often.
2. Link the buyer to a person/contact record. If none exists, entering the name and details creates one.
3. Set the **PO Limit**: the largest PO total this buyer can approve on their own. Zero means no limit.
4. Choose the **Approval Person**. POs over the limit go to them for approval.
5. Select **Sync Name** and **Sync Email** so the buyer record follows changes to the person/contact.
6. Save.

**Authorized users** are system users allowed to buy on this buyer's behalf. Add them from **New >
Authorized User**. The buyer themselves must be a system user and be added as an authorized user of
their own Buyer ID; anyone else you add can then buy as that buyer. The approval person also needs a
user account.

If you use consolidated purchasing across companies, create matching buyer records in each company.

## Suppliers

Suppliers live in the `Vendor` table (the UI says supplier, the database says vendor; `VendorNum` is the
internal key and `VendorID` the code users see). Create them in **Supplier Maintenance**.

| Setting | Why it matters |
|---|---|
| **Group** | Groups suppliers for reporting and defaults. Create groups in **Supplier Group Maintenance** first |
| **Approved** | Parts with approved-supplier rules can only be bought from approved suppliers. Approval can be by part, part class, operation or customer |
| **Terms** | Due dates and discounts on AP invoices |
| **Payment Method** | Which AP payment groups the supplier's invoices appear in. See [AP payments](/processes/finance/ap-payments/) |
| **Bank/Remit To** | Needed for electronic payments. An EFT payment fails if the supplier has no bank record |
| **Inspection Required** | Sends receipts from this supplier to inspection |
| **Tax Liability** | Default tax for the supplier's invoices |

Extra facts about a supplier that don't warrant a UD field can go in **Attributes**, which work the same
way for customers. See [Customer part numbers and order data](/processes/sales-shipping/customer-parts-and-order-data/).

If you need supplier IDs assigned automatically, see
[Auto-number customer and supplier IDs](/platform/bpm/auto-numbering-ids/).

## "Company configuration does not allow this supplier price update"

**Symptom:** a receipt, or a REST call that updates a received price, fails with:

```text
Company configuration does not allow this supplier price update.
```

**Cause:** the receipt is changing the unit price from what's on the PO, and the company isn't set up to
allow that.

**Fix:** in **Company Configuration**, go to **Modules > Materials > Shipping Receiving** and select
**Allow update of Supplier Price when Receiving**. Set the percentage and monetary tolerances at the same
time, and whether exceeding them should stop or warn.

Once allowed, the price entered at receipt is used for everything downstream: costing, invoicing,
accounting and stock and job values.

## Related pages

- [PO suggestions](/processes/purchasing/po-suggestions/)
- [Purchase orders: dates, GL accounts and receipts](/processes/purchasing/purchase-orders/)

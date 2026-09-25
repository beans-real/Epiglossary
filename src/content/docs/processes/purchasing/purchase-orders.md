---
title: "Purchase orders: dates, GL accounts and receipts"
description: What PO due and promise dates really mean, how to handle supplier transit time, where a PO release's GL account comes from, how Purchase Advisor helps, and how receipts and inspection fit in.
env: both
sources:
  - title: "EpiUsers: Vendor's ship date vs PO due date"
    url: https://www.epiusers.help/t/vendors-ship-date-vs-po-due-date/112464
  - title: "EpicCare knowledge base: PO release GL account defaulting"
    url: https://epiccare.epicor.com/epiccare?id=epiccare_kb_article&sys_id=bf342c0947f84e90f7c0d758436d4368
sidebar:
  order: 4
---

A purchase order has a header, lines (what you're buying and at what price) and releases (how much
arrives when, and where it goes). Most PO questions are really about the release: its dates, its **Buy
For** setting and the GL account that follows from it.

## The PO flow

1. A buyer creates the PO in **Purchase Order Entry**, either by hand or from
   [PO suggestions](/processes/purchasing/po-suggestions/).
2. If the total exceeds the buyer's PO limit, it goes to the approval person.
3. The approved PO is printed or emailed to the supplier. The supplier confirms, and the buyer can record
   a promise date.
4. Goods arrive and are received in **Receipt Entry** against the packing slip: to stock (`PUR-STK`), to a
   job (`PUR-MTL`, `PUR-SUB`) or to inspection (`PUR-INS`).
5. The supplier's invoice is matched to the receipt in **AP Invoice Entry**.

## Due date vs promise date

| Field | Meaning in Epicor |
|---|---|
| **Due Date** | The date you need the goods *received* |
| **Promise Date** | The date the supplier has promised to *ship* |

Time-phased planning, MRP and late-PO reports use the due date. Suppliers often read "due date" on a PO
as the date they must ship, so goods arrive a day or two after Epicor expects them, and time-phase shows
the stock as available when it isn't.

Ways to handle transit time:

- **Treat the due date as the dock date and say so.** Change the PO form so the column reads something
  like "Required delivery date", and add a note that dates are delivery dates at your site. Measure
  supplier on-time performance against receipt date vs due (or promise) date, so the incentive matches.
- **Pad the part.** Add transit days to the part's purchasing lead time, or use **Receive Time** so
  planning asks for goods earlier. This fixes planning for everyone buying that part, but inflates lead
  times on parts bought from local suppliers.
- **Buyer judgment for ad hoc buys.** For catalogue or next-day suppliers, the buyer picks a shipping
  method that gets goods in by the due date.

Entering a promise date on the release doesn't change planning; time-phase still looks at the due date.

## Where the GL account on a release comes from

The GL account is on the release. How it's set depends on **Buy For**:

| Buy For | Account chosen from (first one found) | Editable? |
|---|---|---|
| **Other** (non-inventory) | Part class on the line, then the supplier's expense account, then the supplier's AP expense account, then the company AP expense default | Yes |
| **Inventory** | The part's expense account, then its part class, then the company inventory default. A GL division on the warehouse is applied if possible | No |
| **Job Material** | WIP material account on the job's product group, then the company WIP material default | No |
| **Subcontract Operation** | WIP subcontract account on the job's product group, then the company WIP subcontract default | No |

For anything except **Other**, the account is read-only; use **Get Default** to see it. If the
**Inventory** GL interface is turned off, the field stays editable for every option.

## Purchase Advisor

**Purchase Advisor** answers the quick questions about a purchased part in one place: have we bought it
before, is any on order, is any on hand, who are the approved suppliers, and is there a price list. Its
receipts view lists every receipt of the part, most recent first, which is the easiest way to see which
of several same-day receipts came last (the receipt date alone has no time). For doing that in a query,
see [Finding the most recent receipt](/processes/inventory/transactions-and-reconciliation/#finding-the-most-recent-receipt).

## Receipts and inspection

- Parts, part classes or suppliers flagged **Inspection Required** are received to inspection. Stock
  isn't available until **Inspection Processing** passes it. Failed quantity goes to a DMR.
- Once a receipt has passed inspection, it can't simply be reversed. See
  [Reversing a receipt after inspection](/processes/quality-rma/nonconformance-and-inspection/#reversing-a-receipt-after-inspection).

## "Cannot close part: there is an open PO"

**Symptom:** you try to inactivate or close a part and Epicor refuses because a purchase order is still
open for it.

**Fix:** find the PO in **Purchase Order Entry** or **Purchase Order Tracker** by searching or filtering
on the part number (or use Purchase Advisor's open-orders view). Receive the remaining quantity, or
close the release or line, then retry.

## Related pages

- [Buyers and suppliers](/processes/purchasing/buyers-and-suppliers/)
- [Nonconformance and inspection](/processes/quality-rma/nonconformance-and-inspection/)
- [Inventory transaction types](/reference/transaction-types/)

---
title: Invoice tax and customer credit
description: Change or remove tax on an invoice that's already posted, tax on advance billing, and how Customer Credit Manager's credit totals, including the global credit total, are calculated.
env: both
sidebar:
  order: 4
---

Two finance questions that come up regularly: how to fix tax on an invoice that has already posted, and
where the numbers in **Customer Credit Manager** come from.

## Changing tax on a posted invoice

**Symptom:** an invoice posted with the wrong tax, or with tax that shouldn't apply, and the tax fields
are now read-only.

**Cause:** posted invoices can't be edited. Their GL entries are final, so any correction has to be a new
document.

**Fix:** reverse the invoice and enter it again correctly.

1. Reverse the posted invoice.
   - **AR:** in **AR Invoice Entry**, open a group and use **Create Cancellation Invoice** from the
     **Overflow** menu. Epicor creates a credit memo that mirrors the original lines, including tax.
   - **AP:** enter a cancelling document for the same amounts against the supplier invoice (a debit memo,
     or a cancellation invoice where your version offers one).
2. Post the reversal.
3. Enter a new invoice. On the header, set the **Tax Liability** to the right one (or to an exempt
   liability). If no exempt liability exists, remove the tax lines instead.
4. Post the new invoice and, if needed, apply the reversal and the new invoice against each other.

**Prevention:** set the tax liability and exemptions on the customer, supplier and ship-to records, so
new invoices default correctly.

## Tax on advance billing

Advance billing lets you invoice a customer part of an order before it ships. Whether tax is charged on
that advance is controlled by a setting; when it's on, invoices can apply tax to advance billing lines
rather than waiting for the shipment invoice.

## Customer credit totals

**Customer Credit Manager** (**Financial Management > Accounts Receivable > General Operations >
Customer Credit Manager**) shows a customer's credit position: open orders, open invoices, credit
limit, aging and whether they're on credit hold. From here you can put the customer, or some of their
orders, on hold.

- Credit is checked on the **bill-to** customer: the one who pays the invoices. If a customer is billed
  to a head office or another customer, it's that bill-to customer's credit that counts.
- To recalculate every customer's credit figures (for example after a data load), run **Mass Credit
  Information Update**.
- Putting a customer on hold manually offers to put their open orders and miscellaneous invoices on
  hold too. Company Configuration decides whether credit hold only warns or actually stops new orders
  and shipments.

### Global credit

With External System Integration (multi-company), the credit manager also shows a **global** position
across all the companies and sites that share the customer. The figures are stored in the `GlbCustCred`
table:

```text
Global credit total = GlbCustCred.SOTotal + GlbCustCred.ARTotal
```

That is, open sales order value plus open receivables across the companies. **Include Open Order in
Global Credit** decides whether the order part is counted. A BAQ on `GlbCustCred` joined to `Customer`
is the quickest way to list customers close to their global limit.

## Related pages

- [AP payments, ACH and remittance advice](/processes/finance/ap-payments/)
- [RMA process](/processes/quality-rma/rma-process/) for credit memos from returns

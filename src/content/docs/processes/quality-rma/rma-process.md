---
title: RMA process
description: The customer return flow from RMA to receipt, inspection, disposition and credit memo, who does each step, and what to do when a disposition has already posted to the GL.
env: both
sources:
  - title: "Spiceworks Community: Epicor 9 RMA process"
    url: https://community.spiceworks.com/t/epicor-9-rma-process/597558/2
sidebar:
  order: 3
---

A Return Material Authorization (RMA) is the record that controls a customer return. It doesn't
create credits, replacement orders or rework jobs by itself. It's the thread that ties together what
customer service agreed, what receiving got back, what inspection decided and what accounting credits.

## The flow

| Step | Who | Screen |
|---|---|---|
| 1. Create the RMA | Customer service | **RMA Processing** |
| 2. Send the RMA form to the customer | Customer service | **RMA Processing**, **Print RMA Form** |
| 3. Receive the goods | Receiving or customer service | **RMA Processing**, receipts |
| 4. Inspect and disposition | Quality | **Inspection Processing** (with QA) or **RMA Disposition** |
| 5. Request a credit | Customer service | **RMA Processing**, credits |
| 6. Issue the credit memo | Accounts receivable | **AR Invoice Entry** |

## 1. Create the RMA

Open **RMA Processing** (**Sales Management > Order Management > General Operations**), or start one
from another screen such as Customer Tracker or Case Management.

1. Enter the date and the customer (bill-to and ship-to).
2. Add lines. The fastest way is **Create Lines from Order/Invoice/Pack** from the **Overflow** menu,
   which copies part, quantity and prices from the original document. You can also add lines manually.
3. Give each line a **Reason** code and a comment explaining the problem. For serial-tracked parts,
   pick the serial numbers that were shipped.

:::tip
Reference the original **invoice** where you can. The credit request later defaults its amounts from
that invoice, which saves accounting from looking prices up.
:::

## 2. Tell the customer

Print the RMA form (to PDF or email) and ask the customer to send it back with the goods, so receiving
can match the parcel to the RMA.

You *can* raise the credit request now, but it's usually better to wait until the goods are back and
inspected. If you only need to issue a credit with no physical return, a case in **Case Management** is
often a better fit than a "credit only" RMA.

## 3. Receive the return

In **RMA Processing**, add a receipt for each line: quantity, warehouse and bin, lot and serial numbers.
If you use Quality Assurance, receive into an inspection location. The receipt records the date and
writes an `RMA-INS` transaction: the quantity waits for a disposition and has no GL effect yet.

## 4. Inspect and disposition

What happens to the returned parts is decided by a disposition. One receipt can have several
dispositions, for example some back to stock and some scrapped.

- **With the Quality Assurance module:** RMA receipts waiting for inspection appear in **Inspection
  Processing**. Choosing one there opens the disposition. Failed parts go to a DMR. See
  [Nonconformance and inspection](/processes/quality-rma/nonconformance-and-inspection/).
- **Without QA:** use **RMA Disposition**. Find the open receipts, select one and create a disposition.

For each disposition choose **Dispose To** (stock, a job for repair, or failed), the quantity, the reason
and the inspector, and the warehouse and bin. If you don't use the material queue, clear **Request
Move** so the parts go straight to the bin.

:::tip
In Classic, a named search for open dispositions set to auto-populate makes RMA Disposition open with
the work list already loaded. A BPM on disposition save can email customer service so they know to
follow up with the customer.
:::

## 5 and 6. Credit the customer

1. In **RMA Processing**, go to the RMA's credits, select the line to credit and choose **Add Credit
   Memo**. A cut-down AR invoice screen opens with amounts defaulted from the referenced invoice. Check
   them and save. Repeat for other lines; they're added to the same credit memo.
2. Customer service can update the credit request until AR processes it.
3. In **AR Invoice Entry**, AR pulls pending credit requests into an invoice group with **Get > RMA and
   Demand Credits** (on demand, or on a regular schedule), reviews them and posts.

Once posted, corrections need a corrective or cancellation invoice.

## A disposition can't be deleted after posting

**Symptom:** you try to reverse or delete an RMA disposition and Epicor refuses because it has been
posted to the GL.

**Cause:** **Capture COS/WIP Activity** has already posted the disposition's inventory transaction. A
posted disposition can't be reversed through the RMA screens.

To confirm, run the [Inventory/WIP Reconciliation report](/processes/inventory/transactions-and-reconciliation/)
for the date and find the transaction; its posted-to-GL flag will be set.

**Fix:** correct it with new transactions instead, referencing the RMA in the comments:

- **Disposed to a job by mistake:** use **Return Material** to move the parts from the job back to stock,
  then use quantity and cost adjustments to reach the right on-hand and value.
- **Disposed with the wrong quantity or cost on a job:** make the correction with **Job Adjustment**.

## Related pages

- [Nonconformance and inspection](/processes/quality-rma/nonconformance-and-inspection/)
- [Order to shipment](/processes/sales-shipping/order-to-shipment/)
- [Invoice tax and customer credit](/processes/finance/invoices-tax-and-credit/)

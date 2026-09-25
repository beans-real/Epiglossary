---
title: Purchasing overview
description: The purchase-to-pay flow in Epicor, who does what at each step, the records it creates, and a map of the purchasing pages.
env: both
sidebar:
  order: 1
---

Purchasing in Epicor runs from a requirement (a job needs material, stock is running low, someone raises
a requisition) through a purchase order, a receipt and finally a supplier invoice and payment. Each step
is usually owned by a different person, and each leaves records the next step depends on.

## Purchase to pay

| Step | Who | Screens | Records |
|---|---|---|---|
| 1. Identify the need | MRP, planner, requester | Process MRP, Generate Suggestions, Requisition Entry | `SugPoDtl`, `ReqHead`/`ReqDetail` |
| 2. Create the PO | Buyer | New PO Suggestions, Purchase Order Entry, Buyer Workbench | `POHeader`, `PODetail`, `PORel` |
| 3. Approve | Approval person | PO Approval (when over the buyer's limit) | `POHeader` approval status |
| 4. Receive | Receiving | Receipt Entry | `RcvHead`, `RcvDtl`, `PartTran` (`PUR-...`) |
| 5. Inspect (if required) | Quality | Inspection Processing, DMR Processing | `PartTran` (`INS-...`), DMR records |
| 6. Invoice | Accounts payable | AP Invoice Entry (matched to receipts) | `APInvHed`, `APInvDtl` |
| 7. Pay | Accounts payable | AP Payment Entry | `CheckHed`, `APTran` |

<!-- TODO verify: table names for PO suggestions (SugPoDtl) and AP payments (CheckHed). -->

## Pages in this section

- [Buyers and suppliers](/processes/purchasing/buyers-and-suppliers/): buyer limits and approvers,
  supplier settings that matter, and the supplier price update error
- [PO suggestions](/processes/purchasing/po-suggestions/): how suggestions are built, a sensible daily
  schedule, and fixing the scheduled task after upgrades
- [Purchase orders: dates, GL accounts and receipts](/processes/purchasing/purchase-orders/): due vs
  promise dates and supplier transit time, GL account defaulting, Purchase Advisor, receipts and
  inspection

## Related sections

- [Nonconformance and inspection](/processes/quality-rma/nonconformance-and-inspection/) for failed
  receipts and DMRs
- [AP payments](/processes/finance/ap-payments/) for paying suppliers
- [Inventory transactions and WIP reconciliation](/processes/inventory/transactions-and-reconciliation/)

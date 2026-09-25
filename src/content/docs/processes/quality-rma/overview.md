---
title: Quality and RMA overview
description: How suspect material is held, inspected and dispositioned in Epicor, whether it comes from production, suppliers or customers, and a map of the quality and RMA pages.
env: both
sidebar:
  order: 1
---

Quality processes in Epicor all follow the same pattern: take suspect quantity out of the normal flow,
hold it in inspection, let someone qualified decide, and record the outcome with transactions that move
the parts and their cost to the right place. The source of the problem changes which screen you start
in, not the pattern.

## One pattern, three sources

| Source | Starts in | Held as | Decided in | Failures go to |
|---|---|---|---|---|
| Production | End Labor Activity, Nonconformance | Nonconformance | Inspection Processing | DMR Processing |
| Suppliers | Receipt Entry (inspection required) | PO receipt in inspection | Inspection Processing | DMR Processing (debit memo to supplier) |
| Customers | RMA Processing | RMA receipt | Inspection Processing or RMA Disposition | DMR Processing, scrap or a repair job |

Inspection Processing, DMR Processing and corrective actions are part of the **Quality Assurance**
module. Without it, customer returns are dispositioned in **RMA Disposition** in Order Management.

Once any of these decisions posts to the GL, it can't be undone in place. Corrections are made with new
transactions, which the pages below explain case by case.

## Pages in this section

- [Nonconformance and inspection](/processes/quality-rma/nonconformance-and-inspection/): raising NCs,
  Inspection Processing, DMR outcomes, and reversing an inspected receipt
- [RMA process](/processes/quality-rma/rma-process/): customer returns from RMA to credit memo, and fixing
  a posted disposition

## Related sections

- [Inventory transaction types](/reference/transaction-types/) for the `INS-`, `DMR-` and `RMA-` codes
- [Purchasing](/processes/purchasing/overview/)
- [Order to shipment](/processes/sales-shipping/order-to-shipment/)

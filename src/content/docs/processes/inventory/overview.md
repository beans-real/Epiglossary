---
title: Inventory overview
description: How Epicor tracks on-hand quantity and value, the records behind it, and a map of the inventory pages.
env: both
sidebar:
  order: 1
---

Epicor keeps inventory at the level of part, warehouse, bin and (where tracked) lot or serial number.
Every movement writes a transaction that changes quantity, cost or both, and those transactions later
feed the general ledger. Most inventory questions are either "why does the system say we have this
many?" or "why doesn't the GL agree?". Both are answered from the same transaction history.

## The records

| Table | Holds |
|---|---|
| `Part`, `PartPlant`, `PartWhse` | The part, its per-site settings (costing method, primary warehouse, non-stock, backflush) and its per-warehouse settings |
| `PartBin` | On-hand quantity per warehouse, bin and lot |
| `PartLot` | Lot records, including a flag for whether the lot still has stock |
| `PartCost` | Current costs per costing method |
| `PartTran` | Every quantity and cost movement, with a `TranType` code |

## Who changes inventory

| Activity | Typical screens | `TranType` examples |
|---|---|---|
| Receiving from suppliers | Receipt Entry | `PUR-STK`, `PUR-MTL`, `PUR-INS` |
| Issuing to and receiving from jobs | Issue Material, backflush, Auto Receive | `STK-MTL`, `MFG-STK` |
| Shipping | Customer Shipment Entry | `STK-CUS`, `MFG-CUS` |
| Moving stock | Inventory Transfer | `STK-STK` |
| Correcting quantity or cost | Quantity Adjustment, cycle counts, cost adjustments | `ADJ-QTY`, `ADJ-CST` |
| Inspection and returns | Inspection Processing, DMR, RMA | `INS-STK`, `INS-DMR`, `RMA-INS` |

The full list is in [Inventory transaction types](/reference/transaction-types/).

## Pages in this section

- [Inventory transactions and WIP reconciliation](/processes/inventory/transactions-and-reconciliation/):
  how transactions reach the GL, the Inventory/WIP Reconciliation report, unexpected `ADJ-CST` rows, and
  finding the latest receipt
- [Cycle counts](/processes/inventory/cycle-counts/): the counting process, single-part counts, and
  clearing fractional quantities
- [Negative inventory and on-hand problems](/processes/inventory/negative-inventory/): the Part Class
  setting, backflush exemptions and a lot on-hand data fix

## Related sections

- [How inventory flows through jobs](/processes/jobs-manufacturing/inventory-flow-through-jobs/)
- [Purchasing](/processes/purchasing/overview/) for receipts
- [Quality and RMA](/processes/quality-rma/overview/) for inspection and returns

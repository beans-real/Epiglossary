---
title: Sales and shipping overview
description: The order-to-cash flow from sales order to shipped pack and invoice, who owns each step, and a map of the sales and shipping pages.
env: both
sidebar:
  order: 1
---

Sales and shipping cover everything from the customer's order to the goods leaving the building and the
invoice going out. The steps are owned by different teams (sales, planning, shipping, accounts
receivable) and each copies data from the step before, which is why an error made at order entry so
often surfaces in shipping.

## Order to cash

| Step | Who | Screens | Records |
|---|---|---|---|
| 1. Quote (optional) | Sales | Opportunity/Quote Entry | `QuoteHed`, `QuoteDtl` |
| 2. Order | Sales / customer service | Sales Order Entry | `OrderHed`, `OrderDtl`, `OrderRel` |
| 3. Supply | Planning / production | Planning Workbench, Job Entry | `JobHead`, `JobProd` (demand link) |
| 4. Pack | Shipping | Customer Shipment Entry, Master Pack Shipment Entry | `ShipHead`, `ShipDtl` |
| 5. Freight | Shipping | Freight action with a manifest system | Tracking and charges on the pack |
| 6. Ship | Shipping | Shipped flag, Stage Ship Confirm Entry | `PartTran` (`STK-CUS`, `MFG-CUS`) |
| 7. Invoice | Accounts receivable | AR Invoice Entry | `InvcHead`, `InvcDtl` |

Returns run the other way through RMA processing. See [RMA process](/processes/quality-rma/rma-process/).

## Pages in this section

- [Order to shipment](/processes/sales-shipping/order-to-shipment/): the flow, pack statuses, order
  changes that don't reach packs, master packs, early shipments and a completed-not-shipped report
- [Freight and Quick Ship errors](/processes/sales-shipping/freight-and-quick-ship-errors/): recovering
  a pack that won't unfreight, and the categories of carrier error
- [Customer part numbers and order data](/processes/sales-shipping/customer-parts-and-order-data/):
  customer part cross references and descriptions, attributes, ship-to addresses, and an order
  contact error

## Related sections

- [The job lifecycle](/processes/jobs-manufacturing/job-lifecycle/) for make-to-order supply
- [Invoice tax and customer credit](/processes/finance/invoices-tax-and-credit/)

---
title: Finance overview
description: How operational transactions reach the general ledger in Epicor, where AP, AR and GL fit, and a map of the finance pages.
env: both
sidebar:
  order: 1
---

Epicor's finance modules sit at the end of every other process. Purchasing ends in a supplier invoice
and payment, sales in a customer invoice and receipt, and manufacturing and inventory in cost postings to
WIP, inventory and cost of sales. All of them arrive in the general ledger through the posting engine,
which applies the GL transaction type rules to each document.

## How documents reach the GL

| Source | Document | Posted when |
|---|---|---|
| Accounts payable | AP invoices, debit memos, adjustments | The AP invoice group is posted |
| AP payments | Checks, electronic payments | The payment group is posted |
| Accounts receivable | AR invoices, credit memos, cancellation invoices | The AR invoice group is posted |
| Cash receipts | Customer payments | The cash receipt group is posted |
| Inventory and jobs | `PartTran` and `LaborDtl` rows | **Capture COS/WIP Activity** runs |
| Manual | GL journal entries | The journal group is posted |

Posted documents can't be edited. Corrections are always new documents (reversals, adjustments,
cancellation invoices), so a clean audit trail is built in.

## Pages in this section

- [AP payments, ACH and remittance advice](/processes/finance/ap-payments/): payment methods and groups,
  Select Invoices, ACH flow, remittance advice and the NACHA file
- [GL budgets and financial reports](/processes/finance/gl-budgets-and-financial-reports/): importing
  account budgets from Excel, sign conventions, and Financial Report Designer
- [Invoice tax and customer credit](/processes/finance/invoices-tax-and-credit/): fixing tax on posted
  invoices, advance billing tax, and credit manager totals

## Related sections

- [PO release GL accounts](/processes/purchasing/purchase-orders/#where-the-gl-account-on-a-release-comes-from)
- [Inventory transactions and WIP reconciliation](/processes/inventory/transactions-and-reconciliation/)
- [Job costing and WIP](/processes/jobs-manufacturing/job-costing-and-wip/)
- [Inventory transaction types](/reference/transaction-types/)

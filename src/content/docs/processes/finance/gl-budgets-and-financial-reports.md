---
title: GL budgets and financial reports
description: Load GL account budgets from Excel with the Account Budget export and import, get the signs and codes right, and use Financial Report Designer to report actuals against budget.
env: both
sidebar:
  order: 3
---

GL budgets hold a planned amount per account per fiscal period. Once they're in, Financial Report
Designer can print actuals next to budget on income statements and other GL reports. Typing hundreds of
account-period amounts by hand is slow, so most companies build the budget in Excel and import it.

## Before you start

- A **Budget Code** exists for this budget (**Financial Management > General Ledger > Setup > Budget
  Code**). Codes let you keep several budgets side by side, such as *Original* and *Forecast*. One code
  can be the default for reports.
- The book and fiscal year you're budgeting for exist, with their periods. The book's chart of accounts
  and fiscal calendar decide which accounts and periods the budget has.

## Loading a budget from Excel

1. Open **Account Budget** (**Financial Management > General Ledger > Setup > Account Budget**).
2. On the budget detail, filter to the **Book**, **Budget Code** and **Fiscal Year** you want.
3. From **Actions** (the **Overflow** menu in Kinetic), choose **Export Budgets**. In **Budget Export
   Process**, give the output file a recognisable name. The export can only be written to the server
   (`Server:\`), not your PC.
4. Download the file with **Server File Download**, choosing the **User** directory.
5. In Excel, fill in one row per GL account: the account, its description and an amount for each period.
   Keep the columns and header exactly as exported.
6. Back in **Account Budget**, choose **Import Budgets**, select your file and import it.
7. Open a few accounts for the fiscal year and check the period breakdown matches the spreadsheet.

:::tip
Export first even for a brand-new budget. The export gives you a template with the exact layout the
import expects. Building the file from scratch is the most common reason an import fails.
:::

## Getting the signs right

Budgets follow the same debit/credit convention as the GL:

| Account type | Enter | Example |
|---|---|---|
| Expense | Positive amounts | Travel budget of 5,000 per quarter |
| Revenue | Negative amounts | Sales budget of 250,000 per month entered as `-250000` |

If budget-vs-actual reports show revenue variances with the wrong sign, the revenue budget was usually
loaded as positive.

Other options on account budgets:

- **Copy Budget** copies budgets from one fiscal year to another in the same book, based on either the
  prior budget or the prior actuals, which you can then adjust.
- Selecting **Cash Flow Analysis** on an account includes its budget in the cash flow tracker's expected
  expenses. Don't use it for sales accounts; cash flow already includes sales from open orders and
  invoices.

## Financial Report Designer

Epicor doesn't ship ready-made financial statements. **Financial Report Designer** (FRD, **Financial
Management > General Ledger > Setup > Financial Report Designer**) is where you build them: balance
sheets, income statements and any other report grouped and totalled by GL account.

- **Rows** define the lines of the report: headings, account ranges or categories, subtotals and totals.
- **Column sets** define what each column shows: actuals for a period, year to date, prior year, or
  **budget** for a chosen budget code, plus calculated columns such as variance.
- The **Report Wizard** builds a starting balance sheet or income statement for a book. It needs at
  least one net income category defined in the chart of accounts.
- **Syntax Check** validates the definition before you run it.
- Definitions can be exported and imported, so you can build them in a test company and move them to
  production.

Reports run from FRD produce a spreadsheet you can open in Excel.

## Related pages

- [AP payments, ACH and remittance advice](/processes/finance/ap-payments/)
- [Inventory transactions and WIP reconciliation](/processes/inventory/transactions-and-reconciliation/)

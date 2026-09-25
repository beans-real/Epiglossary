---
title: Useful table relationships
description: Joins that the BAQ designer won't draw for you or that are easy to get wrong, including Part to PartCost, GL control codes, invoice lines to their GL accounts, job assembly costs and rebuilding stock on hand from PartTran.
env: both
sidebar:
  order: 9
sources:
  - title: "EpiUsers: Part and PartCost"
    url: https://www.epiusers.help/t/part-and-partcost/52957/6
  - title: "EpiUsers: Vendor GL control code BAQ"
    url: https://www.epiusers.help/t/vendor-gl-control-code-baq/73069/3
---

The designer draws most joins from the data dictionary. The ones on this page are the exceptions: relationships that aren't predefined, that go through a generic link table, or that return the wrong numbers if you join the obvious way. For join types and table order in general, see [Designing queries](/platform/baq/designing-queries/#tables-and-joins).

## Finding a relationship yourself

- **Field Help** on any screen field shows its table and column, and its **Like** value. Two columns with the same like value hold the same kind of data and can usually be joined.
- The **Data Dictionary Viewer** describes each table and column, including which columns form the key.
- In the designer, the **Dictionary** panel lists every predefined relation between two tables on the canvas, and the **Table List** tab shows each table's indexes. Joining on the columns of an index (company first) is fast; joining on anything else can be slow.

## The RelatedToFile and Key pattern

Several tables attach data to *any* other table instead of one specific one. They use a `RelatedToFile` column naming the source table, and `Key1` to `Key5` holding that table's key values **as text**. `TranGLC` (GL lines behind transactions), `EntityGLC` (GL control codes assigned to customers, suppliers, parts and so on) and the `UD` tables work this way.

Two rules for joining them:

1. **Always filter `RelatedToFile`.** Put it in a table criterion (a constant such as `'Vendor'`) or in the join. Without it you match rows belonging to other tables that happen to have the same key values.
2. **Convert your number to text, not their text to a number.** `Key1 = Vendor.VendorNum` makes SQL Server convert every `Key1` to an integer, and the first non-numeric key stops the query with a conversion error. `Key1 = CONVERT(nvarchar(20), Vendor.VendorNum)` can't fail. See [Calculated fields](/platform/baq/calculated-fields/#data-type-rules-that-cause-errors).

To see which `RelatedToFile` values exist and what their keys look like, run a quick BAQ on the link table grouped by `RelatedToFile`.

## GL control codes

A supplier's GL control code lives in `EntityGLC`:

| `EntityGLC` column | Join to / filter |
|---|---|
| `Company` | `Vendor.Company` |
| `RelatedToFile` | constant `'Vendor'` |
| `Key1` | `Vendor.VendorNum` (the internal number, not `VendorID`), converted to text |

Display `GLControlType` and `GLControlCode`. If you get zero rows, you've probably joined `Key1` to `VendorID`; if you get a conversion error, you've joined without the `RelatedToFile` filter or without converting the number. Other entities follow the same pattern with their own `RelatedToFile` value and key.

## Part costs

Part costs are in `PartCost`, not `Part`. Join `Part` to `PartCost` on `Company` and `PartNum`, and display the cost that matches your costing method: `AvgMaterialCost`, `StdMaterialCost` or `LastMaterialCost` (each has labour, burden, subcontract and material burden siblings).

:::caution
`PartCost` is kept per cost group (`CostID`), and a multi-site company can have more than one. Joining on part number alone then returns one row per cost group and doubles your totals. Add `CostID` to the join, or a criterion on it, for the cost group used by the site you're reporting on.
:::

## Invoice lines to GL accounts

To show the sales (and returns) accounts an invoice line posted to, join `InvcDtl` to `TranGLC` with **All rows from `InvcDtl`**, so lines without GL detail still appear:

```sql
SELECT InvcDtl.InvoiceNum, InvcDtl.InvoiceLine, TranGLC.GLAccount
FROM Erp.InvcDtl AS InvcDtl
LEFT OUTER JOIN Erp.TranGLC AS TranGLC
    ON  TranGLC.Company       = InvcDtl.Company
    AND TranGLC.RelatedToFile = 'InvcDtl'
    AND TranGLC.Key1          = CONVERT(nvarchar(20), InvcDtl.InvoiceNum)
    AND TranGLC.Key2          = CONVERT(nvarchar(20), InvcDtl.InvoiceLine)
    AND TranGLC.GLAcctContext IN ('Sales', 'Returns')
    AND TranGLC.RecordType    = 'R'
```

In the designer, that's the first four conditions as join fields, and the last two as criteria on `TranGLC` (which land in the join because `TranGLC` isn't the first table).

## Inventory transactions to GL

`PartTran` rows link to `TranGLC` through `RelatedToFile = 'PartTran'` and its date, time and transaction number. The details, and a worked query, are on [Inventory transaction types](/reference/transaction-types/#linking-a-transaction-to-its-gl-lines).

## Job costs from JobAsmbl

`JobAsmbl` carries a job's estimated and actual costs, per assembly, already rolled up. The column names follow a pattern:

| Part of the name | Meaning |
|---|---|
| `TL` | This level: the assembly's own operations and materials |
| `LL` | Lower level: everything in the assemblies beneath it |
| `E` / `A` | Estimated / actual |
| `Labor`, `Burden`, `Material`, `Subcontract`, `MtlBur` | The cost bucket |

So the estimated burden for an assembly including its subassemblies is `JobAsmbl.TLEBurdenCost + JobAsmbl.LLEBurdenCost`, and the actual equivalent is typically `JobAsmbl.TLABurdenCost + JobAsmbl.LLABurdenCost`.

For a whole-job figure, read the top assembly (`AssemblySeq = 0`) and add its `TL` and `LL` values. Don't add `TL + LL` across every assembly: each parent's `LL` already includes its children, so you'd count them twice.

## Stock on hand as of a date

`PartBin` and `PartWhse` only know today's quantities. To see what was on hand on an earlier date, add up `PartTran` quantities from the beginning of time to that date, signed by whether each transaction type added stock or took it away. It has to start from the very first transaction: a partial date range gives the movement in that range, not a balance.

A calculated field for the signed quantity, in an inner subquery on `PartTran`:

```sql
CASE
    WHEN PartTran.TranType IN ('PUR-STK', 'MFG-STK', 'INS-STK', 'PLT-STK') THEN PartTran.TranQty
    WHEN PartTran.TranType IN ('STK-CUS', 'STK-MTL', 'STK-PLT', 'STK-UKN', 'STK-INS') THEN -PartTran.TranQty
    WHEN PartTran.TranType = 'ADJ-QTY' THEN PartTran.TranQty
    ELSE 0
END
```

Then sum it by part (and warehouse or bin if needed) with a criterion of `TranDate <= ` your date parameter. The type lists above are a starting point, not a complete set. Codes such as `MTL-STK`, `RMA-STK`, `DMR-STK`, `STK-ASM`, `STK-DMR` and `STK-KIT` also move stock, and `STK-STK` needs care when you total by bin or warehouse. Check every `STK` code you use against [Inventory transaction types](/reference/transaction-types/), and prove the query by running it for today's date and comparing the result with `PartWhse` on-hand quantities.

## Scheduled load by resource

`ResourceTimeUsed` holds the load the scheduler places on each resource. To see only the load for operations that are still open, and within each operation's scheduled dates, join it to `JobOper` and compare dates across the tables. The steps are on [Parameters and filtering](/platform/baq/parameters-and-filtering/#comparing-fields-across-tables). Group the result by resource group and week (ISO weeks line up best with a Monday-start schedule; see [week numbers](/platform/baq/calculated-fields/#week-numbers)) to build a load chart.

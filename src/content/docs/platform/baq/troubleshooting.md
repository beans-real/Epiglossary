---
title: Troubleshooting BAQs
description: Symptoms, causes and fixes for the BAQ errors and odd results that come up most, from timeouts, conversion and divide-by-zero errors to missing rows, duplicates, bad sorting and updatable BAQs that won't save.
env: both
sidebar:
  order: 11
sources:
  - title: "EpiUsers: BAQ execution timeout expired"
    url: https://www.epiusers.help/t/baq-execution-timeout-expired/75062
  - title: "EpiUsers: Vendor GL control code BAQ"
    url: https://www.epiusers.help/t/vendor-gl-control-code-baq/73069/3
  - title: "EpiUsers: Sorting numbering in BAQ"
    url: https://www.epiusers.help/t/sorting-numbering-in-baq/72344
---

Start with the designer's own tools. **Analyze** checks the SQL and shows the real error when a test only says `Bad SQL Statement. Review the server event logs for details`. The **Query Phrase** shows the SQL the designer generated, which answers most "why is this filter ignored" questions. Testing one subquery at a time narrows down which part is wrong.

## Errors

### "Execution Timeout Expired"

**Cause:** the query ran past its time limit (about 30 seconds unless changed).
**Fix:** add a longer query timeout in **Execution Settings**, then make the query cheaper. Both are covered in [Performance and timeouts](/platform/baq/performance/#execution-timeout-expired).

### "Conversion failed when converting the nvarchar value '...' to data type int"

**Cause:** a text column is being compared with, or joined to, a number, so SQL Server tries to convert every text value to a number and meets one that isn't. Typical culprits are the `Key1` to `Key5` columns of `EntityGLC`, `TranGLC` and UD tables, and CASE expressions that return text in one branch and a number in another.
**Fix:** convert the number side to text (`CONVERT(nvarchar(20), Vendor.VendorNum)`), filter link tables on `RelatedToFile`, and make every CASE branch return the same type. See [Calculated fields](/platform/baq/calculated-fields/#data-type-rules-that-cause-errors) and [Useful table relationships](/platform/baq/table-relationships/#the-relatedtofile-and-key-pattern).

### "Divide by zero error encountered."

**Cause:** a calculated field divides by a value that is zero on at least one row.
**Fix:** guard the divisor with `NULLIF(divisor, 0)` or a CASE. See [Divide by zero](/platform/baq/calculated-fields/#divide-by-zero).

### A CTE subquery fails to load

**Cause:** a CTE refers to another CTE that sits below it in the **SubQuery List**, so it's used before it's defined.
**Fix:** reorder the **SubQuery List** so each CTE comes after the CTEs it uses, with its union members directly below it. See [Subquery order and CTE load order](/platform/baq/designing-queries/#subquery-order-and-cte-load-order).

### "The maximum recursion 100 has been exhausted before statement completion."

**Cause:** a recursive CTE went more than 100 levels deep, either legitimately or because the data loops.
**Fix:** check the data for a loop first. If the depth is real, add the execution setting `QueryOption` = `MAXRECURSION 0` or a larger number.

### Union subqueries won't run

**Cause:** the subqueries joined by **Union**, **UnionAll**, **Intersect** or **Except** don't return the same number of columns in the same order with compatible types.
**Fix:** line up the display columns, adding constant calculated fields where one side has nothing to show. See [Union rules](/platform/baq/designing-queries/#union-rules).

### Sort order causes an error

**Cause:** the sort is defined on a subquery other than the TopLevel.
**Fix:** move it to the TopLevel's **Sort Order** tab.

## Wrong or missing results

### Records are missing

- A **matching rows** join to a table that doesn't always have a partner drops the unmatched rows. Use **All rows from** the table you care about.
- A criterion that ends up in the `WHERE` clause (a subquery criterion, or a criterion on the first table) tests a column from the outer-joined side. Unmatched rows have NULL there, so the criterion removes them. See [Where criteria end up](/platform/baq/parameters-and-filtering/#where-criteria-end-up).
- The designer only returns 10,000 rows while testing. Set `RemoveTestRowLimit` to `true` to see everything.

### Zero rows from a join that should match

You joined the wrong column: `EntityGLC.Key1` holds `Vendor.VendorNum` (the internal number), not `VendorID`. More generally, compare a few raw rows of each table side by side before trusting a manual join.

### Every row appears two or more times

A join is missing a key field (commonly `Company`, a revision, or `CostID` on `PartCost`), so each row matches several partners. Add the missing field rather than ticking **Distinct**. See [Part costs](/platform/baq/table-relationships/#part-costs).

### A filter on a joined table seems to be ignored

It's on an outer-joined table, so it went into the join's `ON` clause: it limits which partner rows attach, not which rows appear. See [Where criteria end up](/platform/baq/parameters-and-filtering/#where-criteria-end-up).

### A parameterised BAQ returns nothing

- The parameter has the same name as a BAQ constant (`CurrentCompany`, `UserID`, `PlantID`...). Rename it.
- The parameter was left blank and **Skip Condition if Empty** isn't ticked, so the query is looking for blank values.

### Blank dates aren't found

Empty dates are NULL. Use the **IsNull** operation or `IS NULL`, not `= ''`.

### Numbers sort 1, 10, 11, 2

The column is text. Sort on a calculated `int` field of `TRY_CONVERT(int, column)`. See [Numbers stored as text](/platform/baq/designing-queries/#numbers-stored-as-text).

### A calculated text field is cut short

Its **Format** is still the short default (`x(8)`). Widen it, for example to `x(200)`.

### Totals are wrong after a NULL

One NULL in a sum of columns makes the whole result NULL. Wrap each part in `ISNULL(column, 0)`.

## Updatable BAQs

### Changes to a UD table don't save

All of `Key1` to `Key5`, plus `Company`, must be display columns mapped to the business object, even the keys you don't use. See [UD tables: display every key](/platform/baq/updatable-baqs/#ud-tables-display-every-key).

### An edited column doesn't save

It's ticked **Updatable** but isn't mapped to a business object field, so the change is dropped. Check the column mapping.

For uBAQ grids in Kinetic screens and dashboards, also see the gotchas on [Updatable BAQ grids](/kinetic/application-studio/updatable-baq-grids/#gotchas).

## Exports

Part numbers losing zeros, dates gaining times and rows splitting in Excel are covered in [When Excel changes your data](/platform/baq/exporting/#when-excel-changes-your-data).

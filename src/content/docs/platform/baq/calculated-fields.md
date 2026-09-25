---
title: Calculated fields
description: A reference of calculated field expressions that work in BAQs, covering conditions, NULLs, divide by zero, text clean-up, lists, ranking, running totals and date ranges, plus the data type rules that trip people up.
env: both
sidebar:
  order: 3
sources:
  - title: "Microsoft Learn: CASE (Transact-SQL)"
    url: https://learn.microsoft.com/en-us/sql/t-sql/language-elements/case-transact-sql?view=sql-server-ver16
  - title: "Microsoft Learn: IIF (Transact-SQL)"
    url: https://learn.microsoft.com/en-us/sql/t-sql/functions/logical-functions-iif-transact-sql?view=sql-server-ver16
  - title: "Microsoft Learn: Data type precedence (Transact-SQL)"
    url: https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql?view=sql-server-ver16
  - title: "Microsoft Learn: LAG (Transact-SQL)"
    url: https://learn.microsoft.com/en-us/sql/t-sql/functions/lag-transact-sql?view=sql-server-ver16
  - title: "EpiUsers: Quick BAQ calculated field for identifying lowercase values"
    url: https://www.epiusers.help/t/quick-baq-calculated-field-for-identifying-lowercase-values/94573
---

A calculated field is a column whose value comes from an expression instead of straight from a table. The expression is ordinary SQL Server (T-SQL) syntax: the functions in the editor's tree are just a convenient subset, and any function your SQL Server supports will work. This page is a reference of expressions worth keeping, grouped by what you're trying to do.

## Creating one

1. Open the subquery, go to **Display Fields** and open the **Calculated Field Editor**.
2. Click **New** and give the field a **Field Name** (no spaces), a **Data Type** and a **Label**.
3. Type the expression in the **Editor**, or drag fields and functions in from the trees. In Kinetic, typing a table name and a dot then **Ctrl+Space** lists that table's columns.
4. Click **Check Syntax**, then **Apply**.

The field appears among the display fields as `Calculated_FieldName`. Other subqueries refer to it through the subquery's alias, for example `OrderTotals.Calculated_OpenValue`. Columns that come from another subquery always use the `Table_Field` alias form, such as `OrderTotals.OrderDtl_OrderNum`, not `OrderDtl.OrderNum`.

### Data type and format

The **Data Type** you choose must match what the expression returns: `nvarchar`, `int`, `decimal`, `date`, `datetime` or `bit`.

:::caution
The **Format** of an `nvarchar` field is a display width, and the default is short (`x(8)`). Anything longer can be cut off in grids, reports and exports, which makes a correct expression look broken. Set it to something realistic, such as `x(200)` for a description or `x(1000)` for a concatenated list.
:::

## Data type rules that cause errors

When an expression mixes types, SQL Server converts the lower-ranked type to the higher-ranked one before comparing or combining them. Numbers and dates rank above text. That has three practical consequences in BAQs.

**Every branch of a CASE or IIF must be able to become the same type.** The result takes the highest-ranked type among the branches. This fails as soon as a row hits the text branch, because SQL Server tries to turn `'N/A'` into a number:

```sql
CASE WHEN OrderDtl.OrderQty = 0 THEN 'N/A' ELSE OrderDtl.OrderQty END
```

Either return a number in every branch (`0` or `NULL`) or convert the number to text in every branch (`CONVERT(nvarchar(20), OrderDtl.OrderQty)`), and set the field's data type to match. Returning `'0'` in quotes next to a decimal happens to work, because `'0'` converts cleanly, but it's a trap for whoever edits it next.

**Comparing a text column with a number converts the text column.** Epicor's generic link tables store keys as text (`Key1` to `Key5` on `EntityGLC`, `TranGLC` and the `UD` tables). Joining `EntityGLC.Key1 = Vendor.VendorNum` converts every `Key1` to an integer, and the first row whose key isn't a number stops the query. Convert the number side instead, or filter the link table to one record type; see [Useful table relationships](/platform/baq/table-relationships/#gl-control-codes).

**Integer divided by integer is an integer.** `7 / 2` is `3`. If both sides are `int` (counts, sequence numbers), multiply one by `1.0` first: `COUNT(*) * 1.0 / 2`.

When you convert, give text a length: `CAST(OrderHed.OrderNum AS nvarchar(20))`. Relying on the default length works in some places and truncates silently in others.

## Conditions: CASE and IIF

The searched form tests any conditions in order and returns the first match:

```sql
CASE
    WHEN JobHead.JobClosed = 1   THEN 'Closed'
    WHEN JobHead.JobReleased = 1 THEN 'Released'
    ELSE 'Open'
END
```

The simple form compares one value against a list, which reads better for code-to-text mappings:

```sql
CASE Part.TypeCode WHEN 'M' THEN 'Manufactured' WHEN 'P' THEN 'Purchased' WHEN 'K' THEN 'Sales kit' END
```

`IIF(condition, if_true, if_false)` is shorthand for a two-branch CASE; SQL Server rewrites it as one. It's handy for flags: `IIF(JobOper.OpComplete = 1, 'Yes', 'No')`.

Things to remember:

- A CASE with no `ELSE` returns NULL for rows that match nothing.
- CASE and IIF can be nested at most 10 levels deep. If you're close to that, a lookup table (a UD table or user codes joined into the query) is easier to maintain anyway.
- A mismatch check, such as flagging operations whose resource group doesn't match their op code, is just a CASE that returns a label: `CASE WHEN JobOper.OpCode <> JobOpDtl.ResourceGrpID THEN 'Check' ELSE 'OK' END`.

## NULLs and blanks

An empty date, or a column from an outer-joined table with no partner row, is NULL, not an empty string. NULL never equals anything, including another NULL, so `JobHead.DueDate = ''` doesn't find blank dates. Use `IS NULL`:

```sql
CASE WHEN JobHead.DueDate IS NULL THEN 'No due date' ELSE 'Scheduled' END
```

Arithmetic with a NULL gives NULL, so one missing value blanks the whole result. Swap NULLs for a safe default before doing maths:

```sql
ISNULL(OrderDtl.DocExtPriceDtl, 0) - ISNULL(OrderDtl.DocDiscount, 0)
```

`COALESCE(a, b, c)` returns the first non-NULL of several values, which is useful for "use the ship-to name, or else the customer name".

Joining text with `+` also turns NULL if any piece is NULL. `CONCAT()` treats NULL as an empty string, so prefer it when any part is optional.

## Divide by zero

Dividing by zero stops the whole query with `Divide by zero error encountered.` Guard every division whose bottom can be zero. The shortest guard turns a zero divisor into NULL, which makes the result NULL instead of an error:

```sql
JobOper.ActProdHours / NULLIF(JobOper.QtyCompleted, 0)
```

Wrap it in `ISNULL(..., 0)` if you'd rather show zero. The longer form is clearer when the rule is more than "zero means zero":

```sql
CASE
    WHEN ISNULL(JobOper.RunQty, 0) = 0 THEN 0
    ELSE JobOper.EstProdHours / JobOper.RunQty
END
```

The same guard applies to percentages, such as a line discount as a percentage of the line value: `OrderDtl.DocDiscount * 100 / NULLIF(OrderDtl.DocExtPriceDtl, 0)`.

## Text

| Goal | Expression |
|---|---|
| Part, description and revision in one column | `CONCAT(Part.PartNum, ' - ', TRIM(Part.PartDescription), ' (', TRIM(PartRev.RevisionNum), ')')` |
| A number as text | `CONVERT(nvarchar(20), OrderHed.OrderNum)` |
| Remove line breaks | `REPLACE(REPLACE(OrderDtl.LineDesc, CHAR(13), ' '), CHAR(10), ' ')` |
| Remove tabs as well | wrap once more: `REPLACE(..., CHAR(9), ' ')` |
| First 30 characters | `LEFT(Part.PartDescription, 30)` |
| Trim spaces | `TRIM(x)` (or `LTRIM(RTRIM(x))` on older SQL Server) |
| Pad a number with zeros | `RIGHT('000000' + CONVERT(nvarchar(6), OrderHed.OrderNum), 6)` |

Line breaks in descriptions and comments break CSV exports and make grid rows tall. Build nested `REPLACE` calls one layer at a time and check each before adding the next; `CHAR(13)` is a carriage return and `CHAR(10)` a line feed.

### Find values with lowercase letters

Epicor's database is normally case-insensitive, so `x = UPPER(x)` is always true. Force a case-sensitive comparison with `COLLATE` to flag values (bins, part numbers) that contain lowercase letters:

```sql
CASE
    WHEN UPPER(PartBin.BinNum) <> PartBin.BinNum COLLATE Latin1_General_CS_AS THEN 1
    ELSE 0
END
```

Use a `bit` or `int` field and filter or sort on it. Swap `UPPER` for `LOWER` to find values containing capitals instead. For a pattern test, use a binary collation, because in case-sensitive dictionary collations the range `[a-z]` also includes most capital letters: `PartBin.BinNum LIKE '%[a-z]%' COLLATE Latin1_General_BIN`.

### Epicor list functions

Epicor adds functions for delimited lists, a leftover from its Progress roots. They take an optional separator (comma by default):

| Function | Returns |
|---|---|
| `[Ice].entry(n, list, '~')` | The *n*th item of the list, counting from 1 |
| `[Ice].num_entries(list, '~')` | How many items the list has |
| `[Ice].lookup(value, list, '~')` | The position of `value` in the list, or 0 |

## Aggregates and lists of values

An aggregate calculated field (`SUM`, `COUNT`, `MAX`...) collapses rows, so every other display column in that subquery must be ticked **Group By**. It's often easier to aggregate in an inner subquery and join the result to the detail you want to show; see [Designing queries](/platform/baq/designing-queries/#subqueries).

`MAX()` works on text and dates as well as numbers. `MAX(OrderHed.OrderDate)` per customer is their latest order date.

`STRING_AGG` joins the values from several rows into one comma-separated cell, instead of one row per value:

```sql
STRING_AGG(CONVERT(nvarchar(20), OrderDtl.OrderNum), ', ')
```

Build each item with `CONCAT` for richer lists, such as a job's operations with a done flag:

```sql
STRING_AGG(CONCAT(JobOper.AssemblySeq, '-', JobOper.OprSeq, IIF(JobOper.OpComplete = 1, ' done', '')), ' | ')
```

Notes on `STRING_AGG`:

- Add `WITHIN GROUP (ORDER BY JobOper.OprSeq)` after it to control the order of the items.
- It doesn't take `DISTINCT`. If the joins produce repeats, aggregate a distinct inner subquery first.
- Results over 8,000 bytes fail with an error. Cast the input to `nvarchar(max)` if the list can be long.
- On old SQL Server versions without `STRING_AGG`, the `FOR XML PATH` technique does the same job.

## Ranking and running totals

Window functions calculate across a group of rows without collapsing them, so each row keeps its detail. `PARTITION BY` sets the groups; `ORDER BY` inside `OVER` sets the order within each group.

| Goal | Expression |
|---|---|
| Number rows 1, 2, 3 within each order | `ROW_NUMBER() OVER (PARTITION BY OrderDtl.OrderNum ORDER BY OrderDtl.OrderLine)` |
| Rank with gaps after ties (1, 1, 3) | `RANK() OVER (PARTITION BY ... ORDER BY ...)` |
| Rank without gaps (1, 1, 2) | `DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)` |
| Rows in each group, on every row | `COUNT(*) OVER (PARTITION BY OrderDtl.OrderNum)` |
| Group total on every row | `SUM(OrderDtl.DocExtPriceDtl) OVER (PARTITION BY OrderDtl.OrderNum)` |
| Running total | `SUM(PartTran.TranQty) OVER (PARTITION BY PartTran.PartNum ORDER BY PartTran.TranDate, PartTran.TranNum)` |
| Previous row's value | `LAG(PartTran.TranDate) OVER (PARTITION BY PartTran.PartNum ORDER BY PartTran.TranDate)` |
| Next row's value | `LEAD(...) OVER (...)` |

Adding `ORDER BY` to an aggregate's `OVER` clause turns it into a running figure. `SUM(1) OVER (PARTITION BY x ORDER BY y)` counts 1, 2, 3; drop the `ORDER BY` to get the group total on every row.

`ROW_NUMBER` is also the standard way to keep one row per group, such as the latest price per part. Number the rows in an inner subquery with `ORDER BY ... DESC`, then filter the outer query to `Calculated_RowNum = 1`.

Window functions can't reference a column that the same subquery aggregates away. If the subquery uses **Group By**, compute the window function one level up.

## Dates

### Use BAQ constants, not typed dates

A BAQ that says `'2025-01-01'` is out of date by next January. Epicor provides date constants that are worked out when the query runs, in the company's time zone. Use them in criteria and calculated fields: `Constants.Today`, `Constants.Yesterday`, `Constants.Tomorrow`, `Constants.FirstDayOfWeek`, `Constants.LastDayOfWeek`, `Constants.FirstDayOfMonth`, `Constants.LastDayOfMonth`, the `Prev` and `Next` variants of those (`Constants.FirstDayOfPrevMonth`, `Constants.LastDayOfNextWeek`...), and `Constants.Year`, `Constants.Month`, `Constants.Week` and `Constants.Day`.

Prefer `Constants.Today` to `GETDATE()`. `GETDATE()` is the database server's clock and includes the time of day; `Constants.Today` is the company's date. The criteria editor's **current date + specified interval** option covers simple "last 30 days" filters without any expression.

:::note
`Constants.FirstDayOfWeek` is a Sunday. For a Monday-based week, use `DATEADD(day, 1, Constants.FirstDayOfWeek)`, but on a Sunday that returns the next day. The formula in the table below handles Sundays correctly.
:::

### Period start and end dates

Replace `d` with any date column or constant.

| Goal | Expression |
|---|---|
| Monday of the week containing `d` | `DATEADD(week, DATEDIFF(week, 0, DATEADD(day, -1, d)), 0)` |
| First day of the month | `DATEFROMPARTS(YEAR(d), MONTH(d), 1)` |
| Last day of the month | `EOMONTH(d)` |
| First day of the previous month | `DATEADD(month, -1, DATEFROMPARTS(YEAR(d), MONTH(d), 1))` |
| Last day of the previous month | `EOMONTH(d, -1)` |
| First day of the year | `DATEFROMPARTS(YEAR(d), 1, 1)` |
| Last day of the year | `DATEFROMPARTS(YEAR(d), 12, 31)` |
| First and last day of last year | `DATEFROMPARTS(YEAR(d) - 1, 1, 1)`, `DATEFROMPARTS(YEAR(d) - 1, 12, 31)` |
| First day of next year | `DATEFROMPARTS(YEAR(d) + 1, 1, 1)` |
| Days late (positive when past due) | `DATEDIFF(day, JobHead.DueDate, Constants.Today)` |
| 30 days ago | `DATEADD(day, -30, Constants.Today)` |

You'll also see an older idiom built from `DATEADD` and `DATEDIFF` against day zero, such as `DATEADD(year, DATEDIFF(year, 0, d), 0)` for the start of the year. It works on any SQL Server version; the `DATEFROMPARTS` and `EOMONTH` forms are easier to read.

:::tip
For `datetime` columns, filter a period as `>= start AND < next start`, not `BETWEEN start AND end`. A row stamped at 2 p.m. on the last day is later than midnight on that day, so `BETWEEN` drops it.
:::

### Week numbers

`DATEPART(week, d)` restarts at 1 on 1 January and treats Sunday as the first day of the week, so the first and last weeks of a year are usually partial. `DATEPART(ISO_WEEK, d)` uses Monday-based ISO weeks, which line up with most planning buckets. Near New Year an ISO week can belong to the neighbouring year, so group on the week's Monday (formula above) when you need a unique key.

### Combining SysDate and SysTime

`PartTran` and several other tables record when a row was entered as a date (`SysDate`) and a whole number of seconds since midnight (`SysTime`). To get one `datetime` column you can sort or compare:

```sql
DATEADD(second, PartTran.SysTime, CAST(PartTran.SysDate AS datetime))
```

Set the field's data type to `datetime`. To join the result to a table that only has a date, cast it back: `CAST(<expression> AS date)`.

### Fiscal periods

Don't hard-code fiscal quarters as date ranges; they need editing every year and break the first time the calendar changes. Epicor's financial functions `FiscalYear(company, date)` and `FiscalPeriod(company, date)` return the fiscal year and period for a date from the fiscal calendar, and you can build a quarter from the period with a CASE.

<!-- TODO verify: the exact schema-qualified names of the FiscalYear/FiscalPeriod BAQ functions as they appear in the editor, and whether they handle multiple fiscal calendars -->

---
title: Pivot tables
description: Turn rows into columns in a BAQ with the PIVOT operator, for example order value by month, including the inner subquery, the FOR clause and zero-filled month columns.
env: both
sidebar:
  order: 5
---

A pivot turns the values of one column into separate columns. The classic use is a time series across the page: one row per customer (or part, or sales rep) and one column per month, each holding a total. BAQs support SQL Server's `PIVOT` operator directly, so you don't need twelve `SUM(CASE ...)` fields.

The example below shows order value by month of the order date, one row per customer and year.

## Before you start

A pivot needs two subqueries:

- An **inner subquery** (type **InnerSubQuery** or **CTE**) that returns the raw rows: the columns you'll group by, the column whose values become headings (the month), and the value to add up.
- The **TopLevel** subquery, which pivots the inner subquery.

If you use a CTE, put it first in the **SubQuery List**. See [Designing queries](/platform/baq/designing-queries/#subquery-order-and-cte-load-order).

## Steps

### 1. Build the inner subquery

1. Add a new subquery, name it `OrderLines` in the **SubQuery List**, and set its type to **InnerSubQuery**.
2. Add `OrderHed` and `OrderDtl` (or whichever tables hold your rows and dates).
3. Display the grouping column, for example `OrderHed.CustNum`, and the value column, for example `OrderDtl.DocExtPriceDtl`.
4. Add two `int` calculated fields for the time buckets:
   - `OrderYear`: `YEAR(OrderHed.OrderDate)`
   - `OrderMonth`: `MONTH(OrderHed.OrderDate)`
5. Test the subquery on its own (use the subquery drop-down next to **Test**) and check that the rows look right before you pivot them.

### 2. Pivot it in the TopLevel

1. Open the **TopLevel** subquery and drag the inner subquery onto its canvas.
2. Right-click the subquery on the canvas and choose **PIVOT > Set PIVOT** (Kinetic: select it and click the **PIVOT** button). The **Pivot SubQuery FOR Clause** tab appears below the canvas.
3. In the **PIVOT aggregate formula**, open the expression editor, set the data type (`decimal` here) and enter the aggregate, such as `SUM(OrderDtl_DocExtPriceDtl)`. A pivot always needs an aggregate; `SUM` and `COUNT` are the usual ones.
4. Set the **Pivot column** to `Calculated_OrderMonth`, the **Operation** to **IN**, and the **Filter Value** to a **specified constant list** containing `1` to `12`. Each value in this list becomes a column.

### 3. Choose the output columns

In the TopLevel's **Display Fields**, pick the grouping columns (`CustNum`, `Calculated_OrderYear`) and the pivot value columns, which are named after the values in your list (`1`, `2` ... `12`).

Don't display the aggregated value column or the pivot column themselves; the pivot consumes them.

A customer with no orders in a month gets NULL in that column. To show zeros, add a calculated field per month in the TopLevel, for example a `Jan` field of `ISNULL(SUM(OrderLines.[1]), 0)`, and display those instead. Because they're aggregates, tick **Group By** on the other display columns. This also lets you give the months proper labels instead of numbers.


### 4. Test

Run the query. You should get one row per customer and year, with a column per month. Add more grouping columns (part, sales rep, product group) to the inner subquery and the TopLevel display to break the rows down further.

<!-- TODO screenshot: Pivot SubQuery FOR Clause tab with a SUM aggregate, Calculated_OrderMonth as the pivot column and an IN list of 1 to 12 -->
<!-- TODO screenshot: pivot results with one column per month -->

## Notes

- **Order of the IN list.** The designer can sort the value list as text (`1, 10, 11, 12, 2, 3` ...). Entering the values in that order to begin with makes the list easier to check. The column order users see comes from the display fields, which you can rearrange.
- **Only listed values appear.** Values not in the IN list are dropped. For years, either list them or pivot on something relative, such as "months ago".
- **UNPIVOT** does the reverse, turning several columns (`Number01` to `Number05`, say) into rows. It's set up the same way from the right-click menu.
- **Totals.** A row total is just a calculated field adding the month columns. A column total is easier in the dashboard or report than in the BAQ.

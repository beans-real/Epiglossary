---
title: Parameters and filtering
description: Filter BAQ results with table and subquery criteria, understand where each criterion lands in the SQL, compare fields across tables, and prompt users with BAQ parameters.
env: both
sidebar:
  order: 4
---

A BAQ can filter its rows in three places: **table criteria** on a table in a subquery, **subquery criteria** on a whole subquery, and **parameters** whose values users (or the calling screen) supply at run time. This page covers all three, and the one rule about criteria placement that changes results.

Before you add a filter, ask whether it belongs in the BAQ at all. A query with open criteria can be filtered later in a dashboard, a report or a quick search, and one BAQ then serves several needs. See [Dashboard parameters and filters](/kinetic/application-studio/dashboard-parameters-and-filters/) for filtering at the dashboard level.

## Table criteria

Select a table on the canvas, open the **Table Criteria** tab and add a row: **Field Name**, **Operation** and **Filter Value**. Combine rows with **And**/**Or** and brackets.

### Filter value options

The **Filter Value** drop-down decides what the field is compared with:

| Option | Compares with |
|---|---|
| **specified constant** | A value you type, such as `False` or `'PUR-STK'` |
| **specified table field value** | A column from another table in the same subquery, for example "load date on or after the operation's start date" |
| **specified expression** | Any SQL expression, built like a calculated field |
| **specified parameter** | A BAQ parameter supplied at run time |
| **BAQ special constant** | A system value such as `CurrentCompany`, `CurrentUserID` or `FirstDayOfMonth` |
| **current date + specified interval** | Today plus or minus days, weeks, months or years, in the company's time zone |
| **selected value(s) of field from specified subquery** | A column from an inner or CTE subquery, compared with `ALL` or `ANY` |

Some operations have their own options: **IN** takes a constant list, an item-list parameter or a subquery column; **EXISTS** takes "a row in specified subquery"; **CONTAINS** takes a full-text expression and only works on full-text indexed columns.

**BEGINS** and **MATCHES** exist only for compatibility with old Progress-era queries and are slower than their SQL equivalents. Use `>=` or `LIKE 'ABC%'` in new queries.

:::tip
To find empty values, use the **IsNull** operation, not `= ''`. Empty dates and unmatched outer-join columns are NULL, and NULL is never equal to an empty string. See [Calculated fields](/platform/baq/calculated-fields/#nulls-and-blanks).
:::

### Comparing fields across tables

The **specified table field value** option is how you filter one table by another without writing an expression. Say you want the scheduled load for each resource, but only within the dates of operations that are still open:

1. Add `ResourceTimeUsed` and `JobOper` and join them on company, job, assembly and operation.
2. On `ResourceTimeUsed`, add two criteria: `LoadDate >= ` **specified table field value** `JobOper.StartDate`, and `LoadDate <= ` **specified table field value** `JobOper.DueDate`.
3. On `JobOper`, add `OpComplete = False`.

## Where criteria end up

The designer puts criteria in different parts of the SQL depending on which table they're on:

- Criteria on the **first table** of a subquery (position 1 on the **Table List**) go into the `WHERE` clause.
- Criteria on **any other table** go into that table's join, in its `ON` clause.

For a matching-rows (inner) join the result is the same either way. For an outer join it isn't. Take "all rows from `Customer`" joined to `OrderHed`, with the criterion `OrderHed.OpenOrder = True`:

- Because the criterion is on the joined table, it lands in the `ON` clause. Every customer still appears; only their *open* orders are attached, and customers without one show blank order columns.
- If you wanted "only customers who have an open order", that's a matching-rows join, or a criterion on the first table.

When a filter "doesn't work" on an outer-joined table, this is almost always why. Check the **Query Phrase** to see where your criterion went. To filter the final rows regardless of join type, use a subquery criterion instead.

## Subquery criteria

The **SubQuery Criteria** tab filters a whole subquery. These criteria always go into that subquery's `WHERE` clause, so they apply after all its joins. Pick the table (or `Calculated` for calculated fields) in the **Alias** column, then build the condition as usual.

Tick **Having** to filter on an aggregate after grouping, for example "customers whose total open order value is over 10,000". The criterion then goes into the `HAVING` clause.

## Parameters

A parameter is a named value the BAQ asks for when it runs. Dashboards, reports, BPM code and REST calls can supply it; when a user runs the BAQ directly, Epicor prompts for it.

### Creating a parameter

1. Open **Query Parameters** (Kinetic: **Overflow > Query Parameters**; Classic: **Actions > Define Parameters**) and click **New**.
2. Enter a **Parameter Name** (for example `PartNum`) and a **Data Type**: `nvarchar`, `int`, `decimal`, `date`, `datetime`, `bit`, `uniqueidentifier` or `bigint`.
3. Choose an **Editor Type**:
   - **Common Editor**: a free-entry box, optionally with a **Default Value**.
   - **Radio Button Set**: a fixed set of options you define.
   - **DropDown List**: options from a custom list, another BAQ or a user code type.
   - **Item List**: several values at once, for use with the **IN** operation only.
4. Tick **Skip Condition if Empty** if leaving the parameter blank should mean "don't filter" rather than "match blank".
5. Use it: add a criterion whose **Filter Value** is **specified parameter**, and pick the parameter.

In the generated SQL the parameter appears as `@PartNum`, and Epicor substitutes the value when the query runs.

### Rules and gotchas

- **Don't reuse a BAQ constant's name.** A parameter called `CurrentCompany`, `UserID`, `EmployeeID`, `PlantID` or any other constant name clashes with the built-in value, and the query returns nothing. Prefix your own names if in doubt.
- **Parameters with Skip Condition if Empty can't be used in calculated fields.** They don't appear in the calculated field editor's list.
- **Item List parameters only work with IN.** They're the way to let users pick several parts or customers at once.
- **Parameters change how dashboards run the BAQ.** A dashboard grid bound to a parameterised BAQ can't just load it on open; it has to supply the values. See [Dashboard parameters and filters](/kinetic/application-studio/dashboard-parameters-and-filters/#baqs-with-parameters).
- **Parameters are passed by name from code.** [Run a BAQ from BPM code](/platform/bpm/calling-a-baq/#passing-baq-parameters) shows how to fill them from a directive.

## Dates in criteria

Don't type fixed dates into criteria for anything that runs regularly. Use **current date + specified interval**, a **BAQ special constant** such as `FirstDayOfMonth`, or a date parameter. The [date expressions](/platform/baq/calculated-fields/#dates) on the calculated fields page work in **specified expression** criteria too.

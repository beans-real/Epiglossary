---
title: BAQ overview
description: What Business Activity Queries are, where Epicor uses them, how to open the designer in Kinetic and Classic, and a map of the BAQ pages in this wiki.
env: both
sidebar:
  order: 1
---

A Business Activity Query (BAQ) is a saved SQL query that you build in Epicor's query designer instead of writing SQL by hand. You pick tables, join them, add filters and calculated columns, and Epicor stores the definition, generates the SQL, applies company security and runs it on the server. The same BAQ can then feed dashboards, searches, reports, BPMs and outside tools.

If you're comfortable with SQL, think of a BAQ as a `SELECT` statement with a designer on top. If you aren't, the designer does most of the SQL for you, and the pages below cover the parts where knowing a little SQL pays off.

## Where BAQs are used

| Consumer | What the BAQ does there |
|---|---|
| Dashboards | Supplies the rows for grids, charts and trackers. Kinetic dashboards are built in Application Studio; see [Build a dashboard step by step](/kinetic/application-studio/dashboards/). |
| Updatable dashboards and grids | An [updatable BAQ](/platform/baq/updatable-baqs/) lets users edit rows and save them back to the database. |
| Quick searches and BAQ searches | Replace or add to the standard search on a field. See [Quick searches](/platform/baq/quick-searches/). |
| BAQ Reports and SSRS | A BAQ can be the data source of a report, including one that users run with Excel output. |
| BAQ Export Process | Writes results to a CSV or XML file, on demand or on a schedule. See [Export BAQ results and use them in Excel](/platform/baq/exporting/). |
| Combo boxes and data views | Kinetic screens can run a BAQ to fill a drop-down or a grid. See [Combo boxes](/kinetic/application-studio/combo-boxes/) and [BAQ data views](/kinetic/application-studio/baq-data-views/). |
| BPMs and Functions | Code can run a BAQ and read its rows. See [Run a BAQ from BPM code](/platform/bpm/calling-a-baq/). |
| REST and Excel | Every BAQ you can see is available through the REST API, which Excel and Power BI can read as a live OData feed. |
| BAQ zones | A small query result shown in a pop-up next to a field. |

## Opening the designer

- **Kinetic:** **System Management > Business Activity Queries > Business Activity Query (BAQ)**. Most actions (execution settings, parameters, subquery list, export) live on the **Overflow** menu.
- **Classic:** **Executive Analysis > Business Activity Management > Setup > Business Activity Query**. The same actions are on the **Actions** menu, and the designer is split into **General**, **Query Builder**, **Update** and **Analyze** sheets.

The query definitions are shared between the two clients, so a BAQ built in one opens in the other. A few newer designer features only appear in Kinetic; the pages call these out.

## Things to know before you build

- **Copy, don't edit, system queries.** Queries whose IDs start with `z` ship with Epicor and are read-only. Use **Copy Query** to make your own version.
- **Use a prefix.** Give your BAQs a consistent prefix (`XX_OpenOrders`) so they're easy to find and never collide with Epicor's.
- **Tick Shared** if anyone else (or any dashboard, quick search or report run by someone else) needs the query.
- **Only the author can save changes.** Use **Change Author** when someone leaves or hands a query over.
- **Check Where Used before changing a shared BAQ.** The **Where Used** panel lists the dashboards, reports, quick searches and other BAQs that depend on it. If several things use it, copy it and change the copy.
- **Export and import** move a query definition between companies or environments. Exporting the query definition is not the same as exporting its data; for data, use the BAQ Export Process.
- **Look up fields before guessing.** Field Help (technical details) shows the real table and column behind any field on a screen, and the **Data Dictionary Viewer** describes every table and column.

## BAQ zones

A BAQ zone links a query to a field so that users can see related data without leaving the screen. The query receives the field's current value and shows its results in a small pop-up.

- In **Kinetic**, add the zone to the field in **Extended Property Maintenance**. Users open it from the field's right-click context menu under **More Info**.
- In **Classic**, you can link the zone through **Extended Property Maintenance**, **Context Menu Maintenance** or a customization. Linked fields show a small arrow indicator in run mode.

<!-- TODO verify: the exact Extended Property Maintenance setting used to attach a zone BAQ in Kinetic -->
<!-- TODO screenshot: Kinetic field context menu showing More Info with a zone BAQ -->

## Pages in this section

1. [Designing queries](/platform/baq/designing-queries/): tables and joins, table order, subquery types, CTEs and their load order, unions and sorting.
2. [Calculated fields](/platform/baq/calculated-fields/): a reference of useful expressions for text, numbers, NULLs, dates, ranking and aggregation.
3. [Parameters and filtering](/platform/baq/parameters-and-filtering/): table and subquery criteria, where they end up in the SQL, and BAQ parameters.
4. [Pivot tables](/platform/baq/pivot-tables/): turn rows into columns, for example sales by month.
5. [Updatable BAQs](/platform/baq/updatable-baqs/): let users save changes through a query, and hook BPMs to its methods.
6. [Quick searches](/platform/baq/quick-searches/): build a custom search panel on top of a BAQ.
7. [Export BAQ results and use them in Excel](/platform/baq/exporting/): CSV export, Excel reports, copy from a dashboard and live Excel connections.
8. [Useful table relationships](/platform/baq/table-relationships/): joins that aren't obvious, such as `Part` to `PartCost` and GL control tables.
9. [Performance and timeouts](/platform/baq/performance/): execution settings, timeouts, indexes and what `NOLOCK` really does.
10. [Troubleshooting](/platform/baq/troubleshooting/): common errors and odd results, with their causes and fixes.

---
title: BAQ reports
description: Build an SSRS report from a BAQ with BAQ Report Designer or with a BAQ-based report data definition, add option fields and filters, get report options into the layout and put the report on a menu.
env: both
sidebar:
  order: 4
sources:
  - title: "EpiUsers: Passing report parameters to a BAQ report"
    url: https://www.epiusers.help/t/passing-report-parameters-to-a-baq-report/71000/10
---

When no standard report has the data you need, the quickest route to a printable, properly formatted
document is usually a BAQ. You write the query in the BAQ Designer (where joins and calculated fields are
easy to test), and SSRS only has to lay the results out. Epicor gives you two ways to do it.

## Two ways to build one

| | BAQ Report Designer | RDD with BAQ data sources |
|---|---|---|
| Where you set it up | **BAQ Report Designer** | **Report Data Definition** plus **Report Style Maintenance** |
| Number of BAQs | One | One or more, with relationships between them |
| Report options | Option fields and filters you add in the designer | Report criteria sets on the RDD |
| Starting RDL | Created for you when you save | Created with **Actions > Create SSRS Report** on the style, then **Sync Dataset** |
| Can also include Epicor report tables | No | Yes |
| Menu program type | **BAQ Report** | **Report** |

Pick **BAQ Report Designer** for a simple list report from one query. Pick an **RDD** when you need a
header/detail layout from several queries (for example invoice headers and invoice lines), extra
parameters, or data from Epicor's own report tables next to your BAQ.

## Naming

- Give the Report ID your prefix and use underscores between words: `XX_OpenCredits`.
- **Never put a slash in a Report ID.** Epicor builds the report's file path from the ID, so a slash
  sends it looking in a folder that doesn't exist and the report won't load from its menu item. Epicor
  doesn't warn you when you save one.

## BAQ Report Designer

1. Build and test the BAQ first.
2. In **BAQ Report Designer**, create a new report definition: enter the **Report ID**, a
   **Description**, the **BAQ ID** and a **Form Title**. Save. Epicor creates a blank RDL with its data
   source and a `BAQReportResult` dataset already set up.
3. Add **option fields** for values the user should choose on the report form (for example a check box
   bound to a BAQ column with an **Equals** operator), and **filters** for lists the user can pick from.
4. Download the RDL from **Report Style Maintenance** (use the BAQ report's ID), lay out the
   `BAQReportResult` fields in Report Builder, and upload it again.
5. Test with **Actions > Test Report Form** in BAQ Report Designer.
6. Add a menu item in **Menu Maintenance** with **Program Type** set to **BAQ Report**.

:::note[Kinetic]
**Actions > Preview Kinetic Form** in BAQ Report Designer generates a Kinetic report form for the BAQ
report, named `Ice.UIRpt.<ReportID>`. To run it from the Kinetic menu, add a menu item with
**Program Type** set to **Kinetic App** and pick that program.
:::

## RDD with BAQs

1. Build each BAQ. Give the header query its parameters (for example a supplier and a date), and let
   detail queries be filtered by their relationship to the header instead of by parameters.
2. In **Report Data Definition**, create a new definition, add the BAQs as data sources, and define
   relationships between their columns (always including company).
3. Create **Report Criteria Sets** for the prompts the user fills in.
4. In **Report Style Maintenance**, create a report and a new style: **Report Type** SQL Server
   Reporting, **Output Location** Database, your RDD, and your criteria set.
5. Choose **Actions > Create SSRS Report**, then **Sync Dataset**. Without the sync, the BAQ datasets
   aren't added to the RDL.
6. Download, lay out, upload, and add a menu item with **Program Type** set to **Report**.

## Getting report options into the layout

The user's choices on the report form (dates, check boxes) are saved with the run, but they aren't in
the `BAQReportResult` dataset. That matters when you want to print "Credits from 1 January to
31 March" in the heading, or use the date in a calculation.

In a BAQ report, the option values are extracted into a parameter table, `BAQReportParameter`, with one
row per run. Because it has only one row, you can cross join it onto the results:

1. Add the option field in BAQ Report Designer (for example a date option).
2. Download the RDL and open the `BAQReportResult` dataset's query expression.
3. Cross join the parameter table and select the option column (`Date01` in this example; check which column holds your option):

   ```vb
   ="SELECT R.*, P.Date01 AS OptionFromDate
     FROM dbo.[BAQReportResult_" + Parameters!TableGuid.Value + "] AS R
     CROSS JOIN dbo.[BAQReportParameter_" + Parameters!TableGuid.Value + "] AS P"
   ```

4. Add `OptionFromDate` to the dataset's **Fields**, then use it in text boxes or calculated fields.
5. Upload the RDL.

:::tip
If the BAQ itself contains calculations that depend on the option, move them into the RDL instead,
where they can use the cross-joined value. A BAQ can't see the report form's options.
:::

## Current week, month or year

A common request is one report with sections for "this week", "this month" and "this year". Rather than
asking users for dates, filter each table (tablix) in the layout with date functions in the report's
custom code, for example a filter on `Fields!InvoiceDate.Value` between `=Code.StartOfMonth(Today())`
and `=Code.EndOfMonth(Today())`. The functions are on
[SSRS expressions and custom code](/platform/reporting/ssrs-expressions/#start-and-end-of-the-current-week-month-and-year).

## Related

- [Build a dashboard step by step](/kinetic/application-studio/dashboards/) if the users want to view the
  data on screen rather than print it
- [Troubleshooting](/platform/reporting/troubleshooting/#error-creating-a-baq-report-folder-not-allowed)
  for BAQ report creation errors

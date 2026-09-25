---
title: Troubleshooting
description: Symptoms, causes and fixes for common Epicor SSRS problems, from dataset aggregate and Fields collection errors to reports that stop after an upgrade, disabled report style actions, BAQ report creation errors and APR email failures.
env: both
sidebar:
  order: 9
sources:
  - title: "Stack Overflow: How can I specify a dataset aggregate in this SSRS expression?"
    url: https://stackoverflow.com/questions/34749680/how-can-i-specify-a-dataset-aggregate-in-this-ssrs-expression
  - title: "EpiUsers: SSRS error"
    url: https://www.epiusers.help/t/ssrs-error/79380
  - title: "EpiUsers: Error creating BAQ report"
    url: https://www.epiusers.help/t/error-creating-baq-report/41947
---

Fixes for the reporting problems that come up most. Each entry starts with what you see, then explains
why and what to do. For errors that only say the report failed, start with the SSRS log (see the
[last section](#finding-the-ssrs-log)).

## The value expression refers directly to the field without specifying a dataset aggregate

**Symptom:** the report won't build or upload, with an error like:

```text
The Value expression for the text box 'Textbox12' refers directly to the field 'CustID' without
specifying a dataset aggregate. When the report contains multiple datasets, field references outside
of a data region must be contained within aggregate functions which specify a dataset scope.
```

**Cause:** the text box is outside a data region (a table, matrix or list). Inside a data region, SSRS
knows which dataset `Fields!CustID` belongs to and which row to use. Outside one, the dataset could
have many rows and the report has several datasets, so SSRS needs to be told both.

**Fix:** wrap the field in an aggregate that names the dataset:

```vb
=First(Fields!CustID.Value, "OrderHed")
```

Use `First` for header-type values and `Sum`, `Max` and so on for totals. If the text box is *meant*
to be inside a table, it may have been dropped into the wrong place. Resizing or dragging over other
groups sometimes re-parents a text box. Drag it out and drop it back into the right cell.

## The Hidden expression references a field that doesn't exist in the Fields collection

**Symptom:** the report fails, or a section disappears, and the SSRS log shows something like:

```text
The Hidden expression for the tablix 'Tablix1' contains an error: The expression references the
field 'Calc_ReasonDescription', which does not exist in the Fields collection.
```

**Cause:** an expression (here, a visibility rule) uses a field the dataset doesn't provide. It happens
when a style is pointed at a different RDD, when a field is excluded in the RDD, or when a layout uses
a `Calc_` field that only the standard report's tables contain. Field names are also case-sensitive.

**Fix:** pick one:

- Include the field in the RDD and add it to the dataset's query and **Fields**. See
  [Add a field to a report](/platform/reporting/add-a-field/).
- Get the same value another way (a linked field or an added table) and change the expression to use
  it.
- If the rule isn't needed, remove the expression.

## The report stops running after you include more fields

**Symptom:** a report that worked fails to print after you cleared more **ExcludeColumn** boxes or
added a table to its RDD.

**Cause:** the RDD now extracts more columns than a report is allowed.

**Fix:** exclude every column that isn't displayed, used in an expression or used in a join. See
[Report data definitions](/platform/reporting/data-definitions/#exclusions-and-the-field-limit).

## Custom AR invoice stops printing after an upgrade

**Symptom:** an AR invoice style that has been in use for years stops printing after an upgrade, often
with errors about calculated fields.

**Cause:** the standard AR invoice report moved from the `ARForm` RDD to the `ARInvoice` RDD. Custom
RDDs copied from `ARForm` don't get Epicor's updates, and on upgrade Epicor checks each report's field
count against the limit. Old `ARForm` copies often have most columns included, so they fail the check,
and calculated fields the RDL expects may no longer line up.

**Fix:** either:

- remove the failing calculated fields from the RDL's dataset queries (for example
  `T2.Calc_MatDur` and its label alias), or
- exclude every column in the RDD that the report doesn't use, to get back under the limit.

In the longer term, rebuild the custom invoice on a copy of the current `ARInvoice` RDD.

## An RDD relationship won't join

**Symptom:** a relationship between two tables can't be saved or returns nothing, typically when
joining an Epicor table to a UD table.

**Cause:** the fields are different data types, for example `ShipDtl.PackNum` (integer) and a UD
table's `Key1` (string). RDD relationships only join matching types.

**Fix:** add a UD field of the right type (integer here) to the UD table, fill it with the key value,
and join on it. See [Report data definitions](/platform/reporting/data-definitions/#relationships).

## A new field doesn't print

**Symptom:** the field is in the RDD, the dataset and the layout, but nothing shows.

**Cause:** usually row or text box visibility, or the RDL join not matching the RDD relationship.

**Fix:** check **Row Visibility** on the row, then check the dataset query joins the table the same
way the RDD does. See [Add a field to a report](/platform/reporting/add-a-field/#gotchas).

## Report Style actions are greyed out

**Symptom:** **Download SSRS Report**, **Upload SSRS Report** and **Create SSRS Report** are disabled on
the **Actions** menu of Report Style Maintenance.

**Cause:** the user doesn't have the SSRS designer permission.

**Fix:** in **User Account Security Maintenance**, select **SSRS Report Designer** for the user, then
have them log out and back in. The actions also stay disabled on system report styles, so copy the
style first.

## Retrieve finds no images on a report style

**Symptom:** **Companies/Images > Retrieve** returns an empty list for a form.

**Cause:** the RDL has no `ReportImages` dataset.

**Fix:** copy the dataset and image item from a form that has them. See
[Images, logos and barcodes](/platform/reporting/images-and-barcodes/#retrieve-finds-nothing).

## Error creating a BAQ report: folder not allowed

**Symptom:** saving a new report in BAQ Report Designer fails with:

```text
Error creating or updating the report: System.Web.Services.Protocols.SoapException: The operation
you are attempting on item 'Folder' is not allowed for this item type.
```

**Cause:** Epicor creates each BAQ report from a template RDL, `BAQReport.rdl`, in the report server's
`reports/CustomReports` folder. On the system in question, a *folder* called `BAQReport` had been
created there instead of the file, so Epicor tried to read a folder as a report. This was reported on
Epicor 10.1 after an update.

**Fix:** delete the `BAQReport` folder on the report server and put a `BAQReport.rdl` template back,
either copied from another environment or recreated by Epicor when a BAQ report is next created.
<!-- TODO verify: that Epicor recreates BAQReport.rdl on its own; if not, the fix only works with a copied template -->

## A report won't open from its menu

**Symptom:** a BAQ or custom report can't be loaded from its menu item.

**Cause:** check the Report ID for a slash. Epicor builds a file path from the ID, and a slash breaks
it. It doesn't warn you when you save.

**Fix:** create the report again under an ID without slashes, and point the menu item at it.

## Upload fails on one style

**Symptom:** uploading a modified RDL to a style fails every time, even with a file you know is good.

**Fix:** copy the style, give the copy a new **Report Location** folder, and upload there. For Kinetic,
also check the `reports.zip` structure. See
[Deploy and upgrade reports](/platform/reporting/deploying-reports/#when-an-upload-keeps-failing).

## APR fails after inserting a field in the email template

**Symptom:** a report style's routing rule fails once a field has been inserted into the **Send
E-mail** template, and the task log shows:

```text
RunTask:System.InvalidOperationException: Invalid attempt to call FieldCount when reader is closed.
```

**Cause:** an Epicor defect, tracked as PRB0318470.

**Fix:** update to a release that includes the fix, or remove the inserted field until you can.

## Material Request Queue report won't print on 2026.1

**Symptom:** after moving to 2026.1, the Material Request Queue report from Fulfillment Workbench
doesn't print.

**Cause:** the report's code loops over a database query in a way that fails under Entity Framework
Core. See [Fix "There is already an open DataReader"](/platform/bpm/ef-core-open-datareader/) for the
pattern.

**Fix:** Epicor fixed it in a hotfix (reported as 15.0.65-hotfix.6). If you have your own code around this report
that loops over queries, add `.ToList()` before the loop.

## Summary Only is disabled on the Stock Status report

**Symptom:** **Summary Only** can't be selected, or the report won't run with it.

**Cause:** **Summary Only** is only available when **Sort By** is **By Warehouse/Part** or
**By Class/Part/Warehouse**, and it can't be combined with **Activity from Cut Off Date**.

**Fix:** change the sort, and clear **Activity from Cut Off Date**.

## Finding the SSRS log

On-premises, SQL Server Reporting Services writes its logs to
`C:\Program Files\Microsoft SQL Server Reporting Services\SSRS\LogFiles` by default. Errors in
expressions such as visibility rules often only appear there. The path is for SQL Server 2017 and
later; older versions keep the logs under the SQL Server instance's Reporting Services folder.

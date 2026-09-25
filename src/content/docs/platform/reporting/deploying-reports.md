---
title: Deploy and upgrade reports
description: Download and upload RDL files through Report Style Maintenance, build the reports.zip that Kinetic expects, test against saved data, move reports between environments and bring old 10.2 reports forward.
env: both
sidebar:
  order: 8
sources:
  - title: "EpiUsers: 10.2.700 to Kinetic SSRS reports"
    url: https://www.epiusers.help/t/10-2-700-to-kinetic-ssrs-reports/121042
---

You never edit a report on the report server directly. The RDL files go down to your machine through
the report style, you edit them in Report Builder, and they go back up the same way. This page covers
that round trip, the zip format the Kinetic client expects, and what changes when reports move between
environments or versions.

## The download/upload round trip

1. In **Report Style Maintenance**, select the style and choose **Actions > Download SSRS Report**.
2. Pick an empty local folder. Epicor recreates the server's folder structure under it, for example
   `reports\CustomReports\SalesOrderAcknowledgement\SOAck.rdl`, along with any subreports.
3. Edit the RDL in Report Builder and save it in place.
4. Back in the style, choose **Actions > Upload SSRS Report** and select the same root folder.

Both actions need the **SSRS Report Designer** security option. You can only upload to custom styles;
system styles are read-only.

## Uploading from Kinetic: reports.zip

In the Kinetic client, you upload a zip file instead of choosing a folder, and the zip has to be exact:

- It must be called `reports.zip`.
- Inside it, the folders must reproduce the report's path on the server, starting at `reports`.

| Style's report location | Inside `reports.zip` |
|---|---|
| Standard AR invoice folder | `reports/ARInvoiceForm/ARForm.rdl` |
| A custom sales order acknowledgment | `reports/CustomReports/SalesOrderAcknowledgement/SOAck.rdl` |

The RDL named in the style's **Report Location** must be in the zip at exactly that path, or the upload
fails. You can include the rest of the folder, such as a kit components subreport next to the main
report, but any `.rdl` that the report doesn't use as a subreport is ignored.

:::tip[Getting a useful error]
When an RDL has a problem, the upload only reports a generic failure. On-premises, upload the same file
directly to the report server through its web portal; SSRS gives a much more specific message there.
:::

<!-- TODO screenshot: reports.zip opened in Explorer showing reports > CustomReports > report folder > .rdl -->

## Testing against saved data

Two habits make report development faster:

- **Archive a sample run.** Print a representative document with an **Archive Period**, and you can
  re-preview that same data from the **System Monitor** after each upload.
- **Generate for design.** On the report form, **File > Generate for Design** extracts the data without
  printing. From the **System Monitor**, **Actions > Design SSRS Report** opens the SSRS Report Design
  program, where you can download the report, preview your local copy against that extracted data, and
  publish it when you're happy.
  <!-- TODO verify: Generate for Design and the SSRS Report Design program in the Kinetic client (documented for the Classic interface) -->

## Moving reports between environments

Use **Solution Workbench** to move custom reports from a test environment to production, so the report
style, its RDD and the RDL files travel together, rather than recreating styles by hand and uploading
files. <!-- TODO verify: which report elements a Solution Workbench solution includes -->

## When an upload keeps failing

Occasionally a style gets stuck: every upload fails even with a known-good RDL. Copy the style with
**Actions > Copy Report Style**, and in the copy change the **Report Location** to a new folder. Epicor
creates the new folder, which detaches the style from the broken one. Upload to the copy, then retire
the old style.

## Upgrading older reports

Custom reports built on Epicor 10.2 usually carry forward, but check these after an upgrade:

- **Re-upload through `reports.zip`.** If you're moving reports by hand from a 10.2 system to Kinetic,
  rebuild the folder structure above rather than uploading loose files.
- **AR invoices built on the old RDD.** Older custom AR invoice styles were copied from the `ARForm`
  RDD, while the standard report now uses the `ARInvoice` RDD. The old copies can stop printing after an
  upgrade because of the field limit. See
  [Troubleshooting](/platform/reporting/troubleshooting/#custom-ar-invoice-stops-printing-after-an-upgrade).
- **Custom code around reports.** Newer Kinetic releases run BPM and function code on Entity Framework
  Core, and code that loops over an open query can fail. See
  [Fix "There is already an open DataReader"](/platform/bpm/ef-core-open-datareader/).

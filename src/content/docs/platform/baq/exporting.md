---
title: Export BAQ results and use them in Excel
description: Get BAQ data into Excel or a file, with the BAQ Export Process, a BAQ Report with Excel output, Copy to Excel from a dashboard, or a live OData connection, and stop Excel mangling part numbers and dates.
env: both
sidebar:
  order: 8
sources:
  - title: "EpiUsers: Taking BAQ to an Excel report"
    url: https://www.epiusers.help/t/taking-baq-to-an-excel-report/71235
  - title: "EpiUsers: BAQ export to CSV formatting issues"
    url: https://www.epiusers.help/t/baq-export-to-csv-formatting-issues/76426/18
---

People ask for "the BAQ in Excel" all the time, but they mean different things: a one-off copy, a file that lands somewhere every morning, a formatted report, or a spreadsheet that refreshes itself. Pick the method by how often the data is needed and who needs it.

| Method | Best for | Refreshes? |
|---|---|---|
| Copy to Excel from a dashboard grid | One-off, ad hoc pulls by the user | No, copy again |
| BAQ Report with Excel output | Users who want a menu item, parameters and a consistent layout | Each time they run it |
| BAQ Export Process | A CSV or XML file for another system, on a schedule | On the schedule |
| Live OData feed into Excel | Spreadsheets and pivot tables that stay current | Whenever Excel refreshes |

## Copy from a dashboard

Put the BAQ in a dashboard and deploy it to a menu. Users right-click the grid and choose **Copy to Excel** (Classic), or use the grid's export or copy options (Kinetic). It's the least effort for you and needs no file access, but it's manual every time.

See [Build a dashboard step by step](/kinetic/application-studio/dashboards/) for the Kinetic side.

## BAQ Report with Excel output

Build a BAQ Report on the query and give its report layout a single table with a column for each BAQ field. When users run it, they choose an Excel format under **Output Format**. The data-only Excel formats give a clean sheet without report headers.

This suits reports that need options and filters on a form, a menu entry, or scheduling and printing like any other report.

## BAQ Export Process

**Business Activity Query Export Process** runs a query and writes the results to a file:

1. Select the **Query ID**.
2. Choose **Output Format**: **CSV** for Excel and other systems, **XML** for web pages and integrations.
3. Enter an **Output Filename**. By default the file goes to your user folder under the server's `EpicorData` processes directory. You can give a relative path at root level, or a network path such as `\\fileserver\share\exports\open-orders.csv` if the task agent can write there.
4. For CSV, set the **Text Delimiter** and tick **Output Labels** to include a header row.
5. Choose a **Schedule**. Pick a schedule other than **Now** and tick **Recurring** to refresh the file automatically.

If you can't reach the server's file system (cloud, for example), fetch the file with **Server File Download** under **System Management > Schedule Processes**.

:::note
**Export BAQ** in the designer exports the *query definition*, for moving the BAQ to another company or environment. It doesn't export data.
:::

## A live connection from Excel

Every BAQ a user can run is available through Epicor's REST API as an OData feed, and Excel can read OData directly. The result is a spreadsheet that refreshes on demand, and you can build pivot tables and charts on it.

1. In Excel, go to **Data > Get Data > From Other Sources > From OData Feed**.
2. Enter the BAQ's URL. For REST v2 it has this shape:

   ```text
   https://epicor-app01/Kinetic/api/v2/odata/EPIC06/BaqSvc/XX_OpenOrders/Data
   ```

3. When asked to sign in, choose **Basic** and enter your Epicor user name and password.
4. Click **Load**. Use **Refresh** (or Excel's refresh settings) to pull current data later.

BAQ parameters can be added to the URL as query string values (`?PartNum=PART-1001`), and OData options such as `$select` and `$filter` trim what comes back.

:::caution
REST v2 normally requires an API key on every request, and Excel's OData connector has no way to send one. Epicor's documentation says to turn off the v2 API key requirement on the server (the `EnforceApiKeyForRestApiV2` setting) for this to work, which is a security decision for your administrator. The v1 URL form (`/api/v1/BaqSvc/XX_OpenOrders/`) is the other common route. Whether either works on Epicor cloud, and without extra setup, can vary by release and hosting.
:::

The connection runs as the user who signed in, with their security. Anyone you share the workbook with needs their own Epicor login to refresh it.

## When Excel changes your data

Excel guesses column types when it opens a CSV, and guesses badly for ERP data.

**Part numbers lose zeros or turn into numbers.** `123.450000` becomes `123.45`, `00123` becomes `123`, and a long numeric ID turns into scientific notation. Don't double-click the CSV. Instead use **Data > From Text/CSV**, choose **Transform Data**, and set those columns to **Text** before loading. Tools that read the file directly (Access, Power Query, another system's import) have the same setting.

**Dates arrive with a time.** A `datetime` column exports its time part, even when the grid only showed the date. Convert it in the BAQ: a calculated field of type `date` (`CAST(OrderHed.OrderDate AS date)`), or a text field with a fixed format (`CONVERT(nvarchar(10), OrderHed.OrderDate, 23)` gives `yyyy-mm-dd`).

**Rows split in the wrong places.** Line breaks or delimiter characters inside descriptions and comments break a CSV's row structure. Strip them with `REPLACE` (see [Calculated fields](/platform/baq/calculated-fields/#text)) or choose a delimiter that can't appear in the data.

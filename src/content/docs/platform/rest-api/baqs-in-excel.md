---
title: Live BAQ data in Excel
description: Connect an Excel workbook to a BAQ through the REST API's OData feed so it refreshes with live Epicor data, and choose between v1 and v2 URLs.
env: both
sidebar:
  order: 4
---

Because the REST API speaks OData, Excel can read a BAQ directly and refresh it on demand, much like a
Power Query connection to a database. It's a quick way to build reconciliation sheets during an
implementation, or to give a team a refreshable report without building a dashboard.

## Before you start

- Build and test the BAQ. Share it, or make sure the account you'll connect with can run it.
- Excel 2016 or later (or Microsoft 365) is needed for OData 4, which REST v2 uses. v1 feeds use OData
  3 and work in older versions.
- Decide which API version to use (next section).

## v1 or v2?

Excel's OData connector can't send an API key header, and REST v2 requires a key by default. That
leaves three options:

| Option | Notes |
|---|---|
| **Use a v1 URL** | Simplest. No API key needed. `https://<server>/<instance>/api/v1/BaqSvc/<BAQ ID>/` |
| **Put the key in the v2 URL** | `…/api/v2/odata/<Company>/BaqSvc/<BAQ ID>/Data?api-key=<key>`. Typically works, but the key is saved in the workbook in plain text. Use a key limited by an access scope to the BAQs involved. |
| **Turn off the v2 key requirement** | Epicor documents a server setting (`EnforceApiKeyForRestApiV2`) for this. It affects every v2 caller, so it's an administrator's decision, and not something you can change on Epicor-hosted environments yourself. |

## Steps

1. **Get the URL.** Open the REST help page (`https://<server>/<instance>/apps/resthelp/`), choose
   **Business Activity Queries**, pick the company, the **API version** and your BAQ. Expand the
   execute or `GET /Data` call, click **Try it out**, then **Execute**, and copy the **Request URL**.
   You can also type the URL by hand using the patterns above.
2. Remove anything from the URL you don't want saved in the workbook, and add BAQ parameters if the
   query has any (`?CustID=ACME`).
3. In Excel, go to **Data > Get Data > From Other Sources > From OData Feed**.
4. Paste the URL and click **OK**.
5. When asked to sign in, choose the method that matches your environment, typically **Basic** with
   an Epicor user name and password, or an organisational account where Epicor uses Microsoft sign-in.
6. Pick the table in the navigator and click **Load** (or **Transform Data** to shape it in Power
   Query first).

From then on, **Data > Refresh All** (or right-click the table and choose **Refresh**) re-runs the BAQ.

## Tips

- **Keep a list of URLs per environment.** Test and production have different hosts, so each workbook
  (or each connection) is tied to one environment. A small "BAQ links" sheet saves hunting for them.
- **Filter in the BAQ, not in Excel.** Excel downloads every row before filtering. Adding criteria or
  BAQ parameters keeps refreshes fast.
- **Watch the row limit.** If a feed stops at exactly 100 rows, the server's default row limit is
  applying. Ask your administrator about the limit, or narrow the BAQ so it returns fewer rows.
- **Use a read-only account.** Credentials are stored with the workbook's connection on each user's
  machine. Give people an account that can run the BAQs but not change data, or use their own logins.
- **Pivot tables and charts** can sit on top of the loaded table and refresh with it.

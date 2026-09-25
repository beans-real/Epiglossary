---
title: REST API overview
description: What Epicor's REST API exposes, the differences between v1 and v2, where to find the interactive help page, and whether to use OData or the service methods.
env: both
sidebar:
  order: 1
sources:
  - title: "EpiUsers: Difference between API v1 and v2"
    url: https://www.epiusers.help/t/difference-between-api-v1-and-v2/104962/8
  - title: "EpiUsers: Let's Get Func-y: Epicor Functions"
    url: https://www.epiusers.help/t/lets-get-funcy-epicor-functions/59714
---

Epicor's REST API (Representational State Transfer) lets other programs talk to Epicor over HTTPS.
Almost everything the screens can do is available: every business object and its methods, reports and
processes, BAQs, and your own Epicor Functions. It's the supported way to connect a website, a
warehouse app, a CAD integration, Power BI or Excel to Epicor.

It works the same way whether users run Kinetic or the Classic client, because it talks to the
application server directly.

## What's exposed

| Resource | Examples | Notes |
|---|---|---|
| **Business objects** (`BO`) | `Erp.BO.CustomerSvc`, `Erp.BO.SalesOrderSvc` | Available as OData entity sets and as methods |
| **Simple services** (`Lib`), **processes** (`Proc`), **reports** (`Rpt`) | `Ice.Lib.SessionModSvc`, `Erp.RPT.WIPReportSvc` | Methods only, no OData |
| **BAQs** | `BaqSvc/XX_OpenOrders` | Read with `GET`; updatable BAQs can also be written |
| **Epicor Functions** | `efx/EPIC06/XX_SalesUtils/GetOrderTotal` | v2 only, always `POST` |

The same services the screens call are the ones you call. That means the quickest way to learn how to
do something over REST is to do it in a screen and watch the calls; see
[Find the method a screen calls](/platform/bpm/finding-the-right-method/).

## v1 and v2

Epicor ships two versions of the API side by side.

| | v1 | v2 |
|---|---|---|
| Base URL | `/api/v1/<Service>/…` | `/api/v2/odata/<Company>/<Service>/…` |
| OData version | OData 3 | OData 4 |
| Company | Sent in a header (or query option) | Part of the URL |
| API key | Not required | Required on every request by default |
| BAQ results | `/api/v1/BaqSvc/<BAQ>/` | `/api/v2/odata/<Company>/BaqSvc/<BAQ>/Data` |
| Epicor Functions | Not available | `/api/v2/efx/<Company>/<Library>/<Function>` |
| Output formats | JSON, Atom XML | JSON |

**Both versions require a user login.** The API key in v2 is an additional requirement on top of
authentication, not a replacement for it. See
[Authentication, API keys and integration accounts](/platform/rest-api/authentication/).

Use v2 for new work. Its URLs are clearer about which company you're in, API keys let you track and
restrict each integration, and functions are only available there. v1 is still useful for older tools
and for simple OData consumers such as Excel (see [Live BAQ data in Excel](/platform/rest-api/baqs-in-excel/)).

## The REST help page

Every application server hosts an interactive help page where you can browse services, see the exact
parameters and JSON shapes, and try calls with your own login.

| Page | URL |
|---|---|
| Kinetic REST help (v1 and v2) | `https://<server>/<instance>/apps/resthelp/` |
| Legacy help path (redirects to the above by default) | `https://<server>/<instance>/api/help/` |

For Epicor-hosted environments, `<server>` and `<instance>` are the host and first path segment of
the URL you use for Kinetic, for example `https://<yourhost>.epicorsaas.com/<instance>/apps/resthelp/`.

On the help page you can:

- pick the **company** and **API version** to work in
- set headers such as the **API key** once for every call you try
- browse **BO**, **Lib**, **Proc** and **Rpt** services, **Business Activity Queries** and
  **Epicor Functions**
- run a call and copy its request URL, body and a `curl` version

<!-- TODO screenshot: the Kinetic REST help page with a service selected and a method expanded, showing Try it out -->

## OData or methods?

Business objects can be reached two ways:

- **OData** (`GET /Customers?$filter=…`, `PATCH`, `POST`, `DELETE` on entity sets). Great for reading
  lists with filters, selecting columns and feeding OData-aware tools like Excel and Power BI.
- **Methods** (sometimes called RPC or custom methods: `GetByID`, `GetRows`, `GetNewOrderHed`,
  `ChangePartNum`, `Update`…). The same calls the screens make.

A practical rule: **read with whichever is convenient, write with methods.** OData writes go through a
generic update path, while the screens call a sequence of `GetNew…`, `Change…` and `Update` methods
that fill in defaults and dependent fields. Replaying that sequence gives you the same result a user
would get, and it's the approach most integrators settle on after OData writes behave differently from
the screen.

Read-only methods such as `GetByID`, `GetList` and `GetRows` can be called with `GET`; methods that
change data use `POST`.

## Things that trip up integrations

- **The default row limit.** OData and list calls return at most 100 rows unless you page with
  `$top`/`$skip` or the server's limit has been changed.
- **Case sensitivity.** Service names, entity sets, field names and `$` options must match case
  exactly.
- **BPM data forms and prompts.** A directive that pops up a BPM data form or asks the user a question
  can't be answered by an integration. Make those directives skip when the caller is your integration
  account (see [BPM conditions](/platform/bpm/conditions/)).
- **Environment-specific settings.** API keys, URLs and sometimes company IDs differ between test and
  production. Keep them in configuration, not in code.

## Pages in this section

- [Authentication, API keys and integration accounts](/platform/rest-api/authentication/)
- [Call Epicor from another application](/platform/rest-api/calling-epicor/)
- [Live BAQ data in Excel](/platform/rest-api/baqs-in-excel/)
- [Run a report through REST](/platform/rest-api/running-reports/)
- [Call external APIs from Epicor](/platform/rest-api/calling-external-apis/)
- [REST errors and troubleshooting](/platform/rest-api/errors-and-troubleshooting/)

Calling functions over REST is covered in
[Call a function](/platform/functions/calling-functions/#from-rest), and calling BAQs, services and
functions from Kinetic screens in
[Calling BAQs, services and functions](/kinetic/application-studio/calling-services/).

---
title: Call Epicor from another application
description: Worked HTTP and Python examples for reading data with OData, calling business object methods, updating a record, running a BAQ and calling an Epicor Function, plus paging and long-running work.
env: both
sidebar:
  order: 3
---

This page shows the calls an integration makes most, in plain HTTP and in Python. Everything uses REST
v2; set up a login and API key first (see
[Authentication, API keys and integration accounts](/platform/rest-api/authentication/)).

All examples use these placeholders:

| Placeholder | Meaning |
|---|---|
| `<server>/<instance>` | Your application server and instance, e.g. the host and first path segment of your Kinetic URL |
| `EPIC06` | The company ID |
| `<api key>` | An API key generated in that environment |

## A reusable client (Python)

```python
import requests

BASE = "https://<server>/<instance>/api/v2"
COMPANY = "EPIC06"

session = requests.Session()
session.auth = ("XX_API_User", "<password>")   # basic authentication
session.headers.update({
    "x-api-key": "<api key>",
    "Content-Type": "application/json",
})

def odata(path):
    return f"{BASE}/odata/{COMPANY}/{path}"
```

Keep credentials and the key in environment variables or a secret store in real code.

## Read a list with OData

```http
GET /<instance>/api/v2/odata/EPIC06/Erp.BO.CustomerSvc/Customers?$select=CustNum,CustID,Name&$filter=State eq 'OH'&$top=50 HTTP/1.1
Host: <server>
Authorization: Basic <base64 user:password>
x-api-key: <api key>
```

```python
r = session.get(odata("Erp.BO.CustomerSvc/Customers"), params={
    "$select": "CustNum,CustID,Name",
    "$filter": "State eq 'OH'",
    "$top": 50,
})
r.raise_for_status()
for c in r.json()["value"]:
    print(c["CustID"], c["Name"])
```

- Names are **case sensitive**: `Customers`, `CustID`, `$filter`.
- String values go in single quotes; dates as `2025-01-31T00:00:00`.
- Use `$select` to return only the columns you need. Full business object rows are large.

## Call a read-only method

Methods that don't change data (`GetByID`, `GetList`, `GetRows`) accept `GET` with parameters in the
query string:

```python
r = session.get(odata("Erp.BO.CustomerSvc/GetByID"), params={"custNum": 12})
customer = r.json()["returnObj"]["Customer"][0]
```

The method's return value comes back under `returnObj`.

## Update a record the way a screen does

Fetch the tableset, change it, mark the row, and send it to `Update`. This runs the same business logic
as saving in the screen.

```python
# 1. Get the record
ds = session.get(odata("Erp.BO.CustomerSvc/GetByID"),
                 params={"custNum": 12}).json()["returnObj"]

# 2. Change it and mark the row as updated
row = ds["Customer"][0]
row["PhoneNum"] = "555-0100"
row["RowMod"] = "U"

# 3. Save
r = session.post(odata("Erp.BO.CustomerSvc/Update"), json={"ds": ds})
r.raise_for_status()
saved = r.json()["parameters"]["ds"]
```

Methods that change data use `POST` with the method's parameters as JSON properties. Parameters the
method passes back by reference (like `ds` here) and `out` parameters come back under `parameters`.

When creating records or changing fields that trigger lookups (part numbers, customers on an order,
quantities), call the same `GetNew…` and `Change…` methods the screen calls, in the same order, before
`Update`. Watch the screen in the browser's **Network** tab to get the sequence; see
[Find the method a screen calls](/platform/bpm/finding-the-right-method/).

## Run a BAQ

The BAQ must be shared (or owned by the API user) and the user needs access to it.

```http
GET /<instance>/api/v2/odata/EPIC06/BaqSvc/XX_OpenOrders/Data?CustID=ACME&$top=100 HTTP/1.1
```

```python
r = session.get(odata("BaqSvc/XX_OpenOrders/Data"),
                params={"CustID": "ACME", "$top": 100})
rows = r.json()["value"]
for row in rows:
    print(row["OrderHed_OrderNum"], row["Calculated_OpenValue"])
```

- BAQ parameters go in the query string by name. Repeat the name for a list parameter
  (`?Status=A&Status=B`); give dates in ISO format.
- Columns are named `Table_Field` and `Calculated_Field`, as in the BAQ designer.
- `$filter`, `$select`, `$orderby` and `$top` work on BAQ results too.
- Updatable BAQs also accept `PATCH` on `/Data` to save changes.

BAQs make excellent read endpoints for integrations: the query can be tuned and tested in the BAQ
designer without touching the integration's code.

## Call an Epicor Function

```python
r = session.post(f"{BASE}/efx/{COMPANY}/XX_SalesUtils/GetOrderTotal",
                 json={"orderNum": 10001})
r.raise_for_status()
print(r.json().get("total"))
```

A function gives an integration one stable endpoint for a multi-step process, instead of a chain of
calls that each have to succeed. Publishing, company mapping and the `staging` URL for testing are
covered in [Call a function](/platform/functions/calling-functions/#from-rest).

## Paging through large results

List calls return at most 100 rows by default (administrators can change this limit on the server).
Page with `$top` and `$skip`, and stop when a page comes back short:

```python
def all_rows(path, page_size=100, **params):
    # page_size must not exceed the server's row limit, or every page looks "short"
    skip = 0
    while True:
        r = session.get(odata(path), params={**params, "$top": page_size, "$skip": skip})
        r.raise_for_status()
        batch = r.json()["value"]
        yield from batch
        if len(batch) < page_size:
            break
        skip += page_size
```

Sort on a key with `$orderby` when paging, so rows don't shift between pages.

## Long-running work

An HTTP call should finish in seconds. Work that takes minutes needs a different shape:

- **Processes and reports** (MRP, posting, report runs) are designed to be submitted to the System
  Agent rather than run inline. Submit the task and check its status or output afterwards; see
  [Run a report through REST](/platform/rest-api/running-reports/). If those tasks should run on a
  particular application server, set the **AppServer URL** in **System Agent Maintenance**.
- **Big batches of updates**: split them into smaller calls, and make each one safe to repeat so a
  timeout can be retried.
- **Heavy logic in a function**: consider having the integration drop its request into a UD table and
  a [scheduled function](/platform/functions/scheduling-functions/) process it, instead of holding
  the HTTP connection open.

## When a call fails

Errors come back as JSON with an HTTP status, a message and an error type. See
[REST errors and troubleshooting](/platform/rest-api/errors-and-troubleshooting/).

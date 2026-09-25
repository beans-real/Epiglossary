---
title: Call a function from BPMs, screens, REST and other functions
description: Every way to run an Epicor Function, the Invoke Function widget, BPM custom code, other functions, Application Studio and REST, with the company mapping and publishing rules that apply to each.
env: both
sidebar:
  order: 6
---

A function is only useful once something calls it. This page covers each caller and the rules that
decide whether the call is allowed.

## Rules that apply to every caller

- **Disabled** libraries and functions can't be called from anywhere.
- A **published** library must be mapped to the calling company on its **Security** card, including
  its own owning company. An **unpublished** library can be called from its owning company without
  mapping.
- **For Internal Use Only** functions can be called from BPM directives and other functions, but not
  over REST. Application Studio calls go through REST, so they're blocked too.
- A function always runs as the calling user, in the calling company. It sees that user's security.

## From a BPM directive

### The Invoke Function widget

In the BPM designer, drag **Invoke Function** from the **Callers** group onto the canvas and connect it.
Then, in its action text:

1. Click the library link and pick the library.
2. Click the function link and pick the function.
3. Click the parameters link and bind each one:
   - request parameters to a directive variable, a field or an expression, for example
     `ds.OrderHed[0].OrderNum`
   - response parameters to a directive variable of the same type, or to **[ignore]** if you don't
     need them

This keeps the directive readable: the flowchart shows *that* the work happens, and the function
contains *how*.

### From directive custom code

Custom code in a directive can call a function with the `this.InvokeFunction` helper, passing the
library ID, the function ID and the request parameters, and getting the response parameters back.

:::note
The `InvokeFunction` signature and return type vary between Kinetic releases. Check the helper's
parameters in the code editor on your version.
:::

If you only need to call one function, the widget is simpler and less likely to break on upgrade.

## From another function

Add the other library under **References > Libraries** (a library can call its own functions without
this). Then call it like a method:

```csharp
// A function in the same library
this.ThisLib.CalcFreight(orderNum);

// A function in another library
var total = this.EfxLib.XX_SalesUtils.GetOrderTotal(orderNum);
```

Dashes in library or function IDs become underscores in code. A single output can be assigned
straight to a variable. When the called function has several response parameters, read each one from
the result by its parameter name:

```csharp
var result = this.EfxLib.XX_SalesUtils.CheckCredit(custNum);
bool onHold = result.onHold;
string reason = result.reason;
```

In a Widget Function, the **Invoke Function** widget does the same thing without code.

## From Application Studio (Kinetic)

A Kinetic screen or dashboard calls a function with the `rest-erp` widget: leave **Service Name**
empty, put the function ID in **Service Operation** and the library ID in **ERP Functions Library**.
The full setup, including reading outputs as `{actionResult.OutputName}`, is in
[Calling BAQs, services and functions](/kinetic/application-studio/calling-services/#calling-an-epicor-function).

Because the call goes through REST, the function mustn't be **For Internal Use Only**, and a published
library must be mapped to the company the user is in.

## From REST

Functions are exposed only in REST API v2. Every call is an HTTP `POST` with the request parameters as
JSON properties in the body.

| Library state | URL |
|---|---|
| Published | `https://<server>/<instance>/api/v2/efx/<Company>/<LibraryID>/<FunctionID>` |
| Unpublished (testing) | `https://<server>/<instance>/api/v2/efx/staging/<Company>/<LibraryID>/<FunctionID>` |

```http
POST /<instance>/api/v2/efx/EPIC06/XX_SalesUtils/GetOrderTotal HTTP/1.1
Host: <server>
Authorization: Basic <base64 user:password>
x-api-key: <your API key>
Content-Type: application/json

{
  "orderNum": 10001
}
```

A successful call returns the response parameters as JSON:

```json
{
  "total": 1520.00,
  "message": "OK"
}
```

Things to know:

- Property names in the body must match the parameter names exactly. Unknown properties are ignored.
- Parameters you leave out arrive with default values: `false`, `0` or `null`. Validate inputs in the
  function rather than assuming the caller sent them.
- Response parameters that are `null` are left out of the JSON entirely, so check for missing
  properties in the caller.
- `404 Not Found` usually means the library isn't mapped to the company in the URL, is disabled, or is
  unpublished and you didn't use the `staging` URL.

Published functions are listed under **Epicor Functions** in the REST help page, where you can try them
with a form. See [Call Epicor from another application](/platform/rest-api/calling-epicor/) for
authentication and client examples.

## From a schedule

Functions can be run on a recurring schedule by the System Agent. See
[Schedule a function](/platform/functions/scheduling-functions/).

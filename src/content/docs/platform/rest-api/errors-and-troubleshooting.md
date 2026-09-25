---
title: REST errors and troubleshooting
description: Read Epicor REST API error responses, map HTTP status codes to their usual causes, and fix the common failures, from missing API keys and access scopes to business logic errors and expired sessions.
env: both
sidebar:
  order: 7
---

When a REST call fails, Epicor returns an HTTP status code and a JSON body describing the problem. This
page explains how to read that body and what the common codes usually mean.

## The error body

Errors look like this (XML instead if the request's `Accept` header asks for `application/xml`):

```json
{
  "HttpStatus": 400,
  "ReasonPhrase": "REST Api Exception",
  "ErrorMessage": "Part is required.",
  "ErrorType": "Ice.Common.BusinessObjectException",
  "ErrorDetails": [
    {
      "Message": "Part is required.",
      "Type": "Error",
      "Table": "OrderDtl"
    }
  ]
}
```

- `ErrorMessage` is the text to log and, often, to show a user.
- `ErrorType` tells you which layer rejected the call. `Epicor.RESTApi.ErrorHandling.ApiException`
  means the REST layer itself (bad URL, unknown service); `Ice.Common.BusinessObjectException` means
  Epicor's business logic (or a BPM) refused the data.
- `ErrorDetails` lists each problem, sometimes with the table and row. Update calls that fail on
  several rows return one entry per row.

Log the whole body in your integration, not just the status code.

## Status codes and usual causes

| Status | Typical `ErrorType` | Usual cause |
|---|---|---|
| **400** Bad Request | `BusinessObjectException`, `BLException` | Business logic rejected the data: a required field is missing, a value is invalid, or a BPM raised an exception. Read `ErrorMessage`. |
| **400** Bad Request | `ODataException` | The OData query is malformed: a misspelt field in `$filter`, wrong quoting, or wrong case. |
| **400** Bad Request | `BusinessObjectException` from a BAQ | An updatable BAQ's update failed; details list the rows. |
| **401** Unauthorized | | Missing or wrong credentials, or an expired token. |
| **403** Forbidden | `UnauthorizedAccessException` | The user or API key isn't allowed to use the service or method: menu/service security or the key's access scope. |
| **404** Not Found | `ApiException`, `RecordNotFoundException` | Wrong service or entity name (check case), a record that doesn't exist, or an Epicor Function that's unpublished, disabled or not mapped to the company. |
| **409** Conflict | `DuplicateRecordException` | Adding a record whose key already exists. |
| **410** Gone | `InvalidSessionException` | A session ID sent in a `SessionInfo` header has timed out. Log in again. |
| **500** Internal Server Error | various | An unexpected server error. Details are hidden from remote callers by default. |
| **503** Service Unavailable | `ConversionsPendingException` and others | The server isn't ready, for example after an upgrade with conversions still pending. |

## Common problems

### Every v2 call is rejected, but the login is right

The request has no `x-api-key` header or `api-key` parameter, the key was generated in a different
environment, it has expired, or it's disabled. Generate a key in the environment you're calling. See
[Authentication, API keys and integration accounts](/platform/rest-api/authentication/#api-keys-v2).
<!-- TODO verify: the exact status code and message returned when the v2 API key is missing or invalid -->

### It works in the help page but not from code

Compare the request in the help page's `curl` output with what your code sends. The usual differences
are the company in the URL, a missing `Content-Type: application/json` header on a `POST`, parameter
name case, and `GET` versus `POST` for the method.

### 403 even though the user can do it on screen

The API key's access scope doesn't include the service, method, BAQ or function. Add it to the scope,
or test with a key that has no scope to confirm that's the cause.

### Epicor Function returns 404

See [Troubleshooting functions](/platform/functions/troubleshooting/#rest-or-application-studio-gets-404-not-found):
company mapping, disabled, unpublished without the `staging` URL, or internal-only.

### A save works in the screen but fails over REST

The screen calls `Change…` methods before saving that fill in dependent fields; your call went
straight to `Update` (or used an OData `POST`/`PATCH`). Replay the screen's method sequence; see
[Call Epicor from another application](/platform/rest-api/calling-epicor/#update-a-record-the-way-a-screen-does).

A BPM directive can also be the difference: directives that show a BPM data form or ask a question
can't be answered by an integration. Make them skip for your integration account.

### Results stop at 100 rows

That's the default row limit. Page with `$top` and `$skip`; see
[Call Epicor from another application](/platform/rest-api/calling-epicor/#paging-through-large-results).

## Seeing more detail

- **Browser DevTools.** To see how a screen makes the call you're trying to copy, open DevTools
  (**F12** in Chrome and Edge, **Ctrl+Shift+I** in Firefox) and watch the **Network** tab while you
  work in Kinetic. Each request shows the URL, method, headers and JSON body.
- **Full error text (on-premises).** Remote callers get a generic message for server errors unless an
  administrator sets `SecureErrors` to `false` in the server's `host.config`. Only do that in test
  environments.
- **REST tracing (on-premises).** Adding the `trace://ice/fw/restapi` flag to `AppServer.config`
  writes REST call processing to the server log; `trace://ice/fw/servicecaller` adds which service
  each call loaded.

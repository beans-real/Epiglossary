---
title: Authentication, API keys and integration accounts
description: Log in to the Epicor REST API with basic or token authentication, create and handle API keys, restrict them with access scopes, and set up a dedicated account for each integration.
env: both
sidebar:
  order: 2
---

Every REST call has to say *who* is calling (authentication) and, in v2, *which application* is
calling (the API key). This page covers both, plus the account setup that keeps integrations running
when people's passwords change.

## Authentication

Always call the API over HTTPS. Epicor supports several ways to authenticate; the two you'll use from
code are:

**Basic authentication.** Send the user name and password, joined with a colon and Base64-encoded, in
an `Authorization` header:

```http
Authorization: Basic <base64 of user:password>
```

Simple, and fine for server-to-server integrations over HTTPS. The password travels with every call,
so the account must be one that exists only for the integration.

**Token authentication.** Exchange the user name and password for a bearer token once, then send the
token on each call:

```http
POST https://<server>/<instance>/TokenResource.svc/ HTTP/1.1
username: <user>
password: <password>
Accept: application/json
```

The response contains an access token. Use it until it expires:

```http
Authorization: Bearer <access token>
```

Environments that sign in through Azure AD / Microsoft Entra ID or Epicor Identity Provider can use
tokens from those services instead. Which ones are available depends on how your environment is
configured.
<!-- TODO verify: whether TokenResource.svc token authentication is available on Epicor-hosted environments that use Epicor Identity Provider -->

## API keys (v2)

REST v2 requires an API key on every request by default, in addition to the login. The key identifies
the *application*, which lets you:

- see which integration is making which calls
- restrict an integration to specific services, BAQs and functions with an access scope
- switch one integration off by disabling its key, without touching the user account

### Creating a key

1. Open **API Key Maintenance** and click **New**.
2. Enter a **Key ID**, **Name** and **Description** that say which integration uses it, for example
   `XX_Webstore`.
3. Optionally set an **Expire Date**, pick an **Access Scope**, and tick **All Companies** if the
   integration works in more than one company.
4. Save. The generated key is copied to your clipboard and shown **only once**. Store it somewhere safe
   straight away (a password manager or the integration's secret store).

If you lose it, use **Regenerate Key**; the old value stops working.

### Sending the key

Either as a header (best for code, set once on the HTTP client):

```http
x-api-key: <your API key>
```

or as a query-string parameter (handy for a single hard-coded URL):

```text
https://<server>/<instance>/api/v2/odata/EPIC06/Erp.BO.CustomerSvc/Customers?api-key=<your API key>
```

Treat a key in a URL as exposed: URLs end up in logs, browser history and screenshots.

### Keys belong to an environment

A key is created in one environment's database. Generate a separate key in each environment you call
(test, pilot, production) and keep the value in the integration's configuration per environment, not in
its code.

## Access scopes

An **access scope** (**Access Scope Maintenance**) lists the services, individual service methods,
BAQs and function libraries or functions an integration may use. Assign it to the integration's API
key, and calls made with that key can reach only what the scope lists; everything else is denied.

A key can have one access scope. Scopes are worth the setup for anything that faces the internet or a
third party: if the key leaks, the damage is limited to what the scope allows.

## A dedicated account per integration

Don't run integrations as a real person. Create an Epicor user account for each integration (or at
least one for integrations as a group), for example `XX_API_Webstore`:

- **Strong, long password** that isn't reused anywhere.
- **No forced password expiry.** If the password expires on a weekend, the integration stops and
  orders stop flowing until someone notices. Rotate the password on your own schedule instead, and
  update the integration at the same time.
- **Only the access it needs**: the companies, sites and menu or service security the integration
  requires. Pair it with an API key and access scope for defence in depth.
- **Recognisable name**, so change logs, `EntryPerson` fields and directive conditions can tell
  integration activity apart from people.
- **Documented owner**: record who looks after the account and which systems use it.

A named integration account also lets BPM directives behave differently for integrations, for example
skipping a directive that shows a BPM data form, which an integration can't answer.

## Choosing the company and site

In v2 the company is part of the URL. To set the site (plant) as well, or to set both in v1, send a
`CallSettings` header:

```http
CallSettings: {"Company":"EPIC06","Plant":"MfgSys"}
```

Values in the URL or query string take priority over the header. The API user must have access to the
company and site you ask for.

---
title: Kinetic vs Classic
description: What separates the Kinetic browser client from the Epicor 10 smart client, and which parts of Epicor are the same in both.
sidebar:
  order: 2
---

Epicor ERP has two user interfaces built on the same server. Most confusion about "does this work in my version?" comes down to which layer a feature lives in.

## The two clients

| | Classic (Epicor 10) | Kinetic |
|---|---|---|
| **Client** | Windows smart client (.NET WinForms) | Browser, or the Kinetic desktop wrapper |
| **UI customization** | Customizations in Developer Mode, C# in the Script Editor, Event Wizard | Application Studio layers, events, data rules, no C# on the client |
| **Client-side objects** | `oTrans`, `EpiDataView`, adapters, `Epi*` controls | Data views, events, widgets, `#_..._#` expressions |
| **Dashboards** | Classic dashboard designer | Application Studio dashboards |

Classic customizations **do not carry over** to Kinetic screens. Anything built in the Script Editor has to be rebuilt, usually as an Application Studio layer, with logic moved server-side.

## What's the same in both

The server hasn't changed underneath the UI. These work the same whichever client triggers them:

- **BPMs**: method directives and data directives
- **Epicor Functions**
- **BAQs** and updatable BAQs
- **SSRS reports**, report data definitions, report styles
- **REST API**, **DMT**, and the business objects themselves
- The business processes and their data: jobs, inventory transactions, scheduling, costing

That's why pages in the **Platform** and **Processes** sections are marked <span style="color:var(--eg-both)">**Kinetic + Classic**</span>.

:::tip
When porting a Classic customization, look first at whether the logic belongs in a BPM or Epicor Function. Server-side logic runs no matter which client, integration or REST call triggers the change, so it's the more robust home for business rules anyway.
:::

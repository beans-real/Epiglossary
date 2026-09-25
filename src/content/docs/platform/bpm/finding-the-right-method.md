---
title: Find the method a screen calls
description: Use browser DevTools, client tracing and the data dictionary to find the business object method, tableset and fields a BPM should use.
env: both
sidebar:
  order: 3
sources:
  - title: "EpiUsers: Kinetic Trace Helper Utility 1.0 (Kinetic web Chrome extension)"
    url: https://www.epiusers.help/t/kinetic-trace-helper-utility-1-0-kinetic-web-chrome-extension/108390
---

The hardest part of writing a BPM is rarely the logic. It's working out which method to hook, what the
tableset looks like, and which fields hold the values you care about. Guessing wastes hours; a trace
answers the question in minutes.

## The approach

1. Decide on the exact user action you want to react to: "clicking **Save** on a new order line",
   "changing the ship-to on an order", "ending an activity in MES".
2. Start a trace.
3. Perform that action once, and nothing else.
4. Read the trace to see which service methods ran, in what order, and with what data.
5. Put your directive on the method that matches the moment you care about.

## Tracing in Kinetic

Kinetic screens talk to the server over REST, so every method call is visible in the browser.

1. Open the screen in a browser (not the desktop wrapper).
2. Press **F12** to open DevTools and switch to the **Network** tab.
3. Optionally filter on `Svc` to hide static files.
4. Perform the action.
5. Select each request. The URL ends with the service and method, for example
   `Erp.BO.SalesOrderSvc/MasterUpdate`, and the **Payload** tab shows the tableset that was sent,
   including each row's `RowMod`.

<!-- TODO screenshot: DevTools Network tab filtered to Svc calls with a MasterUpdate request selected and its payload visible -->

The community-built Kinetic Trace Helper browser extension (see Sources) records these calls into a
readable list, which is quicker than clicking through raw network requests.

## Tracing in Classic

The Classic client can write a trace log of every business object call. Turn on tracing from the
client's **Tracing Options**, tick the options to include the dataset, perform the action, then open
the log file. <!-- TODO verify: exact menu path to Tracing Options in the Classic client -->

If your server is on-premises, server-side tracing is also available; see the Epicor system
administration documentation.

## Kinetic and Classic may call different methods

Don't assume a directive built from a Classic trace will fire in Kinetic, or the other way round.
Screens were rebuilt for Kinetic and some call different wrapper methods or extra helper methods.
Trace in the client your users actually use, and trace again after upgrades.

## Finding tables and fields

Once you know the method, you need field names.

- **Data Dictionary Viewer** (**System Setup > System Maintenance > Data Dictionary Viewer**) lists
  every table, field, data type and index. Indexes matter: filtering on indexed fields keeps BPM
  queries fast.
- In **Application Studio**, select a control and look at its binding (the `EpBinding` property) to
  see which table and field it shows.
- In Classic, **Field Help** on a control shows the table and field under its technical details.
- The trace payload itself shows every column in the tableset, including calculated ones that don't
  exist in the database.

## Reading someone else's code

Sample code from forums and existing directives in your own system is a good way to learn syntax and
the names of types. It's less useful for finding the *right* method, because the sample may have been
written for a different version or a different screen. Use samples for "how do I write this", and
traces for "where does this go".

## Next steps

- [The BPM tableset: ds, tt and RowMod](/platform/bpm/dataset-and-rowmod/) explains what you're looking
  at in the payload.
- [Method directives vs data directives](/platform/bpm/method-vs-data-directives/) helps you decide
  whether the method you found is the best hook at all.

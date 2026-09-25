---
title: Classic dashboards overview
description: How classic (smart-client) dashboards are built from BAQs, grids and tracker views, how to deploy one and put it on the menu, and the choice between Dashboard-Assembly and Dashboard-Runtime.
env: classic
sidebar:
  order: 1
---

A classic dashboard is a smart-client screen assembled from one or more **BAQs**. You design it in the **Dashboard** program, deploy it as a compiled assembly, and add it to the menu like any other program. No code is needed for most dashboards, although a deployed dashboard can be customized like any Classic form.

If you're building for Kinetic, see [Build a dashboard step by step](/kinetic/application-studio/dashboards/) instead.

## The pieces

| Piece | What it does |
|---|---|
| **Query** | A shared BAQ added with **New > New Query**. Filters set in the **Dashboard Query Properties** apply to every view of that query. |
| **Grid view** | Shows the query's rows. Has its own filters, **Show Group By** and **Show Summaries**. |
| **Tracker view** | A search panel for the query: the columns you tick as **Prompt** become input fields that filter the grid. |
| **Publish / subscribe** | A query can publish columns that another query subscribes to, so selecting a row in one grid filters the next. |
| **Chart view** | A chart built from the query's results. |

Queries whose IDs start with `z` are Epicor's own system queries. You can use them but not edit them; copy one in the BAQ Designer if you need a variation.

## Build and deploy

1. Open **Executive Analysis > Business Activity Management > General Operations > Dashboard**. If there's no **New** menu, turn on **Tools > Developer**.
2. **New > New Dashboard**: enter a **Definition ID** and caption.
3. **New > New Query**: pick the BAQ. Add tracker views, extra grids and publish/subscribe links as needed.
4. Check it on the **Dashboard** tab with **Refresh**, then **Save**.
5. **Tools > Deploy Dashboard**. Tick **Deploy Smart Client Application** and click **Deploy**. Wait for the status pane to show it's finished.
6. In **Menu Maintenance**, add a menu item: choose where it goes, give it a **Menu ID** and **Name**, pick **Program Type** `Dashboard-Assembly`, and select the dashboard.
7. Save. Users see the item after restarting the client.

Use an **Order Sequence** that isn't already taken in that menu folder; duplicates under the same parent aren't allowed.

## Dashboard-Assembly or Dashboard-Runtime?

Menu Maintenance offers two program types for dashboards:

- **Dashboard-Assembly** runs the compiled assembly produced by **Deploy Dashboard**. It's the normal choice for new dashboards and gives users features such as exporting the grid straight to Excel.
- **Dashboard-Runtime** is the older, legacy approach that runs the dashboard from its definition.


:::caution
Deployed dashboards are cached on each client. After you redeploy, users may keep seeing the old version until their client cache is cleared; see [Classic client troubleshooting](/classic/administration/troubleshooting/#clearing-the-client-cache).
:::

## Kinetic versions of classic dashboards

The same **Deploy Dashboard** window can also generate a Kinetic version of the dashboard (**Preview Kinetic**, then **Generate Kinetic Form**). The generated app is added to the menu with **Program Type** `Kinetic App`. It's a useful starting point when moving to Kinetic, though anything you customized in the classic dashboard has to be rebuilt; see [Migrating to Kinetic](/classic/migrating-to-kinetic/).

## In this section

| Page | What it covers |
|---|---|
| [Tracker filters with a BAQ combo](/classic/dashboards/tracker-baq-combo/) | A drop-down filter on a tracker view, fed by its own BAQ |
| [Grid summaries and grand totals](/classic/dashboards/grid-summaries-and-totals/) | Summaries, totals at the top, and a grand total that survives grouping |
| [Mass updates with Uptake from Excel](/classic/dashboards/uptake-from-excel/) | Editing many rows of an updatable dashboard from a spreadsheet |

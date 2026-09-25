---
title: Application Studio overview
description: What Application Studio is, how its layers, data views, events and data rules fit together, and where to look first when a change doesn't behave.
env: kinetic
sidebar:
  order: 1
---

Application Studio is the designer built into Kinetic for changing screens and building new ones. You use it to add fields, hide things, react to user actions, pull in extra data and build dashboards. There's no client-side C# like the old Classic customizations. Everything is configured from a small set of building blocks, and your changes are saved in a **layer** that sits on top of the base application.

This page explains those building blocks and how they talk to each other. The rest of this section goes into each one.

## Opening Application Studio

There are two ways in:

- **From a running screen**: open the application, then choose **Application Studio** from the overflow menu (the three dots at the top right), or press **Ctrl+Alt+D**.
- **From the home page**: go to **System Management > Kinetic Application Management > Application Studio**. The grid lists every application and layer. Click a **Layer Name** link to open it.

You need **Customize Privileges** on your user account (**User Account Security Maintenance**) to create layers. Users with only dashboard developer rights can work on the base of dashboards but can't create layers.

![The Application Studio home page: the Applications grid lists each application with its Layer Name link, Type, Has Draft, Published, System, CGC Code and Company columns](/images/5b09230674826be84a253b0d955d31ff6c0ebe42-2-690x189.png)

## The five designers

The left sidebar switches between designers. Each one edits a different part of the application.

| Designer | What you change there | Read more |
|---|---|---|
| **Application Map** | The page structure: landing page, tabs, pages, slide-out panels | [Pages, tabs and slide-outs](/kinetic/application-studio/pages-tabs-and-slide-outs/) |
| **Layout** | The controls on a page: panel cards, text boxes, grids, buttons | [Layout, controls and toolbars](/kinetic/application-studio/layout-and-controls/) |
| **Data Views** | The client-side tables the screen works with | [Data views](/kinetic/application-studio/data-views/) |
| **Events** | Sequences of actions that run when something happens | [Events](/kinetic/application-studio/events/) |
| **Data Rules** | Conditions that continuously style, disable, hide or set fields | [Data rules](/kinetic/application-studio/data-rules/) |

Each item you open appears in its own tab across the top of the designer, so you can have a page layout, an event and a data view open side by side. The **Problems** panel at the bottom lists validation errors, such as an event with a disconnected widget or an incomplete rule.

![Application Studio with the designer icons in the left sidebar, four tabs open across the top (Application Map, a data view, a page and an event) and the Problems panel expanded at the bottom](/images/8ad1ceedd8dcd0f936ce6eed3ab994f236f6920e-2-690x336.png)

## Layers

A layer is a named package of changes applied on top of the base application. The base itself is never edited, so when Epicor updates the base screen your layer is reapplied on top. Layers are saved as drafts and only take effect once they're **published** and attached to a menu. Details are in [Layers](/kinetic/application-studio/layers/).

## How a Kinetic screen works

Almost every problem in Application Studio makes sense once you understand this: **Kinetic screens are driven by data, not by controls.**

- **Data views** hold rows of data on the client. Some come from the server (`OrderHed`, `JobHead`), some are scratch areas (`TransView`), some hold system information (`Constant`, `KeyFields`, `CallContextBpmData`).
- **Controls don't hold values.** A text box shows whatever is in the data view column named in its **EpBinding**, for example `OrderHed.PONum`. Two controls bound to the same column always show the same value.
- **When a value in a data view changes, everything subscribed to it reacts.** Bound controls redraw, data rules re-evaluate, child data views refilter against their parent, and events with a **DataTable > Column Changed** trigger fire.
- **Events change data**, most often with the `row-update` widget, and that change is what everything else reacts to.

This is a publish/subscribe model: a data view publishes changes and everything bound to it subscribes. It's also why the most reliable fix is usually "drive it from the data". React to a column changing rather than to a control losing focus, and hide a field with a rule on its data rather than toggling the control from several events.

```text
user types / event runs row-update
            │
            ▼
   data view column changes ──► bound controls redraw
            │                 ├─► data rules re-evaluate (style, disable, hide, set)
            │                 ├─► child data views refilter (parent/child)
            │                 └─► "Column Changed" / "Row Changed" events fire
            ▼
   save sends the changed rows to the server (BO method, BPMs run there)
```

## Where to look first when something doesn't work

Work down this list before rebuilding anything:

1. **Are you running the layer you think you are?** Drafts aren't used by menus. Publish the layer and check that the menu item's **Kinetic Customizations** field points at it. Preview doesn't pick up changes automatically either, so click **Preview** again after saving.
2. **Save, close and reopen the layer.** Some changes, particularly to grids and data views, don't load properly in a preview launched straight after editing.
3. **Check the Problems panel** in Application Studio for errors on the event or rule you changed.
4. **Turn on browser debugging.** Open the browser console, click into the screen, press **Ctrl+Alt+8** and repeat the action. You'll see each event, every widget it ran and how every condition evaluated. See [Debugging](/kinetic/application-studio/debugging/).
5. **Look at the data.** Press **Ctrl+Alt+V** to dump the data views. If the column your control is bound to is empty or missing, the problem is upstream: the event that should have filled it didn't run or ran at the wrong time.
6. **Look at the rules.** **Ctrl+Alt+1** shows data rules as a tree. A rule silently wins over an event that changes the same property.
7. **Look at the network.** In the browser's **Network** tab, failed server calls show up in red with the error in the response.

Known symptoms and their fixes are collected in [Troubleshooting](/kinetic/application-studio/troubleshooting/).

## In this section

**Foundations**

- [Layers](/kinetic/application-studio/layers/): create, save, publish, copy, merge, export and import layers, and promote personalizations.
- [Layout, controls and toolbars](/kinetic/application-studio/layout-and-controls/): property groups, containers, hiding controls, toolbar tools and the data tree.
- [Pages, tabs and slide-outs](/kinetic/application-studio/pages-tabs-and-slide-outs/): page types, new pages, tabs inside panel cards and slide-out panels.

**Data**

- [Data views](/kinetic/application-studio/data-views/): system and custom data views, columns, tools and the current row.
- [BAQ data views and parent/child filtering](/kinetic/application-studio/baq-data-views/): show BAQ results that follow the current record.

**Behavior**

- [Events](/kinetic/application-studio/events/): triggers, hooks and widgets, and extending or overriding system events.
- [Common event patterns](/kinetic/application-studio/event-patterns/): recipes for typed values, row selection, refreshing, finding rows and focus.
- [Expressions and JavaScript](/kinetic/application-studio/expressions/): `{View.Column}` placeholders, `#_..._#` JavaScript and working with dates.
- [Data rules](/kinetic/application-studio/data-rules/): conditions and actions, null checks, copying system rules.
- [Calling BAQs, services and functions](/kinetic/application-studio/calling-services/): the `erp-baq` and `rest-erp` widgets.

**Controls**

- [Combo boxes](/kinetic/application-studio/combo-boxes/): static lists, BAQ-driven lists, custom values and filtering options.
- [Grids and panel card grids](/kinetic/application-studio/grids/): binding a grid, adding columns, sizing, loading and hiding tools.
- [Add columns to an existing grid](/kinetic/application-studio/add-columns-to-existing-grid/): extend a base grid's data with a post-processing BPM.

**Dashboards**

- [Build a dashboard step by step](/kinetic/application-studio/dashboards/): from a BAQ to a menu item and a solution for production.
- [Dashboard parameters and filters](/kinetic/application-studio/dashboard-parameters-and-filters/): filter fields, BAQ parameters and multi-value inputs.
- [Updatable BAQ grids](/kinetic/application-studio/updatable-baq-grids/): editable grids that save through a uBAQ.
- [Charts in dashboards](/kinetic/application-studio/dashboard-charts/): two ways to show a chart.

**When things go wrong**

- [Debugging](/kinetic/application-studio/debugging/): browser console, keyboard shortcuts, `epDebug` commands, network traces and debugging before the form loads.
- [Troubleshooting](/kinetic/application-studio/troubleshooting/): symptoms, causes and fixes.

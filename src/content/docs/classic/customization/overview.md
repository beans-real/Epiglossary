---
title: Classic customization overview
description: How Epicor 10 smart-client customizations work, the layers a form is built from, how to open the customization tools, and where to go next in this section.
env: classic
sidebar:
  order: 1
sources:
  - title: "EpiUsers: Base extension vs customization"
    url: https://www.epiusers.help/t/base-extension-vs-customization/49481/3
---

In the Epicor 10 smart client (and the Classic forms that still ship alongside Kinetic), you change a screen with an **embedded customization**. A customization is a named layer, stored on the server as XML, that adds controls, changes control properties and carries C# code that runs inside the form. The base form is never edited, so an upgrade replaces the base and your layer is applied on top again.

If you're on Kinetic and wondering whether any of this carries over: it doesn't. See [Migrating to Kinetic](/classic/migrating-to-kinetic/) and [Kinetic vs Classic](/start/kinetic-vs-classic/).

## Layers and load order

A Classic form is assembled from several layers. Each one starts from the result of the layers below it, so a customization inherits whatever Epicor or a partner already changed.

| Layer | Who builds it | Notes |
|---|---|---|
| Base form | Epicor | The compiled UI assembly. |
| Base extension | Epicor, sometimes partners | Often used to turn an entry form into a tracker. Not company specific. |
| Productization / product extension | Epicor | Product variants of a form. Largely obsolete. |
| Verticalization | Epicor or partners | Industry-specific variants. Loads when the database has the matching vertical code. |
| Localization | Epicor country-specific teams, or you | Language and country changes. Has no parent layer, so it applies whatever sits below it. |
| **Customization** | You | The layer this section is about. Can be company specific or shared by all companies. |
| **Personalization** | Each user | Grid column order, sizes, colours. Always company specific. |

You can't change the Epicor and partner layers, but your customization can hide, move or react to anything they added.

## Before you start

- Your user needs **Customization privileges** in **User Account Security Maintenance**. System administrator rights alone aren't enough.
- Turn on **Developer Mode**: from the Classic menu, **Options > Developer Mode**, or press **Ctrl+Shift+D**. From the Modern Shell and Kinetic-style home pages it's in the settings/utilities area.
- Open the form you want to change. In Developer Mode the **Select Customization** window appears first. Pick an existing customization to edit it, or pick nothing and click **OK** to start a new one. **Base Only** opens the form with no layers at all, which is the quickest way to prove whether a problem comes from a customization.
- With the form open, choose **Tools > Customization** to open the **Customization Tools Dialog**.

:::note
Some forms can't be customized at all, for example the BAQ Designer. When you open one of those in Developer Mode you get a message instead of the **Select Customization** window, and **Tools > Customization** is missing.
:::

## The Customization Tools Dialog

This window floats over the form you're changing and holds everything you'll use:

| Tab or menu | What it's for |
|---|---|
| Tree view (left) | Every control on the form. Select one to see its properties. |
| **Properties** | Visible, ReadOnly, Location, Size, Text, **EpiBinding** (the `View.Column` a control shows) and the control's **EpiGuid**. |
| **Wizards** | Sheet Wizard (new tabs), Rule Wizard (row rules), Form Event Wizard and Event Wizard (code stubs), Customization Code Wizards (adapter references, simple searches and more). |
| **Script Editor** | The C# for the customization. |
| **Tools > ToolBox** | Custom controls: `EpiTextBox`, `EpiButton`, `EpiUltraGrid`, `BAQCombo` and friends. |
| **Tools > Data Tools** | Foreign key views and sub-table views that bring extra tables into the form. |
| **Tools > Object Explorer** | Browse the form's data views, adapters and session objects. |
| **Tools > Test Code** (F5) | Compile the script and report errors without saving. |

## What's in this section

| Page | What it covers |
|---|---|
| [The Script Editor and events](/classic/customization/script-editor-and-events/) | The script skeleton, wiring and unwiring events, the Event and Form Event wizards |
| [EpiDataViews and oTrans](/classic/customization/epidataviews-and-otrans/) | Reading and writing form data, reacting to row changes, defaults, passing data to and from BPMs |
| [Adapters, BAQs and searches](/classic/customization/adapters-and-baqs/) | Calling business objects, running BAQs, validating with searches, hooking the form's own adapter calls |
| [Toolbars and tool clicks](/classic/customization/toolbars-and-tool-clicks/) | Reacting to Save, Clear, Refresh, adding a menu tool, hiding a tool |
| [Controls and styling](/classic/customization/controls-and-styling/) | Native controls by EpiGuid, colours, tooltips, grid tweaks, pop-up dialogs |
| [Row rules](/classic/customization/row-rules/) | Rule Wizard and coded row rules, and working around a base rule that locks a field |
| [Foreign key views](/classic/customization/foreign-key-views/) | Showing fields from tables the form doesn't load |
| [Custom grids and data views](/classic/customization/custom-grids-and-data-views/) | An in-memory data view behind a grid, loaded from a BAQ and saved to a UD table |
| [Printing from a customization](/classic/customization/printing-from-customizations/) | Printing or emailing a report from a button, batch printing with attachments |
| [Managing customizations](/classic/customization/managing-customizations/) | Saving, work-in-progress, menu deployment, export, import and verification |

:::tip
Before writing client code, ask whether the rule should hold no matter where the data comes from. If it should, it belongs in a [BPM](/platform/bpm/overview/), which also keeps working after you move to Kinetic.
:::

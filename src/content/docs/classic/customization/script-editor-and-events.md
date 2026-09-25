---
title: The Script Editor and events
description: Understand the structure of a Classic customization script, wire and unwire event handlers correctly, and use the Event Wizard and Form Event Wizard to generate them.
env: classic
sidebar:
  order: 2
---

Every Classic customization has one C# script, edited on the **Script Editor** tab of the Customization Tools Dialog. Almost everything you write is an **event handler**: a method that runs when a button is clicked, a field changes, a row loads or the form calls a business object. This page explains the shape of the script and how handlers get connected.

## The script skeleton

A new customization starts with a class called `Script` and two methods that Epicor calls for you:

```csharp
public class Script
{
    // Begin Wizard Added Module Level Variables **
    private EpiDataView edvOrderHed;
    // End Wizard Added Module Level Variables **

    // Add Custom Module Level Variables Here **
    private int lastOrderNum;

    public void InitializeCustomCode()
    {
        // Begin Wizard Added Variable Initialization
        this.edvOrderHed = (EpiDataView)this.oTrans.EpiDataViews["OrderHed"];
        // End Wizard Added Variable Initialization

        // Begin Wizard Added Custom Method Calls
        this.btnCheck.Click += new System.EventHandler(this.btnCheck_Click);
        // End Wizard Added Custom Method Calls
    }

    public void DestroyCustomCode()
    {
        // Begin Wizard Added Object Disposal
        this.btnCheck.Click -= new System.EventHandler(this.btnCheck_Click);
        this.edvOrderHed = null;
        // End Wizard Added Object Disposal

        // Begin Custom Code Disposal
        // End Custom Code Disposal
    }
}
```

- `InitializeCustomCode()` runs first, before the form's own `Load`. Use it to grab data views and controls, subscribe to events and set up anything the rest of the script needs.
- `DestroyCustomCode()` runs when the form closes. Unsubscribe everything you subscribed and release objects.
- The `Begin/End Wizard ...` comments are markers the wizards write between. Leave them in place, and put your own code outside them (or in the "Custom" regions) so a wizard never overwrites it.

Several objects are always in scope:

| Object | What it is |
|---|---|
| `oTrans` | The form's transaction object: its data views, its main adapter, and methods such as `Update()` and `Refresh()` |
| `csm` | The customization script manager: native control lookup, adapter list, custom data views |
| `baseToolbarsManager` | The Infragistics toolbar manager for the form's menus and toolbar |
| Your custom controls | Every control you added with the ToolBox, by its **Name** (for example `btnCheck`) |
| The form itself | Named after the form class, for example `SalesOrderForm` or `RQForm` |

## Wiring an event by hand

The Event Wizard writes the wiring for you, but it's worth knowing what it produces so you can fix it when a handler "doesn't fire". Three pieces are needed:

1. The handler method, with the right signature for the event.
2. A `+=` subscription in `InitializeCustomCode()`.
3. A matching `-=` in `DestroyCustomCode()`.

```csharp
private void txtStatus_TextChanged(object sender, System.EventArgs args)
{
    // your logic
}

// in InitializeCustomCode()
this.txtStatus.TextChanged += new System.EventHandler(this.txtStatus_TextChanged);

// in DestroyCustomCode()
this.txtStatus.TextChanged -= new System.EventHandler(this.txtStatus_TextChanged);
```

:::caution
A handler that exists but was never subscribed compiles fine and simply never runs. When pasting a handler from somewhere else, always add the subscription too. Forgetting the `-=` is the opposite problem: handlers can pile up and run more than once after the form is reopened in the same session.
:::

## The Event Wizard (your controls)

Use **Wizards > Event Wizard** for events on controls you added yourself:

1. Pick a **Control Type Filter** (for example `EpiButton`) and then the control.
2. Choose the event from **Available Control Events** (`Click`, `Validated`, `TextChanged`, `Enter`...).
3. Click the right arrow, then **Update Selected Event Code**.

The wizard adds the empty handler, the subscription and the disposal. Useful control events:

| Event | Fires when | Typical use |
|---|---|---|
| `Click` | A button is clicked | Run an action |
| `Validated` | The user leaves a control after changing it | Look something up from what was typed, as in [Adapters, BAQs and searches](/classic/customization/adapters-and-baqs/) |
| `TextChanged` | Every change to the text | Live styling; avoid heavy work here |
| `Enter` | The control gets focus | For example `numQty.SelectAll()` so a scan or keystroke replaces the old value |

## The Form Event Wizard (the form and its data)

**Wizards > Form Event Wizard** covers events raised by the form, its data views and its adapters:

| Event | Runs | Use it for |
|---|---|---|
| `Load` | After `InitializeCustomCode()`, when the form opens | Defaults, hiding things, initial state |
| `Closing` | When the form closes | Clean-up |
| `EpiViewNotification` | When a data view loads or its current row changes | Reacting to "a record is now showing" ([details](/classic/customization/epidataviews-and-otrans/)) |
| `BeforeFieldChange` / `AfterFieldChange` | Before or after a bound column changes | Validation (throw to block the change) or filling related fields |
| `BeforeRowChange` / `AfterRowChange` / `ListChanged` | Grid row changes | Row-level reactions in multi-row views |
| `BeforeAdapterMethod` / `AfterAdapterMethod` | Around any business object call the form makes | Hooking `Update`, `GetByID` or a `Change...` method ([details](/classic/customization/adapters-and-baqs/#hooking-the-forms-own-adapter-calls)) |
| `BeforeToolClick` / `AfterToolClick` | Around toolbar and menu clicks | See [Toolbars and tool clicks](/classic/customization/toolbars-and-tool-clicks/) |
| `Retrieve` | The **Retrieve** button on trackers | Refreshing custom panels |

In `BeforeFieldChange`, throwing an exception keeps the user in the field with the old value:

```csharp
private void OrderDtl_BeforeFieldChange(object sender, DataColumnChangeEventArgs args)
{
    if (args.Column.ColumnName == "OrderQty" && (decimal)args.ProposedValue <= 0)
    {
        throw new UIException("Quantity must be greater than zero.");
    }
}
```

## Assembly references and `extern alias`

To use a business object adapter the script needs references to its assemblies. Add them with **Tools > Assembly Reference Manager**, or with **Wizards > Customization Wizards > Reference Adapter/BL Assemblies** (click **Get Adapters**, pick the adapter, **Finish**). In newer 10.2 releases the script then gains lines such as:

```csharp
extern alias Erp_Contracts_BO_Part;
extern alias Erp_Adapters_Part;
```

These go at the very top of the script, before the `using` lines. If you copy code between customizations and get "type or namespace could not be found" errors, a missing reference or alias is the usual cause.

## Testing and debugging

- **Tools > Test Code** (F5) compiles the script and lists errors in the output pane. Do this before every save.
- `MessageBox.Show(...)` or `EpiMessageBox.Show(...)` is the quickest way to see a value while you work. Remove them before you release.
- In the `AfterAdapterMethod` stub the wizard leaves a commented `EpiMessageBox.Show(args.MethodName)`. Uncomment it temporarily to learn which methods the form calls.
- With Visual Studio installed on the client machine you can attach a debugger and step through customization code.

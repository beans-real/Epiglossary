---
title: Toolbars and tool clicks
description: React to Save, Clear, New and Refresh in a Classic customization, add your own item to the Actions menu, enable it from the data, and hide base tools users shouldn't click.
env: classic
sidebar:
  order: 5
---

Everything on a Classic form's menu bar and toolbar is an Infragistics tool held by `baseToolbarsManager`. Each tool has a **key** such as `SaveTool` or `ClearTool`. Customizations use those keys to react to clicks, to add tools and to hide them.

## Reacting to toolbar clicks

Add a `BeforeToolClick` or `AfterToolClick` handler with the **Form Event Wizard**, then check `args.Tool.Key`.

```csharp
private void QuoteForm_AfterToolClick(object sender, Ice.Lib.Framework.AfterToolClickEventArgs args)
{
    switch (args.Tool.Key)
    {
        case "ClearTool":
        case "EpiAddNewnewLine":
            // the user cleared the form or started a new line: blank our unbound fields
            txtOnHand.Text = string.Empty;
            txtAvailable.Text = string.Empty;
            break;
    }
}
```

- **After** runs once the base behaviour has finished, which is right for tidying up custom controls.
- **Before** runs first. Setting `args.Handled = true` there stops the base behaviour, for example to block **Save** until a custom check passes.

```csharp
private void SalesOrderForm_BeforeToolClick(object sender, Ice.Lib.Framework.BeforeToolClickEventArgs args)
{
    if (args.Tool.Key == "SaveTool" && string.IsNullOrEmpty(txtXX_Reason.Text))
    {
        MessageBox.Show("Enter a reason before saving.");
        args.Handled = true;
    }
}
```

:::note
Tool keys vary between forms. **New** on a line is often a form-specific key such as `EpiAddNewnewLine`, and some screens use short keys like `Refresh` or `Clear`. To find the key, temporarily add `MessageBox.Show(args.Tool.Key);` to the handler and click the tool. Comparing with `args.Tool.Key.ToUpper()` saves you from case differences.
:::

<!-- TODO verify: list of common tool keys (SaveTool, ClearTool, RefreshTool, DeleteTool) across 10.2 forms -->

## Adding an item to the Actions menu

To add your own menu entry, create a `ButtonTool`, register it with the toolbar manager, put it into the **Actions** popup menu, and handle the manager's `ToolClick` event.

```csharp
private Infragistics.Win.UltraWinToolbars.ButtonTool toolSendAck;

public void InitializeCustomCode()
{
    toolSendAck = new Infragistics.Win.UltraWinToolbars.ButtonTool("XX_SendAck");
    toolSendAck.SharedProps.Caption = "Email Acknowledgement";
    toolSendAck.SharedProps.Enabled = false;
    baseToolbarsManager.Tools.Add(toolSendAck);

    var actions = (Infragistics.Win.UltraWinToolbars.PopupMenuTool)baseToolbarsManager.Tools["ActionsMenu"];
    actions.Tools.Insert(actions.Tools.Count, toolSendAck);   // append at the end

    baseToolbarsManager.ToolClick += new Infragistics.Win.UltraWinToolbars.ToolClickEventHandler(this.Toolbar_ToolClick);
}

public void DestroyCustomCode()
{
    baseToolbarsManager.ToolClick -= new Infragistics.Win.UltraWinToolbars.ToolClickEventHandler(this.Toolbar_ToolClick);
}

private void Toolbar_ToolClick(object sender, Infragistics.Win.UltraWinToolbars.ToolClickEventArgs args)
{
    if (args.Tool.Key == "XX_SendAck")
    {
        SendAcknowledgement();   // your method
    }
}
```

Give custom tools a prefixed key (`XX_...`) so they can never clash with a base tool.

### Enabling the tool from the data

Leave the tool disabled and switch it on from the header view's `EpiViewNotification`, so it's only available when it makes sense:

```csharp
private void edvPOHeader_EpiViewNotification(EpiDataView view, EpiNotifyArgs args)
{
    if (args.NotifyType == EpiTransaction.NotifyType.Initialize)
    {
        bool ok = args.Row > -1
               && (string)view.dataView[args.Row]["ApprovalStatus"] == "A"
               && view.dataView[args.Row]["XX_SendToEmail_c"].ToString().Length > 0;
        toolSendAck.SharedProps.Enabled = ok;
    }
}
```

Check the same condition again inside the click handler; the data may have changed since the notification. What the tool can actually do, such as emailing a report, is covered in [Printing from a customization](/classic/customization/printing-from-customizations/).

## Hiding a base tool

A common request is to hide **Delete**, which sits right next to **Save**. Do it in the form's `Load` event and guard against forms where the tool doesn't exist:

```csharp
private void XX_Form_Load(object sender, EventArgs args)
{
    if (baseToolbarsManager.Tools.Exists("DeleteTool"))
    {
        baseToolbarsManager.Tools["DeleteTool"].SharedProps.Visible = false;
    }
}
```

Hiding a tool only removes the button. It doesn't stop the action through another path (right-click menus, other screens, DMT, REST). If deleting must be prevented, block it in a BPM on the business object's `Update` or `Delete...` method; see [Messages and exceptions](/platform/bpm/messages-and-exceptions/).

To hide the whole toolbar area, for example on a single-purpose shop-floor screen, set `baseToolbarsManager.Visible = false;` in `InitializeCustomCode()`.

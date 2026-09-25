---
title: Controls and styling
description: Reach base controls by EpiGuid, colour controls from their values, add tooltips, move a grid's summary row to the top, colour grid cells and prompt the user with a small pop-up dialog in a Classic customization.
env: classic
sidebar:
  order: 6
sources:
  - title: "EpiUsers: Summary row on top of grid"
    url: https://www.epiusers.help/t/summary-row-on-top-of-grid/74939
---

Most layout changes (moving, hiding, resizing, relabelling) need no code: select the control in the Customization Tools Dialog and change its properties. This page covers the things that do need a few lines of C#.

## Getting hold of a base control

Controls you add with the ToolBox are available in the script by name. Base controls aren't; look them up by their **EpiGuid**, which you copy from the **Misc** group of the control's properties.

```csharp
private EpiButton btnBaseExtra;

public void InitializeCustomCode()
{
    btnBaseExtra = (EpiButton)csm.GetNativeControlReference("00000000-0000-0000-0000-000000000000");
}
```

Replace the GUID with the one from the properties panel and cast to the control's actual type (shown as **(Type)** in the same panel).

## ReadOnly, Enabled and why your change doesn't stick

Epicor controls have both `ReadOnly` and `Enabled`, and the framework constantly resets bound controls from the data and from row rules. If you set `txtSomething.ReadOnly = false` on a bound control and it flips back, a row rule or the base form's own logic is winning. Change the rule instead ([Row rules](/classic/customization/row-rules/)) or change the data the rule looks at. Setting properties in code is reliable for **unbound** custom controls.

## Colouring a control from its value

Epicor controls follow the application's style theme, which overrides colours you set. Turn that off for the control first:

```csharp
private System.Drawing.Color defaultBack = System.Drawing.Color.Empty;

private void txtCertStatus_TextChanged(object sender, System.EventArgs args)
{
    EpiTextBox box = (EpiTextBox)sender;
    if (defaultBack == System.Drawing.Color.Empty) defaultBack = box.BackColor;

    box.UseAppStyling = false;
    switch (box.Text.Trim().ToLower())
    {
        case "valid":   box.BackColor = System.Drawing.Color.LightGreen; break;
        case "expired": box.BackColor = System.Drawing.Color.LightCoral; break;
        default:        box.BackColor = defaultBack; break;
    }
}
```

Wire the handler with the Event Wizard (`TextChanged`), or by hand as shown in [The Script Editor and events](/classic/customization/script-editor-and-events/#wiring-an-event-by-hand). For a button, set `UseOsThemes = Infragistics.Win.DefaultableBoolean.False` as well as `UseAppStyling = false`, or Windows theming keeps the default look.

:::tip
If the colour depends only on data in a data view, a row rule with a **SettingStyle** (OK, Warning, Error) does the same with no code, and survives theme changes. Use code when the logic is too complex for a rule.
:::

## Tooltips on custom controls

Tooltips come from Infragistics' `UltraToolTipManager`. Create one manager and register a tip per control:

```csharp
using Infragistics.Win.UltraWinToolTip;

private UltraToolTipManager tipManager;

private void SetUpTooltips()
{
    tipManager = new UltraToolTipManager();

    UltraToolTipInfo tip = tipManager.GetUltraToolTip(this.txtXX_Reason);
    tip.ToolTipText = "Why the order is on hold." + Environment.NewLine + "Shown on the pick list.";
}
```

Call `SetUpTooltips()` from `InitializeCustomCode()`. This is intended for your own controls; base controls already carry their own tooltip handling.

## Grid tweaks

### Summary row at the top

Grids with summaries turned on show totals at the bottom. Setting `grid.DisplayLayout.Override.SummaryDisplayArea = SummaryDisplayAreas.Top;` (namespace `Infragistics.Win.UltraWinGrid`) in the form's `Load` event moves them to the top. The full example, on a dashboard grid, is in [Grid summaries and grand totals](/classic/dashboards/grid-summaries-and-totals/#put-the-summary-row-at-the-top).

### Colouring individual cells

After the grid's data is loaded, loop its rows and set cell appearances:

```csharp
foreach (UltraGridRow row in grdStock.Rows)
{
    decimal needed = Convert.ToDecimal(row.Cells["QtyNeeded"].Value);
    decimal onHand = Convert.ToDecimal(row.Cells["OnHandQty"].Value);
    row.Cells["QtyNeeded"].Appearance.BackColor =
        needed <= onHand ? System.Drawing.Color.LightGreen : System.Drawing.Color.LightCoral;
}
```

Grid colours are reset when the grid reloads, so run this again after each refresh (or use the grid's `InitializeRow` event, which fires per row as it's drawn).

## Asking the user for a value

Sometimes a customization needs one extra input, such as a date, before it carries on. A small WinForms dialog defined in the script does the job:

```csharp
public class XX_DatePrompt : Form
{
    private DateTimePicker picker = new DateTimePicker();

    public XX_DatePrompt(string caption)
    {
        Text = caption;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        StartPosition = FormStartPosition.CenterParent;
        MinimizeBox = false; MaximizeBox = false;
        ClientSize = new System.Drawing.Size(260, 80);

        picker.SetBounds(10, 10, 240, 20);
        Button ok = new Button { Text = "OK", DialogResult = DialogResult.OK };
        ok.SetBounds(90, 45, 75, 25);
        Button cancel = new Button { Text = "Cancel", DialogResult = DialogResult.Cancel };
        cancel.SetBounds(175, 45, 75, 25);

        Controls.AddRange(new Control[] { picker, ok, cancel });
        AcceptButton = ok; CancelButton = cancel;
    }

    public DateTime Value { get { return picker.Value.Date; } }
}
```

Put the class after the closing brace of `Script` in the same editor window. Use it from any handler:

```csharp
using (XX_DatePrompt prompt = new XX_DatePrompt("Expected ship date"))
{
    if (prompt.ShowDialog(oTrans.EpiBaseForm) == DialogResult.OK)
    {
        edvTran.dataView[edvTran.Row]["TranDate"] = prompt.Value;
    }
}
```

Passing the form as the owner keeps the dialog on top of the right window. Keep dialogs like this small; anything bigger is usually better as its own UD form or dashboard launched from a button.

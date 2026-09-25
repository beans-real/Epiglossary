---
title: Migrating to Kinetic
description: Plan the move from Classic customizations to Kinetic, take an inventory of what each customization changed, decide what to drop, rebuild or move server-side, and map each Classic technique to its Application Studio equivalent.
env: classic
sidebar:
  order: 1
sources:
  - title: "EpiUsers: Classic to Kinetic upgrade helper"
    url: https://www.epiusers.help/t/classic-to-kinetic-upgrade-helper/83468
---

Classic customizations don't convert to Kinetic. The Kinetic screens are different applications, customized with **Application Studio** layers that have no client-side C#, so every Classic customization has to be reviewed and, if it's still needed, rebuilt. The good news is that a lot of Classic code turns out to be unnecessary, and much of what remains is better off on the server anyway. For the background on what differs between the clients, see [Kinetic vs Classic](/start/kinetic-vs-classic/).

This page is a practical plan for the move.

## 1. Take an inventory

Start with a list of every customization that's actually in use:

- **Customization Maintenance** lists every customization and personalization layer; **Menu Maintenance** shows which layer each menu item runs. A layer that no menu item uses is a candidate to drop straight away. See [Managing customizations](/classic/customization/managing-customizations/).
- For each layer in use, record the form, who uses it and what it's for. Ask the users; half the value of this step is finding out which changes nobody needs any more.

### See what a customization changed

Reading a customization's XML to work out what it moved or hid is slow. A faster way is to make the form show you. The script below, added temporarily to a customization, colours every control the layer touched:

- **Hidden** base controls are made visible, coloured green and tagged "hidden".
- **Changed** base controls (moved, resized, re-labelled, re-bound) are coloured beige.
- **Added** custom controls are coloured yellow.

```csharp
using System.Drawing;

// Call HighlightCustomizationChanges() at the end of InitializeCustomCode().
private void HighlightCustomizationChanges()
{
    // Base controls that this customization's settings mention
    foreach (System.Collections.DictionaryEntry entry in csm.PersonalizeCustomizeManager.ControlsHT)
    {
        Control ctrl = entry.Value as Control;
        IInfragisticsAppearance styled = entry.Value as IInfragisticsAppearance;
        string key = entry.Key as string;
        if (ctrl == null || styled == null || key == null) continue;
        if (!csm.CustomCodeAll.Contains(key)) continue;   // untouched by this layer

        if (!ctrl.Visible)
        {
            ctrl.Visible = true;
            Paint(ctrl, styled, Color.SpringGreen, Color.Black);
            AddTag(ctrl, "<- hidden");
        }
        else
        {
            Paint(ctrl, styled, Color.Bisque, Color.DodgerBlue);
        }
    }

    // Controls this customization added
    foreach (System.Collections.DictionaryEntry entry in csm.CustomControlDictionary)
    {
        IInfragisticsAppearance styled = entry.Value as IInfragisticsAppearance;
        if (styled != null) Paint(entry.Value as Control, styled, Color.LemonChiffon, Color.Coral);
    }
}

private void Paint(Control ctrl, IInfragisticsAppearance styled, Color back, Color fore)
{
    Infragistics.Win.UltraControlBase ultra = ctrl as Infragistics.Win.UltraControlBase;
    if (ultra != null)
    {
        ultra.UseAppStyling = false;   // otherwise the theme overrides our colours
        ultra.UseOsThemes = Infragistics.Win.DefaultableBoolean.False;
    }
    styled.Appearance.BackColor = back;
    styled.Appearance.BackColor2 = back;
    styled.Appearance.BackColorDisabled = back;
    styled.Appearance.BackColorDisabled2 = back;
    styled.Appearance.BorderColor = back;
    styled.Appearance.ForeColor = fore;
    styled.Appearance.ForeColorDisabled = fore;
}

private void AddTag(Control ctrl, string text)
{
    EpiTextBox tag = new EpiTextBox();
    tag.UseAppStyling = false;
    tag.Appearance.BackColor = Color.SpringGreen;
    tag.Text = text;
    tag.Width = 70;
    tag.Location = new Point(ctrl.Right, ctrl.Top);
    ctrl.Parent.Controls.Add(tag);
    tag.BringToFront();
}
```

Save it as a **copy** of the customization (or as work in progress), open each tab of the form and take screenshots. The matching is by control key within the customization's settings, so it catches almost every change but isn't guaranteed to catch all of them; skim the Script Editor too for controls changed in code.

## 2. Sort each change into a bucket

| Bucket | Examples | What to do |
|---|---|---|
| **Drop** | Fields nobody uses, workarounds for bugs fixed since, layout preferences | Nothing. Record the decision. |
| **Base Kinetic already does it** | Extra search columns, some grid features | Check the Kinetic screen before rebuilding. |
| **Layout only** | Hidden, moved or relabelled fields, extra UD fields, new tabs | Rebuild in the Application Studio Layout designer. |
| **Business rule in client code** | Validation on save, defaults, blocking an action, updating other records | Move to a BPM or Epicor Function **first**. |
| **UI behaviour** | Enable a button when approved, look up extra info when a row loads, pop-up prompts | Rebuild with Application Studio events, data rules and slide-outs. |

Moving rules server-side first has a big advantage: the BPM works for Classic users straight away, so you can test it while everyone is still on Classic and delete the client code when it's proven. It also covers imports, REST and any other client. Start with [BPM overview](/platform/bpm/overview/) and [Method directives vs data directives](/platform/bpm/method-vs-data-directives/).

## 3. Map Classic techniques to Kinetic

| In Classic you used | In Kinetic use | See |
|---|---|---|
| A customization layer | An Application Studio layer | [Layers](/kinetic/application-studio/layers/) |
| Moving, hiding, adding controls | The Layout designer | [Layout, controls and toolbars](/kinetic/application-studio/layout-and-controls/) |
| `EpiDataView`, `CallContextBpmData` | Data views (including `TransView` and `CallContextBpmData`) | [Data views](/kinetic/application-studio/data-views/) |
| Event handlers in the Script Editor | Events with triggers and widgets | [Events](/kinetic/application-studio/events/), [Common event patterns](/kinetic/application-studio/event-patterns/) |
| C# expressions and calculations | Expressions, `#_..._#` JavaScript | [Expressions and JavaScript](/kinetic/application-studio/expressions/) |
| Row rules | Data rules | [Data rules](/kinetic/application-studio/data-rules/) |
| Adapters and `DynamicQueryAdapter` | `erp-baq` and `rest-erp` widgets, Epicor Functions | [Calling BAQs, services and functions](/kinetic/application-studio/calling-services/) |
| Foreign key views | BAQ data views, or extra columns added by a BPM | [BAQ data views](/kinetic/application-studio/baq-data-views/), [Add columns to an existing grid](/kinetic/application-studio/add-columns-to-existing-grid/) |
| `BAQCombo` and coded combo lists | `erp-combo-box` | [Combo boxes](/kinetic/application-studio/combo-boxes/) |
| Custom grids over a `DataTable`, embedded updatable dashboards | Grids bound to BAQ data views, updatable BAQ grids | [Grids and panel card grids](/kinetic/application-studio/grids/), [Updatable BAQ grids](/kinetic/application-studio/updatable-baq-grids/) |
| Pop-up WinForms dialogs, extra sheets | Slide-out panels, pages and tabs | [Pages, tabs and slide-outs](/kinetic/application-studio/pages-tabs-and-slide-outs/) |
| Custom Actions menu tools | Toolbar and overflow-menu tools with events | [Layout, controls and toolbars](/kinetic/application-studio/layout-and-controls/) |
| Printing or emailing from a button | A function or BPM that prints or emails | [Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/) |
| `MessageBox.Show` debugging | Browser DevTools and the debugging shortcuts | [Debugging](/kinetic/application-studio/debugging/) |

## 4. Dashboards

Classic dashboards can be generated as Kinetic apps from the same **Deploy Dashboard** window (**Generate Kinetic Form**), and the result is added to the menu as a **Kinetic App**. That's a quick start for simple dashboards. Anything customized in the classic dashboard (BAQ combos, summary rows at the top, code) has to be rebuilt; often it's simpler to build the dashboard fresh in Application Studio. See [Classic dashboards overview](/classic/dashboards/overview/) and [Build a dashboard step by step](/kinetic/application-studio/dashboards/).

## 5. MES

MES customizations are usually the most code-heavy, because they chain several transactions behind one button. Move that logic into Epicor Functions and give Kinetic MES a thin layer with buttons that call them. [Report quantity from an Epicor Function](/kinetic/mes/quantity-from-a-function/) shows the pattern, and [Kinetic MES overview](/kinetic/mes/overview/) covers the rest.

## 6. Test and switch over

- Rebuild in a test environment and have the people who use each screen test it with real tasks, not just a click-through.
- Switch companies over with **Kinetic Application Maintenance** once their screens are ready; see [Client settings](/classic/administration/client-settings/#classic-or-kinetic-forms).
- Keep the Classic customizations until you've run a full period-end on Kinetic, then retire them in **Customization Maintenance**.

:::tip
Don't try to reproduce every Classic detail pixel for pixel. The migration is a rare chance to remove customizations nobody needs, and every one you drop is one less layer to maintain through future upgrades.
:::

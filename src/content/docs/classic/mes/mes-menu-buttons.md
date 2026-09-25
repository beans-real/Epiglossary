---
title: Custom buttons on the MES menu
description: Reuse one of the spare buttons on the classic MES menu to open a dashboard or custom form, and pass it a value with LaunchFormOptions.
env: classic
sidebar:
  order: 2
---

The classic MES menu has spare buttons (for example on the **Supervisor** tab) that do nothing by default. Customizing one is the standard way to give operators or supervisors a shortcut to a dashboard, a UD form or a customized Epicor screen without leaving MES.

## 1. Put the target on a menu

The button launches a **menu item** by its Menu ID, so whatever you want to open must exist in **Menu Maintenance** first. For a dashboard, deploy it and add a menu item with **Program Type** `Dashboard-Assembly` (see [Classic dashboards overview](/classic/dashboards/overview/)). Note the **Menu ID**, e.g. `XX_MESDASH`.

Users need menu security access to that item, or the button will open nothing.

## 2. Claim a spare button

1. Start MES with the `-MESC` shortcut and open the customization tools (right-click the MES menu, **Customization**).
2. Select the spare button. In its properties, clear any default **EpiBinding** and set **Text** to the caption you want.
3. Copy its **EpiGuid** from the **Misc** group.

## 3. Wire it up

The button is a base control, so you get it by EpiGuid, enable it on load and handle its click:

```csharp
// Add Custom Module Level Variables Here **
private EpiButton btnXXDash;

public void InitializeCustomCode()
{
    btnXXDash = (EpiButton)csm.GetNativeControlReference("00000000-0000-0000-0000-000000000000");
    btnXXDash.Click += new System.EventHandler(this.btnXXDash_Click);
}

public void DestroyCustomCode()
{
    btnXXDash.Click -= new System.EventHandler(this.btnXXDash_Click);
}

private void MESMenu_Load(object sender, EventArgs args)
{
    btnXXDash.ReadOnly = false;   // spare buttons start disabled
}

private void btnXXDash_Click(object sender, System.EventArgs args)
{
    ProcessCaller.LaunchForm(oTrans, "XX_MESDASH");
}
```

Add the `Load` handler with the Form Event Wizard so it's wired correctly, then **Test Code** and save.

## Passing a value to the form you open

`LaunchFormOptions` lets you pass something along, such as the job the operator is working on, and control how the new window behaves:

```csharp
private void OpenJobHelper(string jobNum)
{
    LaunchFormOptions opts = new LaunchFormOptions();
    opts.IsModal = true;          // MES waits until the helper closes
    opts.ContextValue = jobNum;   // any object; a string is simplest
    ProcessCaller.LaunchForm(oTrans, "XX_JOBHELP", opts);

    oTrans.RefreshLaborData();    // refresh MES's activity list afterwards
}
```

In the launched form's customization, read the value when it loads:

```csharp
private void XX_JobHelpForm_Load(object sender, EventArgs args)
{
    if (XX_JobHelpForm.LaunchFormOptions != null && XX_JobHelpForm.LaunchFormOptions.ContextValue != null)
    {
        string jobNum = XX_JobHelpForm.LaunchFormOptions.ContextValue.ToString();
        // fill a field, run a search, etc.
    }
}
```

Replace `XX_JobHelpForm` with the launched form's actual name, as shown at the top of its Script Editor.

<!-- TODO verify: that LaunchFormOptions is exposed as a property of the form object on all launched forms (vs oTrans.EpiBaseForm.LaunchFormOptions) -->

A modal launch keeps the helper on top so it can't get lost behind the MES window, which matters on shared shop-floor PCs.

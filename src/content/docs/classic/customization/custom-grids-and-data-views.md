---
title: Custom grids and data views
description: Put your own grid on a Classic form by backing an EpiDataView with an in-memory DataTable, fill it from a BAQ, and save rows to a UD table with the UD01 adapter.
env: classic
sidebar:
  order: 9
---

Sometimes a form needs a list that Epicor doesn't have: open follow-up items for the job on screen, a checklist, a set of values to confirm before posting. In a Classic customization you can build that list yourself. The pattern has four parts:

1. A `DataTable` you define in code.
2. An `EpiDataView` wrapped around it and registered with `oTrans`, so controls can bind to it.
3. A grid bound to that view.
4. Code that fills the table (usually from a BAQ) and writes changes back (usually to a UD table).

## 1 and 2: define the table and register the view

```csharp
private DataTable dtItems;
private EpiDataView edvItems;

private void CreateItemsView()
{
    dtItems = new DataTable("XX_Items");
    dtItems.Columns.Add("Selected", typeof(bool));
    dtItems.Columns.Add("ItemID", typeof(string));
    dtItems.Columns.Add("Description", typeof(string));
    dtItems.Columns.Add("Qty", typeof(decimal));
    dtItems.Columns.Add("Done", typeof(bool));
    dtItems.Columns.Add("OrigDone", typeof(bool));   // lets us spot what the user changed

    edvItems = new EpiDataView();
    edvItems.dataView = new DataView(dtItems);
    oTrans.Add("XX_Items", edvItems);
}

private void RemoveItemsView()
{
    oTrans.EpiDataViews.Remove("XX_Items");
    dtItems.Dispose();
    dtItems = null;
}
```

Call `CreateItemsView()` from `InitializeCustomCode()` and `RemoveItemsView()` from `DestroyCustomCode()`. Register the view **before** anything that binds to it, including row rules.

## 3: bind a grid

Add an `EpiUltraGrid` with the ToolBox and set its **EpiBinding** to `XX_Items`. The grid picks up the columns from the table. Hide helper columns such as `OrigDone` in the grid's properties, or with code after the first load.

To make a column read-only in every control bound to it, set it on the view:

```csharp
edvItems.SetCurrentRowPropertyManually("Description", SettingStyle.ReadOnly);
```

<!-- TODO verify: SetCurrentRowPropertyManually behaviour on views created with the parameterless EpiDataView constructor -->

## 4a: fill it from a BAQ

Use the BAQ pattern from [Adapters, BAQs and searches](/classic/customization/adapters-and-baqs/#running-a-baq), then copy the results into your table. Pause notifications while you load so the grid doesn't redraw for every row:

```csharp
private void LoadItems(string jobNum)
{
    oTrans.SuspendNotifications();
    dtItems.Rows.Clear();

    if (jobNum.Length > 0)
    {
        foreach (DataRow src in RunItemsQuery(jobNum).Rows)   // BAQ XX_JobItems, parameter JobNum
        {
            DataRow row = dtItems.NewRow();
            row["Selected"] = false;
            row["ItemID"] = src["UD01_Key3"];
            row["Description"] = src["UD01_Character01"];
            row["Qty"] = src["UD01_Number01"];
            row["Done"] = src["UD01_CheckBox01"];
            row["OrigDone"] = row["Done"];
            dtItems.Rows.Add(row);
        }
    }

    oTrans.ResumeNotifications();
    oTrans.NotifyAll();
}
```

## 4b: save to a UD table

UD tables (`UD01`–`UD40` and the child `UD100`-series) give you somewhere to keep custom records without a schema change. `UD01` has five keys; a common convention is `Key1` = record type, `Key2` = the parent record (job number), `Key3` = the item.

```csharp
private void SaveItem(string jobNum, string itemID, string desc, decimal qty, bool done)
{
    UD01Adapter ud = new UD01Adapter(oTrans);
    try
    {
        ud.BOConnect();
        bool exists;
        try { exists = ud.GetByID("XX_JobItem", jobNum, itemID, "", ""); }
        catch { exists = false; }   // a missing record may throw rather than return false

        if (!exists)
        {
            ud.ClearData();
            ud.GetaNewUD01();
            ud.UD01Data.UD01[0].Key1 = "XX_JobItem";
            ud.UD01Data.UD01[0].Key2 = jobNum;
            ud.UD01Data.UD01[0].Key3 = itemID;
        }

        ud.UD01Data.UD01[0].Character01 = desc;
        ud.UD01Data.UD01[0].Number01 = qty;
        ud.UD01Data.UD01[0].CheckBox01 = done;
        ud.Update();
    }
    finally
    {
        ud.Dispose();
    }
}
```

Deleting is one call: `ud.DeleteByID("XX_JobItem", jobNum, itemID, "", "");`.

### Saving what the user ticked in the grid

When a user ticks a checkbox in the grid, the view raises `EpiViewNotification`. Compare the current value with the copy you stored at load time and save only real changes:

```csharp
private void edvItems_EpiViewNotification(EpiDataView view, EpiNotifyArgs args)
{
    if (args.NotifyType == EpiTransaction.NotifyType.Initialize && args.Row > -1)
    {
        DataRowView r = view.dataView[args.Row];
        if ((bool)r["Done"] != (bool)r["OrigDone"])
        {
            SaveItem(txtJob.Text.Trim(), r["ItemID"].ToString(), r["Description"].ToString(),
                     (decimal)r["Qty"], (bool)r["Done"]);
            r["OrigDone"] = r["Done"];
        }
    }
}
```

For "delete selected rows", call `dtItems.AcceptChanges()` so pending edits are committed to the table, `Select("Selected = true")`, confirm with the user, delete each by ID, then reload.

## Styling the rows

Colour cells after a load, or add row rules to the custom view comparing its own columns; both are covered in [Controls and styling](/classic/customization/controls-and-styling/#colouring-individual-cells) and [Row rules](/classic/customization/row-rules/#coded-row-rules).

:::tip
If the list is really just "a BAQ result the user can edit", an updatable BAQ in an embedded dashboard gives you the grid, the save and the validation (in the BAQ's BPM) with far less code, and it carries over to Kinetic more easily.
:::

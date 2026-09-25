---
title: EpiDataViews and oTrans
description: Read and write the data behind a Classic form through EpiDataViews, react when a record loads, set defaults, save and refresh with oTrans, and pass values to and from BPMs with CallContextBpmData.
env: classic
sidebar:
  order: 3
---

Controls on a Classic form don't own their values. Each bound control shows a column of an **EpiDataView**, the client-side table behind the form. If you want to read or change what's on screen, change the data view, and every control bound to that column follows. The form's transaction object, `oTrans`, owns the data views and the save, refresh and clear operations.

## Getting a data view

Look views up by name from `oTrans.EpiDataViews`. The name is the part before the dot in a control's **EpiBinding** (`OrderHed.PONum` lives in the `OrderHed` view).

```csharp
private EpiDataView edvHead;

public void InitializeCustomCode()
{
    edvHead = (EpiDataView)oTrans.EpiDataViews["OrderHed"];
}
```

Grab the view once in `InitializeCustomCode()` and keep it in a module-level variable. The Form Event Wizard does the same when you add an `EpiViewNotification` handler.

## Reading and writing the current row

A view can hold many rows. `Row` is the index of the current one, and it's `-1` when nothing is loaded. Always check it.

```csharp
if (edvHead.Row > -1)
{
    // read
    string po = edvHead.dataView[edvHead.Row]["PONum"].ToString();

    // write: bound controls update straight away
    edvHead.dataView[edvHead.Row]["ShipComment"] = "Call before delivery";
}
```

`edvHead.CurrentDataRow` gives the same row as a `DataRow` (or `null`), which can read more cleanly:

```csharp
DataRow row = edvHead.CurrentDataRow;
if (row != null)
{
    int custNum = (int)row["CustNum"];
}
```

:::tip
Writing to a column through the data view marks the row as changed, just as typing would. The user still has to save, or you call `oTrans.Update()`.
:::

## Reacting when a record loads: EpiViewNotification

`EpiViewNotification` fires when a view is filled, cleared or its current row changes. It's the Classic equivalent of "a record is now on screen", and it's where you refresh anything that depends on the current row, such as enabling a button or looking up extra information.

```csharp
private void edvHead_EpiViewNotification(EpiDataView view, EpiNotifyArgs args)
{
    if (args.NotifyType == EpiTransaction.NotifyType.Initialize)
    {
        if (args.Row > -1)
        {
            bool approved = (string)view.dataView[args.Row]["ApprovalStatus"] == "A";
            btnSend.ReadOnly = !approved;
        }
        else
        {
            btnSend.ReadOnly = true;   // form cleared
        }
    }
}
```

`args.NotifyType` tells you what happened. `Initialize` covers loading and row changes; `AddRow` and `DeleteRow` fire for new and removed rows. Handle the `args.Row == -1` case as well, which is what you get after **Clear**.

:::caution
Don't do slow work (BAQ calls, adapter calls) for every notification of a busy multi-row view. Check that the key you care about actually changed, or trigger the lookup from a button or a `Validated` event instead.
:::

## Setting defaults when a form opens

For a report or process form, where there's no record to load, set defaults in the form's `Load` event. Report forms keep their options in a view called `ReportParam`:

```csharp
private void XX_ReportForm_Load(object sender, EventArgs args)
{
    EpiDataView edvParam = (EpiDataView)oTrans.EpiDataViews["ReportParam"];
    if (edvParam.Row > -1)
    {
        edvParam.dataView[edvParam.Row]["IncludeClosed"] = false;
        edvParam.dataView[edvParam.Row]["SortBy"] = "Part";
    }
}
```

Use the column names from the controls' **EpiBinding** properties; `IncludeClosed` and `SortBy` above are placeholders. For entry forms, defaults are usually better done server-side on the `GetNew...` method, so they apply to every client; see [Default and lock field values](/platform/bpm/default-field-values/).

## oTrans: save, refresh, clear

| Call | Does |
|---|---|
| `oTrans.Update()` | Saves pending changes, the same as the **Save** button. Returns `false` if the save failed. |
| `oTrans.Refresh()` | Reloads the current record from the server. |
| `oTrans.ClearDataSets()` | Clears the form's data, similar to **Clear**. <!-- TODO verify: ClearDataSets vs the form's own Clear behaviour on all forms --> |
| `oTrans.NotifyAll()` | Tells every bound control and rule to redraw from the current data. |
| `oTrans.SuspendNotifications()` / `ResumeNotifications()` | Pause redraws while you change many rows, then resume. Follow with `NotifyAll()`. |

Many forms add their own methods to `oTrans`. Report Quantity has `GetNewReportQty`, the MES menu has `RefreshLaborData`. **Tools > Object Explorer** lists what the current form offers.

## Passing values between the client and a BPM

Every form has a `CallContextBpmData` view whose row travels with each server call. BPMs see it as `callContextBpmData`, and changes a BPM makes come back to the client. That makes it the simplest channel between a customization and server logic.

**Client to server**: write before the call, read in the BPM.

```csharp
EpiDataView edvCtx = (EpiDataView)oTrans.EpiDataViews["CallContextBpmData"];
edvCtx.dataView[edvCtx.Row]["Checkbox01"] = chkCreateShipment.Checked;
oTrans.Update();   // a pre-processing BPM on Update can now read callContextBpmData.Checkbox01
```

**Server to client**: a post-processing BPM sets, for example, `callContextBpmData.Character01`, and the customization reads it after the call, typically in an `AfterAdapterMethod` handler:

```csharp
private void oTrans_adapter_AfterAdapterMethod(object sender, AfterAdapterMethodArgs args)
{
    if (args.MethodName == "Update")
    {
        EpiDataView edvCtx = (EpiDataView)oTrans.EpiDataViews["CallContextBpmData"];
        string note = edvCtx.dataView[edvCtx.Row]["Character01"].ToString();
        if (note.Length > 0) MessageBox.Show(note);
    }
}
```

The available fields are the generic ones (`Character01`–`Character10`, `Number01`–`Number20`, `Date01`–`Date05`, `Checkbox01`–`Checkbox20`, `ShortChar01`–`ShortChar10`). Agree which one means what and write it down, because every BPM on the call can see and change them. For packing several values into one field, a delimiter-separated string works, but keep the format simple. On the BPM side, see [Pass data from pre- to post-processing](/platform/bpm/passing-data-pre-to-post/).

## Related

- [Custom grids and data views](/classic/customization/custom-grids-and-data-views/): build your own data view from a `DataTable`.
- [Row rules](/classic/customization/row-rules/): style or lock controls from data instead of code.

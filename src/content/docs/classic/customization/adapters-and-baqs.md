---
title: Adapters, BAQs and searches
description: Call Epicor business objects from a Classic customization with adapters, run a BAQ with parameters, validate typed values with a search, and hook the business object calls the form already makes.
env: classic
sidebar:
  order: 4
sources:
  - title: "EpiUsers: Trace helper utility for Epicor ERP 10"
    url: https://www.epiusers.help/t/trace-helper-utility-for-epicor-erp-10/58018
  - title: "GitHub: EpicorTraceDiffer"
    url: https://github.com/jose-josh-do-dev/EpicorTraceDiffer
---

An **adapter** is the client-side wrapper around a business object. `PartAdapter` talks to `Erp.BO.Part`, `DynamicQueryAdapter` talks to `Ice.BO.DynamicQuery`, and so on. A customization uses adapters whenever it needs data the form hasn't loaded, or wants to create or change records other than the one on screen.

## The adapter pattern

Every adapter call follows the same shape: create it against the form, connect, call, read the dataset, dispose.

```csharp
private string GetPartDescription(string partNum)
{
    string desc = "";
    PartAdapter partAdapter = new PartAdapter(oTrans);
    try
    {
        partAdapter.BOConnect();
        bool found = partAdapter.GetByID(partNum);
        if (found && partAdapter.PartData.Part.Count > 0)
        {
            desc = partAdapter.PartData.Part[0].PartDescription;
        }
    }
    finally
    {
        partAdapter.Dispose();
    }
    return desc;
}
```

- Add the adapter's assembly references first (**Reference Adapter/BL Assemblies** wizard, see [The Script Editor and events](/classic/customization/script-editor-and-events/#assembly-references-and-extern-alias)).
- The dataset property is named after the business object: `PartData`, `VendorData`, `UD01Data`, `JobEntryData`.
- Depending on the adapter, a missing record makes `GetByID` return `false` or throw a "record not found" exception. Handle both, and check the row count before reading `[0]`.
- Always `Dispose()`. A `try/finally` (or `using`) block makes sure you do even when a call throws.

## Following the screen's method sequence

When you use an adapter to *create* something, call the same methods in the same order that the Epicor screen does. Business objects expect their `GetNew...` and `Change...`/`...Info` methods to run first; skip one and the save fails or saves incomplete data.

Creating a customer shipment for a sales order, for example, looks roughly like this:

```csharp
CustShipAdapter ship = new CustShipAdapter(oTrans);
ship.BOConnect();
string msg;

ship.GetNewShipHead();
ship.GetHeadOrderInfo(orderNum, out msg);   // fills customer, ship-to etc. from the order
ship.Update();
int packNum = ship.CustShipData.ShipHead[0].PackNum;

ship.GetNewOrdrShipDtl(packNum, orderNum);
ship.CustShipData.ShipHead[0].RowMod = "U"; // keep the header flagged as changed while adding lines
ship.GetOrderInfo(orderNum, out msg);
ship.GetOrderLineInfo(0, orderLine, partNum);
ship.GetOrderRelInfo(0, orderRel, true);
ship.GetQtyInfo(0, shipQty, 0m);
ship.Update();

ship.Dispose();
```

<!-- TODO verify: the meaning of the leading 0 argument on GetOrderLineInfo/GetOrderRelInfo/GetQtyInfo, and whether these signatures differ between 10.x releases -->

The way to learn a sequence like this is a **client trace**: turn on tracing, do the task by hand on the screen, and read which methods were called and with what values. [Find the method a screen calls](/platform/bpm/finding-the-right-method/) explains tracing. The community **Epicor Trace Differ** utility (see Sources) makes long traces easier to read by showing what changed in the dataset between calls.

:::tip
Long multi-step creations like this are much safer in a server-side Epicor Function or post-processing BPM: they run in one place, can be wrapped in a transaction and don't depend on the user's client. Use a customization for the button and the prompt, and let the server do the work.
:::

## Running a BAQ

`DynamicQueryAdapter` runs any shared BAQ by ID. Parameters go into a `QueryExecutionDataSet`.

```csharp
private DataTable RunPartStockQuery(string partNum)
{
    DynamicQueryAdapter dqa = new DynamicQueryAdapter(oTrans);
    try
    {
        dqa.BOConnect();

        QueryExecutionDataSet qeds = new QueryExecutionDataSet();
        var param = qeds.ExecutionParameter.NewRow() as QueryExecutionDataSet.ExecutionParameterRow;
        param.ParameterID = "PartNum";
        param.ParameterValue = partNum;
        param.ValueType = "nvarchar(50)";
        param.IsEmpty = false;
        qeds.ExecutionParameter.Rows.Add(param);

        dqa.ExecuteByID("XX_PartStock", qeds);
        return dqa.QueryResults.Tables["Results"].Copy();
    }
    finally
    {
        dqa.Dispose();
    }
}
```

- `ParameterID` must match the BAQ parameter name exactly, and `ValueType` should match its type (`nvarchar(50)`, `integer`, `date`...). For queries without parameters, pass the empty `QueryExecutionDataSet`.
- Results come back in the `Results` table, with columns named by alias: `Part_PartNum`, `Calculated_OnHand`. `Copy()` the table if you keep it after disposing the adapter.
- To filter a BAQ without parameters, add rows to `qeds.ExecutionFilter` instead. <!-- TODO verify: ExecutionFilter column layout -->

A typical use is showing extra figures on an entry form, such as on-hand and available quantity for the part on the current quote line. Run the BAQ from the line view's `EpiViewNotification` (when the row changes), write the values into unbound text boxes, and blank them when the row is `-1` or when the user clicks **Clear** or **New**.

## Validating what the user typed

For a free-typed value, validate it when the user leaves the control. `SearchFunctions.listLookup` runs an adapter's search silently, with a where clause, and returns the list dataset:

```csharp
private void txtPart_Validated(object sender, System.EventArgs args)
{
    string typed = txtPart.Text.Trim();
    if (typed.Length == 0) { txtPartDesc.Text = ""; return; }

    bool recSelected;
    string where = "PartNum = '" + typed.Replace("'", "''") + "'";
    DataSet ds = SearchFunctions.listLookup(oTrans, "PartAdapter", out recSelected, false, where);

    if (ds != null && ds.Tables[0].Rows.Count > 0)
    {
        DataRow part = ds.Tables[0].Rows[0];
        txtPart.Text = part["PartNum"].ToString();          // fixes upper/lower case
        txtPartDesc.Text = part["PartDescription"].ToString();
    }
    else
    {
        txtPartDesc.Text = "";
        MessageBox.Show("Part " + typed + " was not found.");
    }
}
```

Escape single quotes in anything you put into a where clause, as above.

### Search buttons: the Simple Search wizard

To give users a search dialog that fills your custom fields, use **Wizards > Customization Wizards > Simple Search**:

1. Add a button (and the text boxes or combo you want filled) to the form.
2. Launch the wizard, click **Get Adapters** and pick the search adapter, for example `CustCntAdapter` for contacts.
3. Choose **SearchDialog** (or **DropDown** to feed a custom `EpiCombo`).
4. Map each search field to a data view column, click **Add** for each, then **Finish**.
5. In the button's `Click` handler, call the method the wizard generated, named like `SearchOnCustCntAdapterShowDialog()`.

## Hooking the form's own adapter calls

The form's main adapter raises `BeforeAdapterMethod` and `AfterAdapterMethod` around every business object call it makes. Add a handler with the **Form Event Wizard** (pick the adapter, for example `oTrans_adapter`), then switch on the method name:

```csharp
private void oTrans_adapter_AfterAdapterMethod(object sender, AfterAdapterMethodArgs args)
{
    switch (args.MethodName)
    {
        case "ChangeVendor":
            // the supplier just changed: default a UD email field from its primary contact
            if (edvHead.Row > -1)
            {
                int vendorNum = (int)edvHead.dataView[edvHead.Row]["VendorNum"];
                edvHead.dataView[edvHead.Row]["XX_SendToEmail_c"] = GetPrimaryContactEmail(vendorNum);
            }
            break;
    }
}
```

- `AfterAdapterMethod` is for reacting: fill fields, refresh custom panels, show a message after a save.
- `BeforeAdapterMethod` can stop the call: set `args.Cancel = true` after warning the user.
- Don't know the method name? Uncomment the wizard's `EpiMessageBox.Show(args.MethodName)` line and use the screen for a minute.

:::note
Rules enforced here only apply in this form, in the Classic client. If the same rule must hold for imports, REST calls or Kinetic screens, put it in a BPM on the same method.
:::

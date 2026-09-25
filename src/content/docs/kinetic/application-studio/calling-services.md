---
title: Calling BAQs, services and functions
description: Use the erp-baq and rest-erp widgets to run BAQs, call business object methods and Epicor Functions from an event, and map their results into data views.
env: kinetic
sidebar:
  order: 11
---

Events reach the server through two widgets. `erp-baq` runs a BAQ, and `rest-erp` calls anything else: business object methods and Epicor Functions. Both can write their results into a data view, where grids and fields bound to that view pick them up.

## `erp-baq`: run or save a BAQ

On the canvas this widget may be labelled `kinetic-baq`. Its **BAQ Options**:

| Setting | Notes |
|---|---|
| **BAQ Id** | The BAQ to run. It must be shared |
| **View Name** | The data view that receives the results (or, in `update` mode, supplies the rows to save) |
| **Mode** | `get` to run the query, `update` to save changes through an updatable BAQ |
| **BAQ Execute Options** | For `get`: execution settings |
| **BAQ Parameters** | For `get`: values for BAQ parameters |
| **BAQ Update Options** | For `update`: **Operation** (`update`), **Send All Rows**, **Rollback Data On Error** |

A `get` into a view with a parent/child relationship only keeps the rows that match the parent. That's how the pattern in [BAQ data views](/kinetic/application-studio/baq-data-views/) works. The `update` mode is covered in [Updatable BAQ grids](/kinetic/application-studio/updatable-baq-grids/).

![erp-baq widget selected on an event canvas, with BAQ Options showing BAQ Id, View Name and Mode get, plus BAQ Execute Options](/images/4a39ac4967006c50ed5d2b5b7eec5918bd945a2a-2-690x336.png)

## `rest-erp`: call a business object or function

The `rest-erp` widget's settings are nested. Work through them top to bottom:

**Rest Services**

- **Service Name**: the business object service, e.g. `Ice.BO.ChgLogSvc` or `Erp.BO.SalesOrderSvc`. Leave it empty when calling an Epicor Function.
- **Service Operation**: the method, e.g. `GetByID`, or the function's name.

**Method Parameters**: one entry per simple (non-dataset) parameter:

- **Field Name**: the parameter name exactly as the method defines it
- **Field Data Type**: e.g. `string`, or `dataset` for a dataset parameter built inline
- **Field Value**: a literal, or a value from the screen

![rest-erp Method Parameters entry: Field Name orderNum, Field Data Type integer, Field Value taken from a screen column](/images/pasted-image-20250304095936.png)

**ERP Rest Arguments**

- **Request Parameters**: send a data view as a dataset parameter. Set **Parameter Path**/**Parameter Name** to the method's parameter and **View Name** to the view that supplies the rows. Under **Dataset**, set **Dataset Id** to match.
- **Response Parameters**: put part of the response into a view. Set **Parameter Name** to the table in the response, **View Name** to the target view, and **Parse from Response Path** to where the data sits in the response (`returnObj` for most methods that return a dataset). **Merge Behavior** controls how incoming rows combine with rows already in the view.

**Call Options**

- **ERP Functions Library**: the library ID when calling an Epicor Function
- **API Key**: not needed for calls made from inside Kinetic

After the widget runs, the next widgets in the chain can read its output as `actionResult`. For example, a function output parameter `OutURL` is available as `{actionResult.OutURL}`.

:::tip[Finding the right method and parameters]
Do the same thing in the base screen with the browser's **Network** tab open (see [Debugging](/kinetic/application-studio/debugging/#network-tab-see-every-server-call)). The request URL names the service and method, and the payload shows the exact parameter names and shapes the method expects.
:::

## Example: a change log slide-out

Many maintenance screens can show a record's change log. This example builds that by hand on a screen that doesn't have it, using `Ice.BO.ChgLogSvc`. Change logging must already be enabled for the table.

1. **Create a data view** named `XX_ChgLog` with **Server Schema** `ICE` and `ChgLog` as both the dataset and table. The response will fill it.
2. **Add a slide-out page**: in the Application Map, add a page with **Page Type** `SlidingPanel`, **Name** `XX_PageChgLog`, **Caption** `Change Log`. Edit it and add a panel card grid whose **Grid Model > Provider Model > Ep Binding** is `XX_ChgLog`. Add only the columns you need under **Grid Model > Columns**. Without them the grid tries to show every column and becomes unreadable.

   ![A SlidingPanel page holding a Change Log panel card grid whose Grid Model Ep Binding is the change log view](/images/2e26b716eb3f3eccfc7586629c0e97e96753f48e-2-690x348.png)

3. **Add a tool** to open it: select the page header, go to **Advanced > Tools**, add a tool with ID `XX_toolChgLog`, an icon such as `mdi mdi-history`, and tick **Add to Primary ToolBar**.

   ![Page tool settings for a Change Log tool: ID, Sequence, Icon mdi mdi-book-open, Text, Ep Binding and Add to Primary ToolBar ticked](/images/2163d5be9fd6eee60df44b50b097b5854be98876-2-205x500.png)

4. **Create the event**: trigger **Control > On Click > XX_toolChgLog**.

   ![Change log event: a Control On Click trigger on the tool, then rest-erp, then slider-open on the Success path](/images/9b551ba824a1c9073b76ccfaabc2faf39a04cef0-2-690x348.png)

5. **Add `rest-erp`**:
   - **Service Name** `Ice.BO.ChgLogSvc`, **Service Operation** `GetChgLog`
   - **Method Parameters**:
     - `ip_systemCode` = `ICE` for `Ice` tables, typically `ERP` for `Erp` tables
     - `ip_tableName` = the table, e.g. `UD01`
     - `ip_sysRowID` = the current record's `SysRowID`, e.g. `{UD01.SysRowID}`
   - **Response Parameters**: **Parameter Name** `ChgLog`, **View Name** `XX_ChgLog`, **Parse from Response Path** `returnObj`

   ![rest-erp Rest Services with Service Name Ice.BO.ChgLogSvc and Service Operation GetChgLog](/images/ea7bbbbe4471cba07dc9e564d01c2774a19bb6bc-2-690x348.png)

   ![rest-erp Response Parameters with Parameter Name ChgLog, the change log view as View Name and Parse from Response Path returnObj](/images/9e983ddc5fa13e2ef951ba5c6430787d13623831.png)

6. **Add `slider-open`** on the success path, with **Page** `XX_PageChgLog`.

   ![slider-open Parameters with Page set to the Name of the SlidingPanel page](/images/ba78d49f32c8818620e018a7d30786e8949da207-2-690x348.png)

7. Save, preview, open a record and click the tool.

   ![The finished Change Log slide-out open over a UD maintenance screen, listing change log rows (user IDs blurred)](/images/d753700228cf9247c3f0425081cf76f60d0e44e6-2-690x348.png)

## Example: run a BAQ with custom parameters

When `erp-baq` can't pass parameters the way you need, call `Ice.BO.DynamicQuerySvc` directly with `rest-erp`, using `ExecuteByID` to run a BAQ (or `UpdateByID` to save an updatable one on older releases). The full setup is in [Dashboard parameters and filters](/kinetic/application-studio/dashboard-parameters-and-filters/#baqs-with-parameters).

## Calling an Epicor Function

1. Leave **Service Name** empty and set **Service Operation** to the function name.
2. Under **Call Options**, set **ERP Functions Library** to the library ID.

   ![rest-erp Call Options with Suppress Exceptions, API Key and the function library in ERP Functions Library](/images/d3f18a72a9627798400408ee4263e57f44632568.png)

3. Add each input under **Method Parameters**. For a dataset input, map a view under **Request Parameters**.
4. Read outputs in later widgets as `{actionResult.OutputName}`, for example in a `row-update`.

The library must be published and available to the calling company. A library marked **For Internal Use Only** can't be called over REST, which is what `rest-erp` uses. If the call fails, the Network tab shows the server's error message. See [Libraries, publishing and security](/platform/functions/libraries-and-security/).

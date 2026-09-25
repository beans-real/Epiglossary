---
title: Dashboard parameters and filters
description: Filter Kinetic dashboard grids from input fields, run BAQs that have parameters with your own inputs instead of the default prompt, and let users enter several values at once.
env: kinetic
sidebar:
  order: 16
sources:
  - title: "EpiUsers: Kinetic dashboard with parameters"
    url: https://www.epiusers.help/t/kinetic-dashboard-with-parameters/97375/14?page=2
  - title: "EpiUsers: How To: Kinetic BAQ grid pub-sub"
    url: https://www.epiusers.help/t/how-to-kinetic-baq-grid-pub-sub/81650
---

Classic dashboards had tracker views: type a value, click refresh, and the grid filters. Kinetic has no tracker view, so you build the equivalent from fields, data views and where clauses. This page covers three levels: filtering with where clauses, BAQs with real parameters, and inputs that take several values.

## Filter fields and where clauses

The simplest filter is an input field plus a grid where clause that reads it.

1. Add a panel card for the filters, and inside it a text box, combo box or date picker per filter.
2. Bind each input to a data view column that holds filter values, for example `TransView.XX_CustID`. `KeyFields` works too and is the usual choice when the value identifies "the current record".
3. On the grid, set **Grid Model > Provider Model > Baq Options > Where** to use them:

   ```sql
   Customer_CustID = '??{TransView.XX_CustID}'
   ```

4. Save and preview. Enter a value and reload the grid.

Where-clause syntax, `AND`/`OR` combinations and the `??{}` / `?{}` question are covered in [BAQ data views](/kinetic/application-studio/baq-data-views/#b-filter-a-grid-with-a-provider-model-where-clause).

To reload as soon as a filter changes, add an event with trigger **DataTable > Column Changed** on the filter column that refreshes the grid.

## BAQs with parameters

If the BAQ itself has parameters, the out-of-the-box behavior is a **BAQ Parameters** slide-out that appears when the grid's card expands. Users fill it in and click **OK**. If that's all you need, tick **Expand at Runtime** on the grid so the prompt appears as soon as the dashboard opens.

![The default BAQ Parameters slide-out, with two date parameters, opened by expanding the dashboard grid card](/images/118e0f20e89d65ba797ba7bd13a7a6ea5aeda630-2-690x466.png)

When you want your own parameter inputs on the page (a drop-down, defaults, re-running on change), bypass the prompt and run the BAQ yourself through `Ice.BO.DynamicQuerySvc`.

### 1. A placeholder view and a grid bound to it

1. Create a data view, e.g. `XX_Results`, **without** a BAQ server schema. If it's a BAQ view, the framework shows the parameter slide-out again.

   ![Data View designer for a placeholder view with Server Schema ERP and no BAQ Id, and no columns defined](/images/9ca2c60eee0fcfb16826256cbe255f310b8ec3e1-2-690x336.png)

2. On the grid, remove the existing provider settings and set **Grid Model > Provider Model > Ep Binding** to `XX_Results`. Define the grid's columns as usual.

   ![Dashboard page with a Parameters card holding a Part Type combo box above the results grid, whose Provider Model Ep Binding points at the placeholder view](/images/60e7c234394d533f22e589be0f2f91e6663e87d3-2-690x336.png)

3. Create a second view for the inputs, e.g. `XX_Params`, and add a combo box or text box bound to `XX_Params.PartType`.

### 2. A reusable action that runs the BAQ

Create an event with **no trigger** (it appears under **User Defined Actions**), named e.g. `XX_RunQuery`, containing one `rest-erp` widget:

- **Service Name** `Ice.BO.DynamicQuerySvc`, **Service Operation** `ExecuteByID`
- **Method Parameters**:
  - `queryID` (string): your BAQ ID, e.g. `XX_PartsByType`
  - `executionParams` (dataset): the parameter values and execution settings, entered in the dataset editor:

```json
{
  "ExecutionSetting": [
    { "Name": "PageSize", "Value": 500 },
    { "Name": "PageNum", "Value": 1 }
  ],
  "ExecutionParameter": [
    {
      "ParameterID": "PartType",
      "ParameterValue": "{XX_Params.PartType}",
      "ValueType": "nvarchar",
      "IsEmpty": false
    }
  ]
}
```

- **ERP Rest Arguments > Response Parameters**: **Parameter Name** `Results`, **View Name** `XX_Results`, **Parse from Response Path** `returnObj`

Add one `ExecutionParameter` entry per BAQ parameter. `ParameterID` must match the parameter name in the BAQ.

![A user-defined event with No Trigger and one rest-erp widget calling Ice.BO.DynamicQuerySvc ExecuteByID](/images/6c05419636621a3ab8bfda59d28c5789eb550e93-2-690x336.png)

![The executionParams method parameter (type dataset) with its dataset editor open, showing ExecutionSetting entries and an ExecutionParameter whose value comes from a data view column](/images/cffc3e5375e554b5cfc279ad1c92d7a9857c190c-2-690x389.png)

![ERP Rest Arguments > Response Parameters with Parameter Name Results, the placeholder view as View Name and Parse from Response Path returnObj](/images/bf437f5dc608c0f78cee1e0321e993621eeaf970-2-690x336.png)

### 3. Run it on load and when the parameter changes

1. **On load**: an event hooked **After** the form's load event, with a `row-update` that sets a default in `XX_Params.PartType`, then `event-next` → `XX_RunQuery`.

   ![On-load event: a Form_OnLoad after trigger followed by a row-update that sets the parameter column](/images/70e8862755e6aebbfd8c1e5a4462a917b78882c1-2-690x336.png)

2. **On change**: an event with **Type** `DataTable`, **Hook** `Column Changed`, **Target** `XX_Params`, **Columns** `PartType`, containing just `event-next` → `XX_RunQuery`.

   ![On-change event with trigger Type DataTable, Hook Column Changed, the parameter view as Target and the parameter column in Columns, followed by event-next](/images/a7b754f3738d01d30f76e5edc380677f95b41e00-2-690x336.png)

:::caution[Paging]
This approach loads one page of results and doesn't support the grid's virtual paging. Set `PageSize` comfortably above the number of rows you expect.
:::

## Let users enter several values

Some filters take a list, such as several job numbers or part numbers. On report forms, list-type filters accept a tilde-separated list (`JOB-000123~JOB-000124`). Two ways to collect one:

### Option A: search chip selector

The chip selector (`ep-search-chip-selection`) shows each chosen value as a chip, with a search button to add more. It's what Epicor uses on Job Traveler.

1. Add the component and set **EpBinding**, e.g. `TransView.XX_Jobs`. Under **Advanced**, optionally set **Plural Label Text**, **Singular Label Text** and **Empty Label Text** (for example "Jobs selected", "Job selected", "No job selected").

   ![ep-search-chip-selection properties with EpBinding TransView.Jobs and the Plural, Singular and Empty Label Text set under Advanced](/images/8d36e1ee67260a38d8b3fb0afce8b1c78af61790-2-205x500.png)

2. Create an event: **Type** `EpBinding`, **Hook** `On Search`, **Target** `TransView.XX_Jobs`.
3. Add `search-show` with **Like** `JobHead.JobNum`, **Select Mode** `MultiSelect`, **Search Form** `default`, **Sort By Column** `JobNum`, and a **Validation** so typed values are checked:

   ```json
   { "validateFilter": "JobNum = '%value%'", "errorMessage": "That job number doesn't exist" }
   ```

   ![search-show Search Options with Select Mode MultiSelect, Like JobHead.JobNum, Search Form default, a Validation value and Sort By Column JobNum](/images/a4e547cd1c7b00e4cd5a014ff58fa64d38982178-2-211x500.png)

4. Add `search-value-set` with **Ep Binding** `TransView.XX_Jobs` and **Value** `actionResult.JobNum`.

   ![search-value-set with Ep Binding TransView.Jobs and Value actionResult.JobNum](/images/c54772cbce268e07aab8383f1d8737706901cb92.png)

### Option B: a paste box

Users who copy a column out of Excel want to paste it. Add a multi-line text box for pasting and turn its contents into a tilde list:

1. Add a text box bound to `TransView.XX_PasteBox`.

   ![A Filter card with a text box labelled "Paste (Ctrl+V) Here" above a search chip selector](/images/a25ade4f6b205b96546a69557739cd2fbd41638c-2-299x375.png)

2. Create an event: **Type** `DataTable`, **Hook** `Column Changed`, **Target** `TransView`, **Columns** `XX_PasteBox`.
3. Add a `row-update` that writes the cleaned list into the filter, e.g. **Ep Binding** `ReportParam.Filter1` with **Expression**:

   ```js
   "{TransView.XX_PasteBox}".split("\\n").map(v => v.trim()).filter(v => v !== "").join("~")
   ```

   This splits on line breaks, trims stray carriage returns and spaces, drops blank lines and joins the rest with `~`. Note the doubled backslash (see [Expressions](/kinetic/application-studio/expressions/#escaping-backslashes)).

Pasting with **Ctrl+V** works. The right-click "paste insert" from Classic isn't available.

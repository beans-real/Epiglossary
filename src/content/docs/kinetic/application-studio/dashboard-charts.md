---
title: Charts in dashboards
description: Two ways to put a chart on a Kinetic dashboard, a chart image generated from an Epicor Function shown in a Website widget, or the Data Discovery chart widget, and the trade-offs of each.
env: kinetic
sidebar:
  order: 18
sources:
  - title: "EpiUsers: How To: Dashboard charts"
    url: https://www.epiusers.help/t/how-to-dashboard-charts/104599
  - title: "Image-Charts documentation"
    url: https://editor.image-charts.com/?tab_editor=url&tab_viewer=documentation#https:/image-charts.com/chart
---

Application Studio has no general-purpose chart component for dashboard grids. Two workarounds are in use. One builds a chart image URL on the server and shows it in a **Website** widget. The other uses Epicor Data Discovery's chart widget, where your release still has it.

## Option 1: a chart image from an Epicor Function

An Epicor Function takes the grid's rows, totals them, and returns the URL of a chart image from a chart-rendering web service. A **Website** widget on the dashboard displays that URL.

:::danger[Your data leaves your system]
The chart service receives your aggregated values and labels in the URL. Don't use this for anything confidential, and check your company's policy on sending data to third-party services first.
:::

### 1. Data views

Create two views with no server schema:

- `XX_Chart`, with a column `URL`, which the Website widget will display
- `XX_ChartOptions`, for the user's choices, such as `ChartType`

![Data View designer for a chart view with Server Schema ERP, no BAQ and no columns](/images/d40e08927f81b6c6043101c0c026707d80cb1a01-2-690x336.png)

### 2. Layout

1. Add a panel card with a column in it, then drag the **Website** widget from **Toolbox > Widgets** into the column. Set its URL to `{XX_Chart.URL}`.

   ![A Chart panel card holding a Website widget whose URL property is bound to the chart view URL column, with a Populate Chart button in the card header](/images/2786a7c7fa1e258c0060fe1232da36cbfcf92167-2-690x336.png)

2. Add a combo box bound to `XX_ChartOptions.ChartType` with a static display/value list (see [Combo boxes](/kinetic/application-studio/combo-boxes/#option-2-display-and-value-pairs)), e.g. display `Pie` / value `p`, display `Vertical bar` / value `bvs`. The values are the chart service's chart-type codes.

   ![The combo box List editor with Vertical Bar, Pie, Line without Axes and Horizontal Bar entries, Vertical Bar storing the value bvs](/images/7913d01a3acb6a8291f20fba47a14810b521a948.png)

3. Add a button to draw the chart.

### 3. The function

Create a function in a library, e.g. `XX_Charts.CountBy`, with inputs `InDS` (DataSet), `InTable` (string), `LabelCol` (string), `ChartType` (string) and output `OutURL` (string):

```csharp
// Count the rows per distinct value of LabelCol and build a chart image URL.
var counts = new Dictionary<string, int>();

foreach (DataRow r in InDS.Tables[InTable].Rows)
{
    var key = Convert.ToString(r[LabelCol]);
    counts[key] = counts.TryGetValue(key, out var n) ? n + 1 : 1;
}

OutURL = "https://image-charts.com/chart"
    + "?cht=" + Uri.EscapeDataString(ChartType)
    + "&chs=700x400"
    + "&chd=a:" + string.Join(",", counts.Values)
    + "&chl=" + string.Join("|", counts.Keys.Select(Uri.EscapeDataString));
```

`cht` is the chart type, `chs` the size, `chd` the data series and `chl` the labels. The chart service's documentation (linked below) lists many more options: axes, legends, colors. Some chart types label their axes with different parameters than a pie chart does.

<!-- TODO verify: that chl renders labels for bar chart types as well as pie, or whether bar charts need chxl/chxt -->

### 4. The event

Create an event on the button's **On Click** with:

![Button click event: a Control On Click trigger followed by rest-erp and row-update](/images/c73d1d8662ec00c6fa1d9d6dc74fe97c4df0208f-2-690x336.png)

1. `rest-erp`:
   - **Service Name** empty, **Service Operation** `CountBy`
   - **Call Options > ERP Functions Library** `XX_Charts`
   - **Method Parameters**: `InTable` = `Rows`, `LabelCol` = the BAQ column to group by (e.g. `Customer_State`), `ChartType` = `{XX_ChartOptions.ChartType}`
   - **ERP Rest Arguments > Request Parameters**: **Parameter Path** `InDS`, **Parameter Name** `Rows` (same as `InTable`), **View Name** the view your grid is bound to, and under **Dataset** the same view as **Dataset Id**

   ![rest-erp Call Options with the function library name in ERP Functions Library](/images/d3f18a72a9627798400408ee4263e57f44632568.png)

2. `row-update` setting `XX_Chart.URL` to `"{actionResult.OutURL}"`.

   ![row-update Columns entry with Ep Binding set to the chart view URL column](/images/6430450b7a6254a79905b03b387bd842e39a0c1c-2-690x336.png)

Click the button in preview and the chart appears in the Website widget.

![Dashboard in preview with a Customers By State grid, a Chart Type combo, a Populate Chart button and the rendered pie chart in the Website widget](/images/555cf48de9dadac14dea97c215839a4f82e91e48.gif)

To redraw automatically instead of on a button, trigger the event from **DataView > Row Changed** or **DataTable > Column Changed** on the relevant view, though some triggers on views filled by grids have proved unreliable for this.

## Option 2: Data Discovery chart widget

If you have Epicor Data Discovery (EDD), its chart widget can be placed on a dashboard directly.

:::note
The Data Discovery widgets have reportedly been removed from Application Studio in 2024.2, with Epicor Grow taking over analytics. Check your Toolbox before planning on this option.
:::

1. Build an exploration view in Data Discovery.

   ![A Data Discovery exploration showing Customers by State as a pie chart, with a Sales Rep filter panel](/images/cedd492d238b20236952bfce5036210eca0db650-2-690x336.png)

2. On the dashboard, add a panel card, a column, and the **Data Discovery Chart** widget.

   ![Toolbox Widgets tab listing Data Discovery Card, Data Discovery Chart and Website widget, with the chart dropped into a panel card column](/images/afb5ed796b87df7335b5be8158514791e4e48531-2-690x336.png)

3. Open the widget's **Pub Sub Setup** and add a filter:
   - **Subscriber**: the column in the exploration's data to filter on
   - **Publisher**: the screen field that supplies the value

   ![Data Discovery Chart widget properties with the Guided Setup and Pub Sub Setup buttons](/images/b9988e570f2e23206800c1e4d2536d95c3493d14.png)

   ![Subscriber Setup panel with one row: Subscriber Sales Rep, Condition equals, Publisher CallContextBpmData.Character01](/images/f5979100fdd728974c98a4bb5796674b833e2f33-2-690x336.png)

4. To filter from an input field, bind the field to a scratch view, then add an event on **DataTable > Column Changed** for that column with a `row-update` that copies the value into the publisher field.

   ![Event with trigger Type DataTable, Hook Column Changed on the filter field column, followed by a row-update](/images/467f660862c764c020ef48181590d5ca4c1c8f83-2-690x336.png)

A publisher bound to a grid's view publishes the selected row's value, so there's no way to get back to "all". Publishing from a separate field (for example a `CallContextBpmData` column you set with `row-update`) avoids that.

![Dashboard in preview with a Sales Rep Code filter, a customer grid and the Data Discovery pie chart of customers by state](/images/5e630584429f29964f14cbee38eae9a78f2a295d.gif)

<!-- TODO verify: current availability of the Data Discovery chart widget in Application Studio by release -->

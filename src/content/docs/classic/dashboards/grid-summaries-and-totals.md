---
title: Grid summaries and grand totals
description: Show sums and counts in a classic dashboard grid, move the summary row to the top, and get a grand total that still works when users group the grid.
env: classic
sidebar:
  order: 3
sources:
  - title: "EpiUsers: Dashboard grid view grand total with groups"
    url: https://www.epiusers.help/t/dashboard-grid-view-grand-total-with-groups/49905
  - title: "EpiUsers: Summary row on top of grid"
    url: https://www.epiusers.help/t/summary-row-on-top-of-grid/74939
---

Dashboard grids can total their columns without any code. This page covers turning that on, the two common complaints (totals are at the bottom, and totals change meaning when the grid is grouped) and how to deal with each.

## Turn on summaries

1. In the dashboard designer, right-click the grid view and choose **Properties**.
2. Tick **Show Summaries** (and **Show Group By** if users should be able to group).
3. Save and refresh. Each numeric column header now has a **Σ** button.
4. Click **Σ** on a column and choose the summaries you want (**Sum**, **Count**, **Average**, **Minimum**, **Maximum**).

Users can also change summaries at run time and keep them as a personalization.

## Put the summary row at the top

On a long grid the totals sit below the last row, far off screen. The grid has a property for where summaries appear, but the dashboard designer doesn't expose it, so set it in a customization of the deployed dashboard, in the form's `Load` event:

```csharp
using Infragistics.Win.UltraWinGrid;

private void MainController_Load(object sender, EventArgs args)
{
    EpiUltraGrid grid = (EpiUltraGrid)csm.GetNativeControlReference("00000000-0000-0000-0000-000000000000");
    grid.DisplayLayout.Override.SummaryDisplayArea = SummaryDisplayAreas.Top;
}
```

Replace the GUID with the grid's **EpiGuid** from its properties panel. Customizing a deployed dashboard works like any other Classic form; see [Classic customization overview](/classic/customization/overview/).

## A grand total that survives grouping

When users group a grid, the summaries follow the groups: each group shows its own subtotal, and there's no single overall figure left at the bottom. If people need the grand total whatever the grouping, calculate it in the BAQ instead.

Add a calculated field that uses a **window function**. Without `GROUP BY`, the query still returns every detail row, and each row carries the total across all of them:

```sql
SUM(OrderDtl.DocExtPriceDtl) OVER (PARTITION BY OrderDtl.Company)
```

Partitioning by `Company` (which is the same on every row) gives one total for the whole result. Partition by something else, such as a customer, for a total per customer on every row.

Then:

1. Hide the calculated column in the grid, since repeating the same number on every row is noise.
2. Add a **tracker view** (or a second small grid) that shows the column once. It stays correct however the main grid is grouped or sorted.

:::note
The window total is calculated over the rows the **query** returns, after its own criteria. Filters applied later in the dashboard grid don't change it. If users filter the grid heavily, label the figure clearly ("Total of all open orders") so nobody mistakes it for the total of what's on screen.
:::

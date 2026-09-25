---
title: Tracker filters with a BAQ combo
description: Add a drop-down filter to a classic dashboard tracker view whose options come from a BAQ, so the list stays current without anyone maintaining it.
env: classic
sidebar:
  order: 2
sources:
  - title: "Spiceworks Community: Using BAQ combo box in dashboard tracker"
    url: https://community.spiceworks.com/t/using-baq-combo-box-in-dashboard-tracker/839055
---

A plain tracker prompt is a text box: users have to know and type the exact value. A **BAQCombo** replaces it with a drop-down whose options come from a BAQ, for example a list of supervisors, warehouses or part classes. Because the list is a query, it updates itself as the data changes.

## Before you start

- A dashboard with the query you want to filter.
- A second, shared BAQ that returns the options: one row per option, with a value column (the key you filter on) and a display column (what users read). Make it return **distinct** rows; the combo shows every row it gets, duplicates included.

## Steps

1. **Add a tracker view** for the query you want to filter (right-click the query, **New Tracker View**). Leave the column you'll filter with the combo **out** of the tracker (not visible). If the tracker shows it, it becomes a native control that you can't turn into a combo. Save the dashboard.
2. **Customize the tracker view**: right-click it in the tree and choose **Customize Tracker View**. The Customization Tools Dialog opens.
3. From **Tools > ToolBox**, pick **BAQCombo** and draw it on the tracker panel. Add an **EpiLabel** next to it.

   ![Customization ToolBox with the BAQCombo control highlighted](/images/dashboard-baqcombo-toolbox.png)

4. With the combo selected, set these properties:

   | Property | Set to |
   |---|---|
   | **DynamicQueryID** | The options BAQ, e.g. `XX_SupervisorList` |
   | **DisplayMember** | The column users see, e.g. `EmpBasic_Name` |
   | **ValueMember** | The column holding the key, e.g. `EmpBasic_EmpID` |
   | **IsTrackerQueryControl** (Misc) | `True`, so the combo acts as a filter for the tracker |
   | **QueryColumn** (Misc) | The column of the *dashboard's* query to filter, e.g. `EmpBasic_SupervisorID` |
   | **DashboardCondition** (Dashboard) | Usually `Equals` |
   | **DashboardPrompt** (Dashboard) | `True`. If it's left `False` the combo is greyed out. |
   | **DashboardHonorNull** (Dashboard) | `True` <!-- TODO verify: exact effect of DashboardHonorNull when the combo is left empty --> |

5. Save the customization, close the dialog, and **Save** the dashboard.
6. Test on the **Dashboard** tab: pick a value and click **Refresh**. Then redeploy the dashboard (**Tools > Deploy Dashboard**).

<!-- TODO screenshot: BAQCombo properties panel with DynamicQueryID, DisplayMember, ValueMember, IsTrackerQueryControl, QueryColumn and the Dashboard group filled in (existing capture shows a personal BAQ prefix) -->

## Notes

- You can add as many BAQ combos as you like. They combine with **and**, so each extra filter narrows the results; it's easy to end up with none.
- The same **IsTrackerQueryControl** / **QueryColumn** / **DashboardCondition** properties work on ordinary controls too. Two text boxes on the same column with `GreaterThanOrEqualTo` and `LessThanOrEqualTo` give you a range search.
- Since the tracker is a customization, you can also add labels, group boxes and tidy the layout while you're there.
- In Kinetic, the equivalent is an `erp-combo-box` driven by a BAQ; see [Combo boxes](/kinetic/application-studio/combo-boxes/) and [Dashboard parameters and filters](/kinetic/application-studio/dashboard-parameters-and-filters/).

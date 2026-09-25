---
title: Build a dashboard step by step
description: Build a simple one-BAQ Kinetic dashboard from scratch in Application Studio, put it on a menu, and move it to production with Solution Workbench.
env: kinetic
sidebar:
  order: 15
sources:
  - title: "EpiUsers: Application Studio and dashboards (wizard grid column bug)"
    url: https://www.epiusers.help/t/im-this-close-to-rage-quitting-application-studio-and-dashboards/120123/80
  - title: "EpiUsers: Auto refresh on load for Kinetic dashboards"
    url: https://www.epiusers.help/t/auto-refresh-on-load-for-kinetic-dashboards/99516
---

Kinetic dashboards are Application Studio applications of type **Dashboard**. There's no separate dashboard designer as in Classic. This walkthrough builds the simplest useful dashboard: one BAQ in one grid, with no parameters, tabs or editing. It then puts it on a menu and packages it for production. Once this works, add [filters and parameters](/kinetic/application-studio/dashboard-parameters-and-filters/), [editable grids](/kinetic/application-studio/updatable-baq-grids/) or [charts](/kinetic/application-studio/dashboard-charts/).

:::tip
Build it by hand rather than with the classic-dashboard conversion. Converted dashboards come out with generated names and parts that are awkward to edit, and a hand-built one is easier to maintain.
:::

## Before you start

- A shared BAQ that returns exactly the columns you want, with sensible aliases and labels. Note each column's alias (e.g. `OrderHed_OrderNum`) and label.
- Customize privileges on your account.
- A test or pilot environment. Build there and move the result to production at the end.

## 1. Create the dashboard application

1. Open the Application Studio home page (**System Management > Kinetic Application Management > Application Studio**). Filtering the grid to **Type = Dashboard** makes existing dashboards easier to find.
2. Click **+** (top right), choose type **Dashboard** and enter an ID such as `XX_OpenOrders`. Kinetic adds the dashboard prefix for you.
3. In the **Application Map**, select the main page and set its **Name** and **Caption**. The caption is the title users see.

<!-- TODO screenshot: the new-application dialog with Type Dashboard selected and an XX_ ID entered -->

## 2. Add and bind the grid

1. Select the main page and click **Edit**.
2. From **Toolbox > Components**, drag a **Grid** (panel card grid) onto the page.
3. Open **Properties**, click inside the grid ("No records available") and go to **Data > Grid Model > Provider Model**.
4. Set **Baq ID** and tick **Auto Load Grid**.
5. Go back up to `metafx-panel-card-grid`, open **Advanced** and tick **Auto Fill Container** so the grid uses the whole page. Tick **Expand at Runtime** as well. A collapsed card doesn't load, so without it users have to expand the card before any data appears.

   ![metafx-panel-card-grid properties with the Advanced group open and Auto Fill Container ticked](/images/pasted-image-20250228100315.png)

6. Under **Grid Model**, tick **Resizable**, **Sortable**, **Filterable** and **Advanced Filter**.
7. Click **Preview**. Data should appear, though probably with every column in no particular order.

## 3. Define the columns

1. Go to **Data > Grid Model > Columns** (not **Provider Model > Columns**).
2. For each column you want, in display order, click **+** and set:
   - **Field**: the BAQ alias, exactly, e.g. `OrderHed_OrderNum`
   - **Title**: the header text, usually the BAQ label
3. Preview every few columns. One misspelled field can stop the whole grid loading, and it's much easier to find if you've only added two since the last good preview.

![Grid Model > Columns with one column defined: Field holds the BAQ field name and Title holds the column heading](/images/77e97e8b496750d4570dd35d387092fb2c8ffd8b-2-285x500.png)

## 4. Save, publish, and add a layer

1. **Save**, then **Publish** from the overflow menu. This publishes the dashboard's base.
2. Close the designer. Close and reopen the Application Studio home page. New applications don't appear in the grid until it's reopened.
3. Click the dashboard's **Base** link and choose **Use Layer**.
4. Click the layer name at the top right, enter a layer name and description, and **Save Layer**.
5. Preview, **Save** and **Publish** the layer.
6. Reopen the home page. You should now see both a **Base** row and a layer row for the dashboard.

A menu item that points at the dashboard with no published layer tends to error, so create the layer even if it's empty. It's also where later changes belong.

## 5. Put it on a menu

1. If the dashboard needs its own security, create a security ID in **Menu Security Maintenance** first.
2. In **Menu Maintenance**, add a menu item as usual: menu ID, name, parent menu, order sequence, security.
3. Set **Program Type** to **Kinetic App** and pick the dashboard application.
4. In **Kinetic Customizations**, click the search button and choose the layer you created. The field looks disabled but isn't.
5. Save, then log out and back in to see the new menu item.

## Move it to production

Use the **Kinetic** version of **Solution Workbench**. The Classic one doesn't handle Kinetic apps.

1. Create a solution with an ID and description and save it.
2. Add the dashboard as element type **KineticApp**. The **Dashboard** element type is for Classic dashboards.
3. Add the **Menu** element for your menu item, and the **Security** element if you created one.
4. Review the element list before building. Related items are sometimes ticked automatically, so remove anything you didn't mean to include.
5. Build the solution, copy the file to production and install it there with Solution Workbench.
6. Log out and back in on production to see the menu item.

:::note[Solution Workbench quirks]
If a row won't select in the element search, select a different row and then the one you wanted. If a search for security elements returns nothing, save, close and reopen the solution, then search again.
:::

## If something goes wrong

- **The grid throws a SQL error about invalid columns** after using the Basic Application Wizard on a BAQ with subqueries: the wizard added subquery columns to the grid. Remove every column that isn't in the BAQ's top level. See [Grids](/kinetic/application-studio/grids/#the-wizard-created-grid-that-errors).
- **The dashboard opens empty until the user expands the card**: tick **Expand at Runtime** on the grid in your layer.
- **The BAQ parameter prompt doesn't appear on open**: same cause. For a BAQ with parameters, the prompt slides out when the card expands. See [Dashboard parameters](/kinetic/application-studio/dashboard-parameters-and-filters/#baqs-with-parameters).
- **Data doesn't load in preview after changing the grid or a view**: save, close and reopen the layer, then preview again.

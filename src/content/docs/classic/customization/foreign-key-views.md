---
title: Foreign key views
description: Show fields from tables a Classic form doesn't load by adding foreign key views and sub-table views with Data Tools, and know what to do when you need to edit them.
env: classic
sidebar:
  order: 8
---

Each Classic form loads a fixed set of tables. **Job Tracker**, for example, knows about `JobHead`, `JobProd` and friends, but not the sales order release a job is making. The customization wizards only let you bind controls to columns of data views the form already has, so a field from `OrderRel` simply isn't in the list.

A **foreign key view (FKV)** fixes that for display. It tells the form: "whenever this column in an existing view has a value, fetch the matching record from another business object and expose it as a new view". A **sub-table view (STV)** hangs a child table off an FKV. Once they exist you bind controls to them like any other view.

## When to use one

- You want to **show** a field from a related table: the customer's credit hold flag on an order line, the order release's need-by date on a job.
- The link from the form's data to the other table is a real key: a column that the other business object can `GetByID` with.

FKVs are read-only in practice. If users need to **edit** the related table, use an adapter call from a button, an embedded updatable BAQ grid, or a BPM (see [Row rules](/classic/customization/row-rules/#when-a-base-rule-locks-a-field-you-need) for the same trade-offs).

## Add a foreign key view

1. Open the form in Developer Mode and open **Tools > Customization**.
2. In the Customization Tools Dialog choose **Tools > Data Tools**. The **Custom Data Dialog** opens on the **Foreign Key View** tab, listing the form's existing views (`NV:` entries).
3. Click **New Custom View**.
4. Enter a **View Name**, then pick the **Parent View Name** (the existing view that holds the key) and the **Column Name** that links to the other table.
5. Leave **View Type** as **Foreign Key View**. Epicor fills in the **Like Column Value**, the **Adapter Name** and the **Get By Type** from the column's "Like" definition.
6. Click **Add**, then **OK**, and save the customization.

![Custom Data Dialog showing a foreign key view named OrderHed with parent view JobProd, column JobProd.OrderNum, like column OrderHed.OrderNum and adapter SalesOrderAdapter](/images/2023-06-21-13h04-06.png)

The link only works when the column has a **Like** property pointing at the other table's key. If the column you want isn't offered, use the **Custom Column Like** tab to add a Like property to it first.

## Add a sub-table view

An FKV fetches one record through the adapter, but the dataset that adapter returns often has child tables too. To use one of those, add a sub-table view under the FKV.

Suppose you want the order **release** on Job Tracker. `JobProd` holds the order number, line and release, but there's no direct foreign key from it to `OrderRel`. `OrderHed` is reachable, though, and the Sales Order dataset contains `OrderRel`:

![Diagram of JobProd linked to OrderHed, with OrderRel as a child of OrderHed](/images/2023-06-21-11h49-55.png)

1. In the Custom Data Dialog, select your new FKV (here, the `OrderHed` view) and click **New Custom View** again.
2. Set **View Type** to **Sub Table View**.
3. Choose the **Sub Table Name** (`OrderRel`).
4. Build the link: pick a **Parent View Column** and the matching **Child View Column**, then click the **Add** button under those lists. Repeat for every key column (order number, line and release number).
5. Click the **Add** button at the bottom of the dialog, then **OK**, and save.

![Custom Data Dialog showing a sub table view STV_OrderRel under the OrderHed foreign key view, linked on OrderNum, OrderLine and OrderRelNum](/images/2023-06-21-13h04-16.png)

:::caution
There are two **Add** buttons. The one under the column lists adds a link pair; the one at the bottom saves the view. Clicking the bottom one first creates a sub-table view with no links, which shows the wrong rows or none.
:::

## Show the fields

Add text boxes (or a grid) with the ToolBox and set their **EpiBinding** to the new view: `OrderHed.OrderDate`, `STV_OrderRel.NeedByDate`. The Sheet Wizard is a convenient way to give them their own tab.

## Doing it in code

The same thing can be done from the Script Editor with `csm.AddForeignKeyView(...)`, which registers a view backed by an adapter's dataset, and `csm.NotifyForeignKeyView(...)` after you refill it. That's mainly useful when you load the related data yourself with an adapter call. For a fully custom table behind a grid, see [Custom grids and data views](/classic/customization/custom-grids-and-data-views/).

<!-- TODO screenshot: Tools > Data Tools menu item in the Customization Tools Dialog (existing capture shows a personal layer name) -->

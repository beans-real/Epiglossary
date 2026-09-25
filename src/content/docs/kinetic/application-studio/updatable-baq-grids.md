---
title: Updatable BAQ grids
description: Build an editable grid on a Kinetic screen or dashboard that saves through an updatable BAQ, with a save tool, an update event and a refresh, including the pre-2022.2 variant.
env: kinetic
sidebar:
  order: 17
sources:
  - title: "EpiUsers: How To: Kinetic updateable UBAQ in a grid"
    url: https://www.epiusers.help/t/how-to-kinetic-updateable-ubaq-in-a-grid/95177
  - title: "Material Design Icons (icon names for tools)"
    url: https://pictogrammers.github.io/@mdi/font/3.9.97/
---

An updatable BAQ (uBAQ) lets users edit rows in a grid and save them back through the BAQ's update logic. In Kinetic, the grid won't wire the save up for you. You tell it which view holds the rows, which columns are editable, and what to do when the user clicks **Save**.

## Before you start

Build and test the updatable BAQ in the BAQ designer first, with its update processing and the columns you want editable. If the BAQ doesn't save correctly on its own, nothing below will fix it.

## Steps

### 1. Create a data view for the rows

In **Data Views**, add a view, e.g. `XX_EditRows`, with **Server Schema** `BAQ` and **BAQ Id** your uBAQ. This view holds the rows the grid shows and the save sends back.

![Data View designer for a view named BAQView with Server Schema BAQ, a BAQ Id selected and the BAQ columns listed](/images/0c0b1dc3430292691bdecbad042af60d4250fb94-2-690x336.png)

### 2. Add the grid and make it editable

1. Drag a **Panel Card Grid** (or a plain grid) onto the page.
2. In **Data > Grid Model**, turn on the grid's editable option.

   ![Panel card grid selected in the designer with Grid Model > Editable ticked in the Properties panel](/images/d15fbb0a9c605b8c1960cb8ad5df4aba86700224-2-690x336.png)

3. In **Data > Grid Model > Columns**, add the columns. **Field** is the BAQ alias and **Title** is the header. Don't touch **Provider Model > Columns**.

   ![Grid Model > Columns with a column whose Field is the BAQ field name and whose Title is the column heading](/images/77e97e8b496750d4570dd35d387092fb2c8ffd8b-2-285x500.png)

4. On each column users should change, turn on its editable option.

   ![Grid Model > Columns for one column with the Editable checkbox ticked](/images/e0637c10a882a27596a9bdf11bd6b5ccd877cb0b.png)

5. In **Grid Model > Provider Model**, set **Ep Binding** to `XX_EditRows` and **Baq ID** to your uBAQ.

   ![Grid Model > Provider Model with Ep Binding set to the view and Baq ID set to the BAQ](/images/fba48c888164999b4c5c97c4c4379252885ee2fe-2-198x500.png)

### 3. Add a Save tool to the grid

1. Go back to the grid's top-level properties and open **Advanced > Action Data**.
2. Add a tool:
   - **ID**: e.g. `XX_toolSaveRows`. The event refers to it.
   - **Text**: the hover text, e.g. `Save changes`
   - **Icon**: optional, a Material Design Icons class such as `mdi mdi-content-save`
   - Tick **Add to Primary ToolBar** if it should show on the card's toolbar

![Grid Action Data with a tool whose ID, Description and Icon (mdi mdi-ghost) are filled in and Add to Primary ToolBar ticked](/images/2a53b125c38d36ced4cec8f1c3654c5e57819a70.png)

### 4. Create the save event

1. Create an event with trigger **Type** `Control`, **Hook** `On Click`, **Target** `XX_toolSaveRows`.

   ![Save event canvas: a Control onClick trigger followed by two erp-baq widgets, with the trigger Type Control, Hook On Click and Target set to the save tool](/images/dad7e956c01d4e92d1df1dc6e38eedfd151d0a20-2-690x336.png)

2. Add an `erp-baq` widget: **BAQ Id** your uBAQ, **View Name** `XX_EditRows`, **Mode** `update`. Under **BAQ Update Options**, set **Operation** to `update`. The same panel has **Send All Rows** and **Rollback Data On Error**. Test with your uBAQ to see which behavior you need.
   <!-- TODO verify: exact effect of Send All Rows and Rollback Data On Error -->

   ![erp-baq BAQ Update Options with Operation update, Send All Rows ticked and Rollback Data On Error unticked](/images/88946872915ac4ed1b3c09af79c4a4ffb43e073f.png)

3. On the success path, add a second `erp-baq` with the same BAQ and view in `get` mode. This reloads the grid, so users see what the server actually saved, including rows that now drop out of the query.

![The finished save event: On Click trigger, erp-baq in update mode, then a second erp-baq in get mode on the same BAQ and view to refresh the grid](/images/4a39ac4967006c50ed5d2b5b7eec5918bd945a2a-2-690x336.png)

### 5. Save, close, reopen, then test

Save the layer and **close and reopen it** before previewing. Grids and views set up in the same session often don't load data in preview until the layer has been reopened. Then edit a row, click your save tool and check the change in the database.

## Gotchas

- **Parent/child views**: if the uBAQ view has a parent/child relationship, every relationship column must be among the grid's columns, or the save can't match rows.
- **Nothing happens on save**: check the Network tab for the update call and its response. uBAQ validation errors come back there. See [Debugging](/kinetic/application-studio/debugging/).
- **Grid doesn't show the change**: you're missing the refresh `erp-baq` (`get`) after the update.

## Releases before 2022.2

Older releases don't have the `update` mode on `erp-baq`. Use `rest-erp` to call the BAQ service directly in the save event instead:

- **Service Name** `Ice.BO.DynamicQuerySvc`, **Service Operation** `UpdateByID`
- **Method Parameters**: `queryID` (string) = your uBAQ ID, and `queryResultDataset` (object) = the name of the data view holding the edited rows, e.g. `XX_EditRows`
- **ERP Rest Arguments > Request Parameters**: **Parameter Path** `queryResultDataset`, **Parameter Name** `Results`, **View Name** `XX_EditRows`, and under **Dataset** set both **Dataset Id** and **Server Dataset Id** to `XX_EditRows`

![rest-erp widget in the save event with Service Name Ice.BO.DynamicQuerySvc and Service Operation UpdateByID](/images/8ad1ceedd8dcd0f936ce6eed3ab994f236f6920e-2-690x336.png)

![rest-erp Method Parameters with Field Name queryID, type string and the BAQ ID as the value](/images/89a0262e07643157a8b879925def4568f0fa43f5.png)

![rest-erp ERP Rest Arguments > Request Parameters with Parameter Path queryResultDataset, Parameter Name Results and the view name](/images/401d26a2ed6786cfd95f9b8f58047a791401555c.png)

![Request Parameters > Dataset with System Code ERP and the view name in both Dataset Id and Server Dataset Id](/images/380fb2451679e484b6e718e8c3f85fd1d31a98c3.png)

Those parameter path and name values are fixed. The call fails with anything else. Follow it with an `erp-baq` in `get` mode to refresh, as above.

<!-- TODO verify: the exact release where erp-baq gained update mode (2022.2 per the source thread) -->

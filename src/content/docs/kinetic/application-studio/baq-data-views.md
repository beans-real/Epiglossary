---
title: BAQ data views and parent/child filtering
description: Show BAQ results that follow the current record, either with a parent/child data view refreshed by an event or with a where clause on a grid's provider model.
env: kinetic
sidebar:
  order: 6
sources:
  - title: "EpiUsers: How To: Kinetic BAQ grid pub-sub"
    url: https://www.epiusers.help/t/how-to-kinetic-baq-grid-pub-sub/81650
  - title: "EpiUsers: Kinetic web dashboards, parent & child BAQ connection"
    url: https://www.epiusers.help/t/kinetic-web-dashboards-parent-child-baq-connection/108045
---

A common request is "show some extra information about the record I'm looking at": the sales order behind a job, the customer's comments on an order, the open POs for a part. The data isn't in the screen's own dataset, so you bring it in with a BAQ and filter the BAQ to the current record. Epicor people call this pub-sub. The screen's data view *publishes* its current record, and your BAQ view *subscribes* to it.

There are two ways to do it:

| Approach | Best for | How the filter works |
|---|---|---|
| **A. Parent/child data view + refresh event** | Showing BAQ values in ordinary fields (text boxes, dates) on an existing screen | The data view relationship matches child rows to the parent's current row, and an event reloads the BAQ at the right moment |
| **B. Grid provider model where clause** | Showing the BAQ as a grid, especially on dashboards | The grid adds a `WHERE` condition built from the current record every time it loads |

## A. Parent/child data view refreshed by an event

This example adds sales-order release details to a job screen. The job's `JobProd` rows say which order line the job is making. The BAQ joins that to the order release.

### 1. Build the BAQ

Create and share a BAQ, say `XX_JobOrderInfo`, that returns the columns you want to show **plus the columns you'll match on**, for example `JobProd_JobNum` and `OrderRel_OrderNum`. If a join column isn't in the display fields, you can't use it in the relationship.

### 2. Create the data view

1. Open **Data Views** and click **Add New**. Name it `XX_OrderInfo`.
2. Set **Server Schema** to **BAQ** and **BAQ Id** to `XX_JobOrderInfo`.
3. Under **Parent Child Relationships**, set **Parent Data View** to `JobProd`.
4. Add a row per matching column, parent on the left and BAQ alias on the right:

| Parent Column | Child Column |
|---|---|
| `JobNum` | `JobProd_JobNum` |
| `OrderNum` | `OrderRel_OrderNum` |

![Data view with Server Schema BAQ and a BAQ Id, Parent Data View JobProd, and relationship rows JobNum to JobProd_JobNum and OrderNum to OrderRel_OrderNum](/images/pasted-image-20250915113617.png)

### 3. Refresh the view when the parent changes

The relationship filters the rows, but something still has to *load* the BAQ. Add an event that runs the BAQ whenever the context changes:

1. Open **Events**, click **Add New** and name it, for example `XX_RefreshOrderInfo`.
2. Set the trigger to hook the system event that fires when the record or page changes. In this example the trigger is **Type** `Event`, **Hook** `After`, **Target** the page-change event (`RowChanging_sysPages`).
3. Add an `erp-baq` widget. On the canvas it may be labelled `kinetic-baq`. Set **BAQ Id** to `XX_JobOrderInfo`, **View Name** to `XX_OrderInfo` and **Mode** to `get`.

![Refresh event: an after trigger on RowChanging_sysPages connected to a kinetic-baq widget with BAQ Id, View Name and Mode get](/images/pasted-image-20250915113804.png)

:::caution[Most problems are here]
If the fields show the wrong record, stale values or nothing, check this event first. Hooked to the wrong system event, it runs before the parent row is current (you get the *previous* record's data), or it doesn't run at all. Use **Ctrl+Alt+8** in the browser console to watch which system events fire as you move between records and pages, then hook the one that runs after the parent row you depend on is set. See [Debugging](/kinetic/application-studio/debugging/).

If the event runs at the right time and the data is still wrong, check the BAQ's joins and the relationship column pairs.
:::

### 4. Bind controls to the view

Add text boxes, date pickers and so on, and set each **EpBinding** to a column of the new view, for example `XX_OrderInfo.OrderRel_NeedByDate`. Save, preview and move between records to check it follows along.

![A Need By date picker on Job Entry with its EpBinding set to OrderRel_NeedByDate on the BAQ data view](/images/pasted-image-20250915113833.png)

### Alternative: let a hidden grid load the view

Instead of an `erp-baq` event, you can drop a panel card grid on the page, point its **Grid Model > Provider Model** at the view (**Ep Binding** `XX_OrderInfo`, **BAQ ID** `XX_JobOrderInfo`) and tick **State > Hidden**. The grid loads the BAQ into the view and your fields bind to it. It's quicker to set up, but you have less control over when the load happens.

## B. Filter a grid with a provider model where clause

When the BAQ is shown in a grid, the grid can filter itself:

1. Select the panel card grid and go to **Grid Model > Provider Model**.
2. Set **BAQ ID**.
3. Open **BAQ Options** and enter a **Where** condition that uses the current record:

```sql
OrderHed_CustNum = '??{OrderHed.CustNum}'
```

The left side is the BAQ column alias (`Table_Field`). The right side is a placeholder for a value on the screen, written `??{DataView.Column}`, in quotes. The grid substitutes the current value each time it loads.

You can combine conditions with `AND`, `OR` and parentheses:

```sql
Part_PartNum = '??{Part.PartNum}' AND (PartTran_TranType <> 'ADJ-CST' AND PartTran_TranType <> 'PUR-SUB')
```

Any view works as the source, including `KeyFields` (`'??{KeyFields.PartNum}'`) and scratch fields on `TransView` (`'??{TransView.XX_JobFilter}'`).

![BAQ Options Where property containing JobHead_JobNum = '??{TransView.SysProposedValue}'](/images/pasted-image-20250922110954.png)

:::note[`??{}` or `?{}`?]
The two placeholder forms treat an empty value differently:

| Placeholder | Behavior |
|---|---|
| `'??{View.Column}'` | Nullable. Accepts the value even when the field is empty or null. |
| `'?{View.Column}'` | Only takes a value if one exists in the field. |

Use `??{}` when an empty field is a legitimate value to filter on. Use `?{}` when the field must be filled in before the value is used, for example a parent key that isn't set until a record is selected.
:::

A grid filtered this way only reloads when it's asked to. If the grid should follow a *different* grid's selected row, add an event on **DataView > Row Changed** for the parent grid's view that refreshes the child grid. See [Common event patterns](/kinetic/application-studio/event-patterns/#react-when-the-user-selects-a-grid-row).

## Gotchas

- **Use BAQ aliases**: `Table_Field`, not `Table.Field`, on the BAQ side of relationships and where clauses.
- **Relationship columns must be in the grid.** If a grid shows a BAQ view that has a parent/child relationship, add every relationship column to the grid's columns, or the rows won't match.
- **Save and reopen the layer** before judging a new BAQ view in preview. Data views added in the current session sometimes don't load until the layer has been saved, closed and reopened.

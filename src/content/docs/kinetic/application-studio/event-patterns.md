---
title: Common event patterns
description: Tested recipes for Application Studio events, covering typed values, grid row selection, refreshing after a function, finding a row, setting focus, running on load and reusable actions.
env: kinetic
sidebar:
  order: 8
sources:
  - title: "EpiUsers: App Studio event trigger for search field when value is manually entered"
    url: https://www.epiusers.help/t/app-studio-event-trigger-for-search-field-when-value-is-manually-entered/115988
  - title: "EpiUsers: Application Studio refresh data after event"
    url: https://www.epiusers.help/t/application-studio-refresh-data-after-event/103544
  - title: "EpiUsers: App Studio events, row-find working example"
    url: https://www.epiusers.help/t/app-studio-events-row-find-working-example/113571
  - title: "EpiUsers: Application Studio event rules"
    url: https://www.epiusers.help/t/application-studio-event-rules/109715
---

These are the event setups that come up again and again. Each one lists the trigger, the widgets and why it's built that way. The mechanics of triggers and widgets are explained in [Events](/kinetic/application-studio/events/).

## React to a value the user types

**Scenario:** a field with a search button, where users can also type a value straight in. You want to look something up once a value is entered.

**Don't** use the control's on-blur. It fires whenever focus leaves the field, including when the screen first loads with focus there and the user clicks away before typing. Your event then runs with no value and errors.

**Do** trigger on the data:

| Setting | Value |
|---|---|
| Type | `DataTable` |
| Hook | `Column Changed` |
| Target | The data view the field is bound to, e.g. `TransView` |
| Columns | The bound column, e.g. `XX_CustID` |

The event now runs only when the value actually changes, whether it was typed, picked from the search or set by another event. If an empty value is possible, start the chain with a `condition` such as `"{TransView.XX_CustID}" !== ""`.

## React when the user selects a grid row

**Scenario:** clicking a row in one grid should update something else: fill fields, refresh a second grid, set a filter.

| Setting | Value |
|---|---|
| Type | `DataView` |
| Hook | `Row Changed` |
| Target | The data view the grid is bound to |

When the event runs, the newly selected row is already current, so `{XX_OrderGrid.OrderHed_OrderNum}` in a `row-update` or `erp-baq` gives you the clicked row's value.

## Refresh the screen after a function updates data

**Scenario:** an event calls an Epicor Function (or a BAQ update) that changes the record on the server. The work succeeds, but the screen still shows the old values until the user clicks **Refresh**.

End your chain with `event-next` and point it at the application's own refresh event. You get the same result as clicking **Refresh**, without reloading the browser page or losing the selected record.

The refresh event's name varies by application. To find it, turn on tracing (**Ctrl+Alt+8**, see [Debugging](/kinetic/application-studio/debugging/)), click the toolbar **Refresh** button in the base screen, and note the first event the log shows.

## Find a row and make it current

**Scenario:** you've remembered a line number (say, in `TransView.XX_LineNum`) and need to make that line the current `OrderDtl` row again, for example after a refresh.

Use two widgets:

1. `row-find` with:
   - **Dataview**: `OrderDtl`
   - **Expression**: `OrderDtl.OrderLine = TransView.XX_LineNum`
   - **EpBinding**: where to store the result, e.g. `TransView.XX_LineRowIndex`
   - **Mode**: `RowIndex`
2. `row-current-set` with:
   - **Dataview**: `OrderDtl`
   - **Row**: `{TransView.XX_LineRowIndex}`

Things that trip people up:

- The `row-find` expression uses a **single `=`** for comparison, and the working setup references columns as plain `View.Column` with no braces. The JavaScript-style `==` and `===` produce an "Errors in criteria parser" error or quietly return the wrong row.
- `RowIndex` returns the row's zero-based **position** in the view, not a field value like the line number. `-1` means no match. That position is exactly what `row-current-set` expects.
- The other modes are `Exists` (true/false) and `Count` (number of matches).
- `dataview-condition` uses the same expression style.

![row-find Parameters: Dataview OrderDtl, Expression OrderDtl.OrderLine = TransView.OrderLineNum, EpBinding TransView.OrderLineRowNum and Mode RowIndex](/images/a8d35c9f6e8f2a7e729d8736375bb5f8fe7a7131.png)

![row-current-set Parameters: Row {TransView.OrderLineRowNum} and Dataview OrderDtl](/images/fa1f510c7e191393bca1556ea4e37f6d4e1a5b3d.png)

![dataview-condition Parameters using the same expression style: Dataview, Result, and Expression SelectedForProcessing = true with a single equals sign](/images/pasted-image-20260323122010.png)

## Put the cursor in a field

Use the `control-focus-set` widget (listed under data view actions in the Toolbox) and point it at the control. The hard part is timing. Hook it to an event that runs *after* the screen has finished whatever it was doing, such as an **After** hook on the system event that loads the record, or focus gets taken away again.

## Run something when the form loads

Hook an **After** event onto the application's initialization event (the target is `init` in many applications), or use the **Window** load trigger. Use this to set default values in `TransView`, pre-load a BAQ, or turn on debugging (see [Debugging before the form loads](/kinetic/application-studio/debugging/#debugging-before-the-form-loads)).

## Load data when the page or record changes

Hook an **After** event onto the system event that fires when the context changes (for example the page-change event `RowChanging_sysPages`), then run your `erp-baq` or `rest-erp` call. This is the refresh half of the parent/child pattern in [BAQ data views](/kinetic/application-studio/baq-data-views/).

## Reusable actions

When several triggers need the same steps (a button, a field change and form load all refresh the same BAQ), build the steps once in an event with **no trigger**. It appears under **User Defined Actions**. Then call it from each triggering event with `event-next`. You fix bugs in one place, and the traces read more clearly.

## Branch on a value

- Two outcomes: `condition` with an expression such as `"{Part.TypeCode}" === "M"`, then wire the **True** and **False** exits.
- Several outcomes: `switch` with **Value** `{Part.TypeCode}` and one case per value, each with its own action.

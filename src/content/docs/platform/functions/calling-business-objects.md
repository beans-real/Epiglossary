---
title: Call business objects from a function
description: Read, change, add and delete records from a function through Epicor's business objects, page through GetRows results safely, and replay the method sequence a screen uses.
env: both
sidebar:
  order: 4
---

Most functions that change data should do it through business objects (BOs), the same services the
screens use. Going through a BO runs Epicor's validation, defaulting and related updates; writing to
tables directly with `Db` skips all of that. This page shows the patterns you'll reuse.

## Getting a service

Add the service under the library's **References > Services** first. Then either of these works:

```csharp
// Option 1: CallService disposes the service for you
this.CallService<Erp.Contracts.QuoteSvcContract>(quoteSvc =>
{
    var ds = quoteSvc.GetByID(quoteNum);
    // ...
});

// Option 2: ServiceRenderer, in a using block
using (var quoteSvc = Ice.Assemblies.ServiceRenderer.GetService<Erp.Contracts.QuoteSvcContract>(Db))
{
    var ds = quoteSvc.GetByID(quoteNum);
    // ...
}
```

Use one style consistently. `CallService` reads well for short blocks; `ServiceRenderer` is handy when
you need the service across several steps.

## Read, change, save

The basic update is the same as in a BPM: fetch the tableset, change the row, mark it with `RowMod`,
and call `Update`.

```csharp
this.CallService<Erp.Contracts.QuoteSvcContract>(quoteSvc =>
{
    var ds = quoteSvc.GetByID(quoteNum);
    var hed = ds.QuoteHed.FirstOrDefault();
    if (hed == null)
        throw new Ice.BLException($"Quote {quoteNum} was not found.");

    hed.ReasonType = reasonType;   // request parameters
    hed.ReasonCode = reasonCode;
    hed.RowMod = "U";

    quoteSvc.Update(ref ds);
});
```

`RowMod` values are `"A"` (added), `"U"` (updated) and `"D"` (deleted). An unmarked row isn't saved.
[The BPM tableset: ds, tt and RowMod](/platform/bpm/dataset-and-rowmod/) explains them in more depth.

## Working through many rows with GetRows

`GetRows` takes one where-clause string per table in the service's tableset, then a page size, a page
number and an `out` flag that says whether more pages exist.

```csharp
bool morePages;
var ds = taskSvc.GetRows(
    whereClauseTask, "",   // one where clause per table in the tableset
    0,                     // pageSize: 0 returns every matching row
    0,                     // absolutePage
    out morePages);
```

:::caution[Page size comes before page number]
It's easy to swap the two integers. A page size of `0` means "no limit", so a swapped call can appear
to work until the data grows. Check the order against the method signature in the editor.
:::

### Example: complete every open task on a quote

This function marks a quote's CRM tasks complete with a reason and conclusion. It assumes the task's quote link is in `TaskQuoteNum`; check the column in your version before running it.

- Request: `quoteNum` (`System.Int32`), `reasonCode` (`System.String`), `conclusion` (`System.String`)
- References: the Task service

```csharp
this.CallService<Erp.Contracts.TaskSvcContract>(taskSvc =>
{
    string where = $"Company = '{Session.CompanyID}' AND TaskQuoteNum = {quoteNum} AND Complete = false";
    bool morePages;

    // Fetch every matching task in one go, then update them.
    var ds = taskSvc.GetRows(where, "", 0, 0, out morePages);

    foreach (var task in ds.Task)
    {
        task.Complete = true;
        task.CompleteDate = DateTime.Today;
        task.ReasonCode = reasonCode;
        task.Conclusion = conclusion;
        task.RowMod = "U";
    }

    if (ds.Task.Count > 0)
        taskSvc.Update(ref ds);
});
```

If you do page through a large set, don't filter on the field you're changing (`Complete = false`
above) and then request page 2: every update shrinks the result set and rows get skipped. Either
fetch everything at once, or keep requesting page `0` until nothing comes back.

The reverse function (reopening the quote) is the same code with the values cleared. When you find
yourself writing a pair like that, one function with a `complete` Boolean input is easier to maintain.

## Adding and deleting rows

Create rows with the BO's `GetNew…` method rather than building them yourself, so Epicor fills in
defaults and keys:

```csharp
this.CallService<Erp.Contracts.SalesOrderSvcContract>(soSvc =>
{
    var ds = soSvc.GetByID(orderNum);

    soSvc.GetNewOrderDtl(ref ds, orderNum);
    var line = ds.OrderDtl.First(r => r.RowMod == "A");

    // Set the part and quantity the same way the Order Entry screen does:
    // it calls ChangePartNumMaster and ChangeSellingQtyMaster in turn.
    // Copy those calls and their parameters from a trace of the screen.

    soSvc.Update(ref ds);
});
```

To delete, set the row's `RowMod` to `"D"` and call `Update`.

## Replaying what the screen does

Setting a field in the tableset is not the same as a user typing it. On many screens, changing a field
calls a `Change…` method that looks up prices, units of measure, warehouses and so on. If your function
sets `PartNum` directly and saves, those dependent fields are wrong or missing.

The reliable approach:

1. Do the task by hand in the screen with tracing or the browser's **Network** tab on (see
   [Find the method a screen calls](/platform/bpm/finding-the-right-method/)).
2. Note every method called, in order, with its parameters.
3. Make the same calls in the same order in your function.

Some `Change…` methods have long parameter lists full of `ref` and `out` values used for prompts.
Declare a variable for each and pass values that suppress prompts where the method offers that option.

## Transactions

Tick **Requires Transaction** on any function that makes more than one `Update` call. Without it, a
failure halfway through leaves the first updates saved and the rest not, for example half of an
order's lines deleted and none re-added.

## Direct database writes

With **DB Access from Code** set to `Read Write` and the table marked **Updatable**, code can change
rows through `Db` and call `Db.SaveChanges()`. That bypasses business logic entirely: no validation,
no change log, no related updates. Keep it for UD tables and UD fields, which have no business logic to
skip, and use BOs for everything else. Patterns for UD tables are in
[Function recipes](/platform/functions/function-recipes/).

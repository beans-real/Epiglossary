---
title: Updatable BAQs
description: Set up a BAQ that saves changes back to the database through a business object, get the key fields right (especially on UD tables), and hook BPM directives to its GetList, GetNew and Update methods.
env: both
sidebar:
  order: 6
---

An updatable BAQ (uBAQ) is a query that can also write. Users edit its rows in a dashboard or grid, and the BAQ passes the changes to a business object method, usually `UpdateExt`, which saves them with the same validation as the normal screen. It's the quickest way to give people a bulk-edit grid over data that's awkward to change one record at a time.

This page covers the BAQ side. To put an updatable BAQ on a Kinetic screen or dashboard, follow [Updatable BAQ grids](/kinetic/application-studio/updatable-baq-grids/).

## Before you start

- Creating updatable BAQs needs **BAQ Advanced User** rights in **User Account Security Maintenance**. Writing custom code in its directives needs **BPM Advanced User** rights and the BPM module licence. On multi-tenant cloud, advanced BPM rights aren't available, and Epicor asks cloud customers to complete uBAQ training before granting uBAQ rights.
- Build and test the query as a normal BAQ first. Every row must identify exactly one record in the table you'll update, so include all of that table's key fields.

## Steps

### 1. Mark the query updatable

On the query's general details, tick **Updatable**. This enables the update settings (Kinetic: typically the **Update** options on the Overflow menu; Classic: the **Update** sheet).

### 2. General properties

- Tick **Updatable** against each column users may edit. Leave key fields and anything calculated read-only.
- **Allow New Record** lets users add rows (this uses the `GetNew` method).
- **Allow Multiple Row Updatable** lets users change several rows before saving.

### 3. Update processing

Pick how the changes are saved:

| Processing method | What it does | Use it when |
|---|---|---|
| **BPM Update** (default) | Calls a business object's update method (`UpdateExt`) with the changed rows | You're updating a standard Epicor table, a UD table or an extension column, and want normal validation |
| **Advanced BPM Update Only** | Does nothing by itself; you write the save logic in a base-processing directive on the uBAQ's `Update` method | The change spans several tables or needs custom logic |
| **Service Connect Workflow** | Hands the rows to a Service Connect workflow | You already use Service Connect |

For **BPM Update**, click **Business Object** and choose the one that owns the table (for example `Erp.SalesOrder` for `OrderHed`, or `Ice.UD03` for `UD03`), then tick the table under **Tables to update**. The **Query to Object Column Mapping** grid shows which BAQ column fills which field. Columns with matching names map themselves; use the **Expression Editor** to fill a field from another column or a constant, such as `Constants.CurrentCompany` for `Company`.

### 4. Test in the designer

Use **Get List** to fetch rows, change a value, then **Update**. Check the record on its normal screen or in a tracker. Test adding a row the same way if you allowed new records.

## UD tables: display every key

A uBAQ over a UD table (`UD01` to `UD40` and their child tables) only saves if **all five key fields**, `Key1` to `Key5`, are among the display columns and mapped to the business object, along with `Company`. That's true even if you only use `Key1`: blank keys are still part of the record's identity, and the update can't find or create the row without them. Display the unused keys as read-only columns and hide them in the dashboard or grid if they clutter it.

## The uBAQ's own methods

Every updatable BAQ gets its own set of methods that directives can attach to:

| Method | Runs when |
|---|---|
| `GetList` | The query's rows are fetched |
| `GetNew` | A user adds a new row |
| `Update` | Changed rows are saved (this holds the generated base-processing code that calls the business object) |
| `FieldValidate` | Before a field change is accepted, to reject bad values |
| `FieldUpdate` | After a field change is accepted, to fill dependent fields (such as a description after a part number) |
| `RunCustomAction` | A custom action you define is run from the grid |

Open them from the query's **BPM Directives Configuration** button. They're listed per query, named after the company and the BAQ ID, and they work like any method directive: pre-processing, base processing and post-processing. See the [BPM overview](/platform/bpm/overview/) for how directives behave in general.

Typical uses:

- **Defaults on new rows**: post-processing on `GetNew`, setting values the same way as [Default and lock field values](/platform/bpm/default-field-values/).
- **Validation**: pre-processing on `Update` that throws an exception to block a bad save. See [Messages and exceptions](/platform/bpm/messages-and-exceptions/).
- **Values SQL can't easily produce**: post-processing on `GetList` that fills a calculated column.

### Filling a calculated column from GetList

Sometimes a column needs logic that is painful in SQL, such as "the serial numbers shipped on this order, or if there are none, the serials from the job that made it". You can leave that column empty in the BAQ and fill it in code after `GetList` returns.

1. In the BAQ, add a calculated field to hold the value, for example `SerialList`, type `nvarchar`, expression `''`, and a wide format such as `x(500)`.
2. Tick **Updatable** on the query (the uBAQ methods only exist for updatable queries). **Advanced BPM Update Only** is enough if nobody saves through it.
3. Add a post-processing directive on the query's `GetList` method with custom code like this:

```csharp
var rows = result.Results.ToList();
var orderNums = rows.Select(r => r.OrderHed_OrderNum).Distinct().ToList();

// One query for every order in the result, not one per row
var serialsByOrder = (
        from sd in Db.ShipDtl
        join sn in Db.SerialNo
            on new { sd.Company, sd.PackNum, sd.PackLine }
            equals new { sn.Company, sn.PackNum, sn.PackLine }
        where sd.Company == Session.CompanyID
           && orderNums.Contains(sd.OrderNum)
        select new { sd.OrderNum, sn.SerialNumber })
    .ToList()
    .GroupBy(x => x.OrderNum)
    .ToDictionary(g => g.Key,
                  g => string.Join(", ", g.Select(x => x.SerialNumber).Distinct()));

foreach (var row in rows)
{
    string serials;
    row.Calculated_SerialList = serialsByOrder.TryGetValue(row.OrderHed_OrderNum, out serials)
        ? serials
        : "";
}
```

The result rows use the BAQ's column aliases (`OrderHed_OrderNum`, `Calculated_SerialList`) as property names. Loading everything in one query and looking values up in a dictionary keeps it fast; querying inside the loop is the classic way to make a uBAQ dashboard crawl. [Query the database with LINQ](/platform/bpm/linq-queries/) and [Filter and extend list results](/platform/bpm/customize-list-results/) explain the pattern.

Before reaching for code, check whether a `STRING_AGG` in an inner subquery does the job (see [Calculated fields](/platform/baq/calculated-fields/#aggregates-and-lists-of-values)). SQL is faster and has no code to maintain.

## Gotchas

- **The save does nothing and no error appears.** Check the column mapping: an editable column that isn't mapped to a business object field is simply ignored.
- **The update can't find the record, or adds a new one instead.** A key field is missing from the display columns or the mapping. On UD tables, that's usually one of `Key2` to `Key5`.
- **The uBAQ always uses the live database.** Updatable queries run against the primary database, never a read-only replica, so heavy uBAQs compete with users. Keep their row counts modest with criteria or parameters.
- **Directives travel separately.** Exporting a BAQ may export only the query. Check that its uBAQ directives also move with it to the next environment.


---
title: "The BPM tableset: ds, tt and RowMod"
description: What data a directive can see, how RowMod marks added, changed and deleted rows, and how to compare a row's old and new values.
env: both
sidebar:
  order: 4
---

Every directive works on an in-memory copy of the records involved in the call. Knowing how that copy
is shaped (which rows are in it, which are new, which are the "before" picture) is the difference
between a BPM that works and one that fires at the wrong time or on the wrong row.

## Names you'll see in code

| Name | What it is |
|---|---|
| `ds` | In a method directive, the method's tableset parameter. Tables are properties: `ds.OrderHed`, `ds.OrderDtl`. |
| `result` | In post-processing, the method's return value when it returns a tableset, for example `result.JobHeadList` after a `GetList` call. |
| Other parameters | Each method parameter is a variable with the same name, for example `whereClause` on `GetList`. |
| `ttOrderDtl` and similar | The `tt` ("temp table") naming. Data directives use it for the table being saved, and you'll see it in older method directive code. |
| `Db` | The database context, for reading and writing tables directly: `Db.Part`, `Db.JobOper`. |
| `Session.CompanyID`, `callContextClient.CurrentCompany` | The company the call is running in. Always filter `Db` queries by company. |
| `Session.UserID` | The user who made the call. |
| `callContextBpmData` | A set of spare fields that travel with the call; see [Pass data from pre- to post-processing](/platform/bpm/passing-data-pre-to-post/). |

Not every tableset table is a database table. Some methods use working tables of their own. For
example, the Order Job Wizard's `CreateJobs` method carries a `JWOrderRel` table; in post-processing
its rows tell you which jobs were just created. Check the trace to see what a method's tableset
contains.

## RowMod

Each row in a tableset has a `RowMod` value that tells the business object what to do with it.

| `RowMod` | Constant | Meaning |
|---|---|---|
| `"A"` | `IceRow.ROWSTATE_ADDED` | New row, to be inserted |
| `"U"` | `IceRow.ROWSTATE_UPDATED` | Existing row with changes, to be updated |
| `"D"` | `IceRow.ROWSTATE_DELETED` | Row to be deleted |
| `""` | None; compare with `""` | No change; often the *before-image* of an updated row |

Both forms work in code and in widget expressions. The constants are easier to read.

In widgets, the same idea appears as the row selector: **the added row**, **the updated row**,
**the deleted row**, and **the changed row** (added *or* updated).

## Before-images: the old and new copies of a row

When a client saves a change to an existing row, it normally sends *two* copies: the original row
with `RowMod = ""`, and the edited row with `RowMod = "U"`. That's how widget conditions such as
"field has been changed from X to Y" work: they compare the two copies.

You can do the same in code. This pre-processing example on `SalesOrder.Update` spots lines where the
order quantity went up:

```csharp
foreach (var edited in ds.OrderDtl.Where(r => r.RowMod == IceRow.ROWSTATE_UPDATED))
{
    var original = ds.OrderDtl.FirstOrDefault(r =>
        r.RowMod == "" &&
        r.OrderNum == edited.OrderNum &&
        r.OrderLine == edited.OrderLine);

    if (original == null)
        continue; // caller didn't send a before-image

    if (edited.OrderQty > original.OrderQty)
    {
        // quantity was increased on this line
    }
}
```

:::caution
Don't rely on the before-image always being there. Some callers, such as `UpdateExt` and some REST
integrations, send only the changed row. When you must know the old value for certain, read it from
`Db` in pre-processing: the database still holds the old value until the base method saves.
:::

## Don't assume the first row is the one you want

Code like `ds.OrderDtl[0]` or `ds.OrderDtl.FirstOrDefault()` is a common source of bugs:

- The tableset can hold several rows, for example when a user edits multiple grid lines before saving.
- Index 0 may be the unchanged before-image, not the edited row.
- The table may be empty, in which case `[0]` throws.

Filter by `RowMod` instead, and loop over every matching row:

```csharp
foreach (var line in ds.OrderDtl.Where(r =>
    r.RowMod == IceRow.ROWSTATE_ADDED || r.RowMod == IceRow.ROWSTATE_UPDATED))
{
    // handle each new or edited line
}
```

## UD fields in the tableset

User-defined fields (the ones ending in `_c`) appear on tableset rows once the data model has been
regenerated. You can read and write them as properties (`row.MyField_c`), or by name, which is handy
when the field was added after the code was written:

```csharp
row["MyField_c"] = "value";
row.SetUDField<decimal>("MyQty_c", 10m);
```

The by-name form also lets you add extra columns to rows you return to the client; see
[Filter and extend list results](/platform/bpm/customize-list-results/).

## Changes in post-processing

In post-processing, editing `ds` or `result` changes what goes back to the client, but it doesn't
save anything; the base method has already written to the database. To persist a change after the
fact, update the record through a business object or through `Db`, as described in
[Update other records from a BPM](/platform/bpm/updating-other-records/).

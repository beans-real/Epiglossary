---
title: Function recipes
description: Short, reusable Epicor Function patterns, a make-to-order quantity calculation, a history log in a UD table, pre-loaded lookups for fast loops, and a tidy way to return results.
env: both
sidebar:
  order: 10
---

Small patterns that come up again and again when writing functions. Each one lists the signature and
references it needs.

## Make-to-order quantity on a job

Returns how much of a job's production quantity is tied to sales order releases, as opposed to being
made for stock. Handy on a job traveler, an MES screen or a dashboard.

- Request: `jobNum` (`System.String`)
- Response: `makeToOrderQty` (`System.Decimal`)
- References: tables `ERP.JobProd`, `ERP.OrderRel` (read-only)

```csharp
if (string.IsNullOrWhiteSpace(jobNum))
    return;

makeToOrderQty = (
    from jp in Db.JobProd
    join rel in Db.OrderRel
        on new { jp.Company, jp.OrderNum, jp.OrderLine, jp.OrderRelNum }
        equals new { rel.Company, rel.OrderNum, rel.OrderLine, rel.OrderRelNum }
    where jp.Company == Session.CompanyID && jp.JobNum == jobNum
    select (decimal?)jp.ProdQty
).Sum() ?? 0m;
```

`JobProd` holds one row per demand the job satisfies; rows for stock have no order release to join to,
so the join keeps only order demand. Doing the join in one query is much faster than loading each
`JobProd` row and then looking up its release separately.

## Keep a history in a UD table

UD tables make a good log for values you want to track over time, for example the highest balance each
customer has reached. This pattern adds a new row only when the value beats the previous best, so the
table becomes a dated history of new highs.

- Request: `custNum` (`System.Int32`), `value` (`System.Decimal`)
- Response: `isNewHigh` (`System.Boolean`)
- Library: **DB Access from Code** = `Read Write`
- References: table `ICE.UD07`, marked **Updatable**

```csharp
string key = custNum.ToString();

decimal previousHigh = Db.UD07
    .Where(u => u.Company == Session.CompanyID && u.Key1 == key)
    .Max(u => (decimal?)u.Number01) ?? 0m;

isNewHigh = value > previousHigh;
if (!isNewHigh)
    return;

var row = new Ice.Tables.UD07
{
    Company  = Session.CompanyID,
    Key1     = key,
    Key2     = DateTime.Now.ToString("yyyyMMddHHmmss"),   // makes each row unique
    Number01 = value,
    Date01   = DateTime.Today
};

Db.AddObject(row);
Db.SaveChanges();
```

Notes:

- UD tables need every key combination to be unique. Using a timestamp (or a new GUID) as the second
  key lets you store many rows per customer.
- Direct writes are fine here because UD tables have no business logic to bypass. If you've added
  your own UD columns (for example `HighestBalance_c`), use those instead of the generic `Number01` for
  readability.
- Name and document the key layout in the UD table's description or in the library notes. Six months
  later, nobody remembers that `Key2` is a timestamp.

## Pre-load lookups before a loop

When a function loops over many rows and looks something up for each one, the lookups dominate the run
time. Load everything you'll need in one query, then look it up in memory:

```csharp
// One query instead of one per row
var resourceByOperation = Db.JobOpDtl
    .Where(d => d.Company == Session.CompanyID && jobNums.Contains(d.JobNum))
    .ToList()
    .GroupBy(d => $"{d.JobNum}|{d.AssemblySeq}|{d.OprSeq}")
    .ToDictionary(g => g.Key, g => g.First().ResourceID);

foreach (var op in operations)
{
    string key = $"{op.JobNum}|{op.AssemblySeq}|{op.OprSeq}";
    if (!resourceByOperation.TryGetValue(key, out var resourceID))
        continue;   // no detail row for this operation
    // ...
}
```

`ToList()` before the grouping runs the query once and moves the rest into memory. It also avoids the
"open DataReader" error that looping over a live query can cause; see
[Fix "There is already an open DataReader"](/platform/bpm/ef-core-open-datareader/).

## Return a result the caller can use

Callers such as Application Studio events, REST clients and other functions handle a small, predictable
result far better than an exception for every non-perfect outcome. A pattern that works well:

- Response `success` (`System.Boolean`) and `message` (`System.String`)
- Throw `Ice.BLException` only for genuine errors that should roll back (with **Requires
  Transaction** ticked)
- Use `success = false` plus a message for expected situations: "Order already closed", "Nothing to
  consolidate", "No email address on file"

```csharp
var order = Db.OrderHed.FirstOrDefault(o => o.Company == Session.CompanyID && o.OrderNum == orderNum);

if (order == null)
{
    success = false;
    message = $"Order {orderNum} was not found.";
    return;
}

if (!order.OpenOrder)
{
    success = false;
    message = $"Order {orderNum} is already closed.";
    return;
}

// ... do the work ...
success = true;
message = $"Order {orderNum} updated.";
```

An Application Studio event can then branch on `{actionResult.success}` and show `{actionResult.message}`
to the user.

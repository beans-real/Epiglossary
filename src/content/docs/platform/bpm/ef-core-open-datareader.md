---
title: Fix "There is already an open DataReader"
description: Why BPM code that loops over a database query fails under Entity Framework Core, and how ToList() fixes it.
env: kinetic
sidebar:
  order: 17
---

Newer Kinetic releases run BPM and function code on Entity Framework Core. Code that loops over a
database query and runs another query inside the loop can fail there, even if it worked for years on
Epicor 10. The fix is usually one method call.

<!-- TODO verify: the first Kinetic release that moved BPM code to EF Core, to state it inline -->

## Symptom

A save or process fails with:

```text
There is already an open DataReader associated with this Connection which must be closed first.
```

## Cause

A `foreach` over a `Db` query doesn't load all the rows up front. It keeps the database reader open and
pulls rows one at a time as the loop advances. If the loop body runs *another* query (a lookup, an
`Any()`, a `Db.Validate()`), it needs the same connection while the first reader is still open, and EF
Core refuses.

```csharp
// Fails: the OrderRel reader is still open when the Part lookup runs
foreach (var rel in Db.OrderRel.Where(r => r.Company == company && r.OrderNum == orderNum))
{
    var part = Db.Part.FirstOrDefault(p => p.Company == company && p.PartNum == rel.PartNum);
    // ...
}
```

## Fix

Materialize the outer query with `.ToList()` so its rows are read completely, and the reader closed,
before the loop starts:

```csharp
var releases = Db.OrderRel
    .Where(r => r.Company == company && r.OrderNum == orderNum)
    .ToList();

foreach (var rel in releases)
{
    var part = Db.Part.FirstOrDefault(p => p.Company == company && p.PartNum == rel.PartNum);
    // ...
}
```

For query syntax, wrap the whole query in brackets and add `.ToList()` at the end:

```csharp
foreach (var row in (from d in Db.OrderDtl
                     join r in Db.OrderRel
                        on new { d.Company, d.OrderNum, d.OrderLine }
                        equals new { r.Company, r.OrderNum, r.OrderLine }
                     where d.Company == company && d.OrderNum == orderNum
                     select new { d.OrderLine, d.PartNum, r.OrderRelNum }).ToList())
{
    // ...
}
```

## Better still: no query in the loop

`.ToList()` fixes the error, but the loop still runs one lookup per row. Where you can, load the lookup
data once as well:

```csharp
var partNums = releases.Select(r => r.PartNum).Distinct().ToList();

var parts = Db.Part
    .Where(p => p.Company == company && partNums.Contains(p.PartNum))
    .ToDictionary(p => p.PartNum);
```

Then look each part up in the dictionary inside the loop. See
[Query the database with LINQ](/platform/bpm/linq-queries/#dont-query-inside-a-loop).

## Notes

- `.ToList()` loads every matching row into memory, so keep the outer query filtered to what you need.
- The same applies to loops that *update* rows: materialize the list first, change the rows, then call
  `Db.Validate()` after the loop.
- When upgrading from Epicor 10, search existing directives and functions for `foreach` over `Db.`
  queries and fix them before go-live rather than waiting for users to hit the error.

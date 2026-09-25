---
title: Query the database with LINQ
description: Read Epicor tables from BPM code with the Db context, join the tableset to database tables efficiently, and avoid the common performance and null traps.
env: both
sidebar:
  order: 8
---

BPM custom code reads the database through `Db`, an Entity Framework context with a property for each
table (`Db.Part`, `Db.OrderRel`, `Db.JobOper`, and so on). You query it with LINQ. A few habits make the
difference between code that runs in milliseconds and code that locks up a busy screen.

## A basic lookup

```csharp
var part = Db.Part
    .Where(p => p.Company == Session.CompanyID && p.PartNum == partNum)
    .Select(p => new { p.PartDescription, p.InActive })
    .FirstOrDefault();

if (part == null)
{
    // no such part: handle it rather than letting the next line throw
}
```

The habits in that snippet:

- **Always filter by company.** Tables hold every company's data. Use `Session.CompanyID` or
  `callContextClient.CurrentCompany`, or the `Company` of the row you're working on.
- **Select only what you need.** Projecting to a few columns keeps the query light.
- **Use `FirstOrDefault` and check for `null`.** `First()` throws "Sequence contains no elements"
  when nothing matches.
- **Use `Any()` to test existence.** `Db.POHeader.Any(...)` is cheaper and clearer than
  `.Count() > 0`.

## Lock hints

Epicor adds a `With()` extension for SQL lock hints:

```csharp
// read-only lookup that shouldn't wait on other users' locks
var rel = Db.OrderRel.With(LockHint.NoLock)
    .FirstOrDefault(r => r.Company == company && r.OrderNum == orderNum
                      && r.OrderLine == orderLine && r.OrderRelNum == relNum);

// reading a row you're about to change: lock it for the rest of the transaction
var counter = Db.UDCodes.With(LockHint.UpdLock)
    .FirstOrDefault(u => u.Company == company && u.CodeTypeID == "NEXTNUM" && u.CodeID == "CUSTOMER");
```

`NoLock` can read uncommitted data, so use it for display and lookups, not for values you'll write back.
See [Auto-number customer and supplier IDs](/platform/bpm/auto-numbering-ids/) for `UpdLock` in context.

## Joining the tableset to the database

A frequent need: "for the lines being saved, look something up on the related master record". The
tempting version joins `ds` straight to `Db`:

```csharp
// Avoid: ds.QuoteDtl is in memory, so this pulls the whole Part table across to join it
var inactive = (from q in ds.QuoteDtl
                join p in Db.Part on new { q.Company, q.PartNum } equals new { p.Company, p.PartNum }
                where p.InActive
                select p.PartNum).ToList();
```

Because `ds.QuoteDtl` is an in-memory list, LINQ can't send the join to SQL. It reads `Db.Part` in full
and joins in memory. On a small test database you won't notice; in production it's slow.

**Better: collect the keys first, then query with `Contains`.** This becomes a single SQL query with
an `IN` list:

```csharp
var partNums = ds.QuoteDtl
    .Where(r => r.RowMod == IceRow.ROWSTATE_ADDED || r.RowMod == IceRow.ROWSTATE_UPDATED)
    .Select(r => r.PartNum)
    .Distinct()
    .ToList();

var inactive = Db.Part
    .Where(p => p.Company == Session.CompanyID && partNums.Contains(p.PartNum) && p.InActive)
    .Select(p => p.PartNum)
    .ToList();
```

**Or join database to database**, using the changed row only to supply the key. This checks every
line on the quote, not just the ones in this save:

```csharp
var line = ds.QuoteDtl.FirstOrDefault(r =>
    r.RowMod == IceRow.ROWSTATE_ADDED || r.RowMod == IceRow.ROWSTATE_UPDATED);
if (line == null) return;

var inactive =
    (from q in Db.QuoteDtl
     join p in Db.Part
        on new { q.Company, q.PartNum } equals new { p.Company, p.PartNum }
     where q.Company == line.Company && q.QuoteNum == line.QuoteNum && p.InActive
     select p.PartNum)
    .Distinct()
    .ToList();
```

In pre-processing the database doesn't yet include the lines being saved; in post-processing it does.
Pick the stage that matches what you want to check.

### Composite join keys

To join on more than one field, compare two anonymous objects. The property names on both sides must
match, so name them explicitly when the fields differ:

```csharp
join v in Db.Vendor
    on new { c.Company, VendorNum = c.VendorNum, ConNum = c.ConNum }
    equals new { v.Company, VendorNum = v.VendorNum, ConNum = v.PrimPCon }
```

## Don't query inside a loop

A lookup inside a `foreach` runs one SQL query per row. With a few hundred rows that's a few hundred
round trips. Load what you need once into a dictionary, then look up in memory:

```csharp
var descByPart = Db.Part
    .Where(p => p.Company == Session.CompanyID && partNums.Contains(p.PartNum))
    .ToDictionary(p => p.PartNum, p => p.PartDescription);

foreach (var row in ds.QuoteDtl)
{
    string desc;
    if (descByPart.TryGetValue(row.PartNum, out desc))
    {
        // use desc
    }
}
```

Restrict the dictionary to the keys you actually need. Loading an entire table "to be safe" moves the
problem rather than fixing it.

## Strings and nulls

- SQL Server comparisons are normally case-insensitive already, so a plain `==` in a query does what
  you want. Avoid `string.Compare(a, b, StringComparison.OrdinalIgnoreCase)` inside a `Db` query: it
  can't always be translated to SQL, and in Kinetic's EF Core runtime an untranslatable query throws
an error instead of quietly running in memory.
- `FirstOrDefault()` returns `null` when nothing matches, so don't chain `.ToString()` straight onto it.
  Use `?? ""`:

```csharp
string buyerEmail = Db.PurAgent
    .Where(b => b.Company == Session.CompanyID && b.BuyerID == buyerId)
    .Select(b => b.EMailAddress)
    .FirstOrDefault() ?? "";
```

## LINQ in widget expressions

Widget fields that accept an expression (such as **Set Field** or **Set Argument/Variable**) take any
single C# expression, including a LINQ query. That lets you do a lookup without a Custom Code widget.
The same rules apply: filter by company, end with `FirstOrDefault()`, and add `?? ""` or a default
value. [Default and lock field values](/platform/bpm/default-field-values/) has an example.

## Related

- [Fix "There is already an open DataReader"](/platform/bpm/ef-core-open-datareader/) for nested
  queries in Kinetic.
- [Run a BAQ from BPM code](/platform/bpm/calling-a-baq/) when the query already exists as a BAQ.

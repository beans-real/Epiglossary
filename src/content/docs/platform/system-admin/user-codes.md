---
title: User codes
description: What user-defined codes are, the two tables behind them, and practical uses such as drop-down lists, filter lists for BAQs and reports, and email distribution lists.
env: both
sidebar:
  order: 6
---

**User codes** (user-defined codes, or UD codes) are small, company-specific lookup lists that you
maintain yourself in **User Codes Maintenance**. Each list has a code type (the list) and any number
of codes (the entries). Because they are plain data, anyone with access can add or retire an entry
without a developer, a data model regeneration or a new release of a customization.

<!-- TODO verify: menu path for User Codes Maintenance in Kinetic and Classic -->

## The tables

| Table | Holds | Key fields |
|---|---|---|
| `Ice.UDCodeType` | One row per list (the parent) | `Company`, `CodeTypeID`, `CodeTypeDesc` |
| `Ice.UDCodes` | One row per entry in a list (the children) | `Company`, `CodeTypeID`, `CodeID`, `CodeDesc`, `IsActive` |

Join `UDCodes` to `UDCodeType` on `Company` and `CodeTypeID`. Both are company-specific, so a list
created in one company doesn't exist in another.

<!-- TODO verify: field names CodeTypeDesc (UDCodeType) and IsActive (UDCodes) -->

## What they're good for

**Drop-down lists.** A Kinetic combo box can take its options straight from a user code type, so users
pick from a list you can change without touching the layer. See
[Combo boxes](/kinetic/application-studio/combo-boxes/).

**Filter lists for BAQs and reports.** Instead of hard-coding a list of part numbers, product groups or
customers into a BAQ's criteria, keep them as codes in a user code type and join or subquery against
`UDCodes`. When the list changes, someone updates the codes and the BAQ follows.

```sql
-- Parts whose number is in the XX_WATCHPARTS user code list
SELECT p.PartNum, p.PartDescription
FROM Erp.Part p
WHERE p.Company = 'EPIC06'
  AND p.PartNum IN (
      SELECT c.CodeID
      FROM Ice.UDCodes c
      WHERE c.Company = p.Company
        AND c.CodeTypeID = 'XX_WATCHPARTS');
```

**Email distribution lists.** A BPM or function that emails a report needs to know who to send it to.
Two ways to store that in user codes:

- one code per recipient, with the address in the description, when you want to add and remove people
  individually, or
- a single code type whose description holds the whole semicolon-separated list, when the list is
  maintained as one unit.

**Counters and settings.** A code's description can hold a value that code reads and updates, such as
the next number in a sequence. See [Auto-number customer and supplier IDs](/platform/bpm/auto-numbering-ids/).

## When to use something else

- If the value belongs to a record (a part, an order), it is a field: add a
  [UD field](/platform/system-admin/ud-fields/).
- If the list needs several columns of data per entry, a UD table is a better fit than squeezing values
  into a description.

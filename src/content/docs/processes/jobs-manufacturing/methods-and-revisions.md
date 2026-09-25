---
title: Methods, revisions and mass changes
description: Track customer drawing revisions, replace or delete a component across every bill of materials, and fix a BOM cost report that fails after a mass import.
env: both
sidebar:
  order: 5
---

A job's method is copied from the part revision's method of manufacture, which engineering maintains in
**Engineering Workbench** through an ECO group. Keeping those methods tidy is what makes jobs, costing
and reports come out right. This page covers three recurring method-maintenance tasks.

## How methods are stored

| Table | Holds |
|---|---|
| `PartRev` | Approved revisions of a part |
| `PartMtl`, `PartOpr` | The approved method: materials and operations of each revision |
| `ECORev`, `ECOMtl`, `ECOOpr` | Working copies checked out to an ECO group in Engineering Workbench |

When you check a revision out, Epicor copies `PartMtl`/`PartOpr` into the ECO tables. When you check it
back in and approve it, the ECO copy replaces the approved method. Problems usually start when the two
sets drift apart.

## Tracking a customer's drawing revision

Customers who send drawings have their own revision letters. Two workable approaches:

1. **Record the drawing on your revision.** Keep your own revision scheme and store the customer's
   drawing number and revision in the revision's drawing field (`ECORev.DrawNum` while checked out,
   `PartRev.DrawNum` once approved). It flows onto jobs and printed travelers, so the floor sees which
   drawing to build to.
2. **Use the customer's revision as yours.** If the method exists only because the customer defined the
   part, make your part revision match theirs exactly (for example rev `C` in Epicor for drawing rev
   `C`). When a new drawing arrives, create a new revision with the new value. This is simple and makes
   order entry obvious, but mixes two numbering schemes if you also revise for internal reasons.

Customer part numbers themselves belong in **Customer Part Cross Reference**, which can also hold a
customer revision. See [Customer part numbers and order data](/processes/sales-shipping/customer-parts-and-order-data/).

## Replacing or deleting a component everywhere

**Mass Part Replace/Delete** (**Production Management > Engineering > General Operations**) swaps one
component for another, or removes it, across every bill of materials in one run.

1. Choose **Replace** or **Delete**.
2. Enter the component to change in **From**. For a replace, enter the new component in **To**.
3. Select **Process** and confirm.
4. Review what changed on the results card. Every affected revision also gets an entry in its revision
   change log.

How it treats revisions that are checked out to an ECO group:

| Revision state | What happens |
|---|---|
| Not checked out | `PartMtl` is updated |
| Checked out, not yet approved | The ECO copy (`ECOMtl`) is updated |
| Checked out, already approved | Only `PartMtl` is updated. The stale ECO copy is overwritten from `PartMtl` next time the part is checked out |

:::caution
Open jobs already carry their own copy of the method. Mass Part Replace/Delete changes future jobs, not
jobs that already exist. Update open jobs separately if they need the new component.
:::

## BOM Cost report fails for some parts

**Symptom:** the BOM Cost report (or another indented BOM report) errors or stops partway through for
certain parent parts.

**Cause:** the report walks each material line recursively. If a mass import (DMT) has left a material
line where `ECOMtl.MtlPartNum` and `PartMtl.MtlPartNum` disagree for the same sequence, the report can't
follow the structure for that part.

**Fix:**

1. Find the mismatched lines with a BAQ joining `PartMtl` to `ECOMtl` on company, part, revision and
   material sequence, filtered to rows where `MtlPartNum` differs.
2. Delete the bad material line with a DMT **Bill of Materials** delete.
3. Re-add the correct line with a DMT add.
4. Re-run the report.

**Prevention:** when importing methods, load them through the ECO path and approve them, rather than
patching one table directly.

## Related pages

- [The job lifecycle](/processes/jobs-manufacturing/job-lifecycle/)
- [Customer part numbers and order data](/processes/sales-shipping/customer-parts-and-order-data/)

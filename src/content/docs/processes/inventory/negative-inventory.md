---
title: Negative inventory and on-hand problems
description: How the Part Class negative quantity setting works, why backflush and Kanban receipts ignore it, what to do instead, and a PartLot on-hand flag that needs a data fix.
env: both
sidebar:
  order: 4
---

Negative on-hand means Epicor believes more has been taken out of a bin than was ever put in. It's
usually a symptom: a receipt not yet entered, labor reported before material was moved, or backflush
pulling from the wrong bin. This page covers the controls Epicor gives you and the cases they don't
cover.

## The Part Class setting

Each **Part Class** has a **Negative Qty Action** that applies when a transaction would take a part's
on-hand below zero:

| Setting | Effect |
|---|---|
| **None** | The transaction goes through silently |
| **Warn** | A warning appears, but the user can continue |
| **Stop** | The transaction is blocked |

It applies to interactive transactions such as **Issue Material**, **Mass Issue to Mfg** and quantity
adjustments.

## What the setting doesn't catch

**Backflush is exempt.** Backflushed material is issued as a side effect of labor reporting, and there's
no user to show a warning to, so the Part Class rule isn't applied. **Kanban Receipts** issue all their
component materials by backflush, so they can drive on-hand negative even when the class is set to
**Stop**.

Blocking these transactions wouldn't help anyway: the labor or receipt has already happened on the
floor. The better question is *why* the backflush went negative. Nearly always it's one of:

- **The wrong bin.** Backflush takes material from the backflush warehouse and bin of the resource or
  resource group on the material's related operation, or from the part's primary warehouse and bin if
  none is set. If the stock actually lives elsewhere, the backflush bin goes negative while the real bin
  stays full. Point the resource's **Backflush Warehouse**/**Backflush Bin** (or the part's primary bin)
  at where the material really is.
- **Timing.** The receipt or transfer that should have filled the bin hasn't been entered yet.
- **Unrecorded substitutions or scrap.** The floor used something other than what the method says.

<!-- TODO verify: the full backflush location hierarchy (resource, resource group, part primary warehouse/bin) and its order. -->

If you do need automation, trace a Kanban receipt to find the method that performs the backflush and
use a BPM to pick a bin with enough stock before the issue is written. See
[Find the method a screen calls](/platform/bpm/finding-the-right-method/).

## Finding negative bins

A BAQ on `PartBin` with `OnhandQty < 0`, joined to `Part` for the description and class, gives a daily
exception list. Review it alongside recent `PartTran` rows for the part to see which transaction took it
below zero.

## PartLot shows on hand with nothing in any bin

**Symptom:** a lot is still flagged as having stock (`PartLot.OnHand` is checked) but `PartBin` has no
quantity for that lot, so the lot keeps appearing in lot searches.

**Cause:** the flag is normally cleared automatically when the last quantity leaves the lot. Occasionally
a transaction leaves it set.

**Fix:** it can't be cleared from the UI. Ask Epicor Support for a data fix to recalculate or clear
`PartLot.OnHand` for the affected lots.

## Related pages

- [How inventory flows through jobs](/processes/jobs-manufacturing/inventory-flow-through-jobs/)
- [Cycle counts](/processes/inventory/cycle-counts/)

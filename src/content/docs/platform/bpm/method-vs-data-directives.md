---
title: Method directives vs data directives
description: How to decide whether a rule belongs on a business object method or on a table, and which stage of each to use.
env: both
sidebar:
  order: 2
---

Most BPM requirements can be built either as a method directive or as a data directive. Picking the
right one up front saves you from rules that miss some entry paths, fire too often, or run too late to
change anything. This page walks through the decision.

## The core difference

A **method directive** listens to one business object method. It knows the method's parameters and
return value, and it only runs when that exact method is called.

A **data directive** listens to one table. It knows nothing about which screen or method caused the
write, but it runs for every write to that table, including ones made by other business objects deep
inside Epicor's own logic.

| | Method directive | Data directive |
|---|---|---|
| Trigger | A specific BO method call | Any save to a specific table |
| Sees | The method's parameters, tableset and (post) result | The rows being written to that table |
| Catches writes from other BOs and processes | No, only calls to that method | Yes |
| Can react to non-save methods (`GetNew…`, `GetList`, `Change…`) | Yes | No, nothing is written |
| Stages | Pre, Base, Post | In-Transaction, Standard |

## Choosing

Use a **method directive** when:

- The behavior belongs to a user action: creating a new record (`GetNewCustomer`), changing a field
  (`ChangeShipToID`), opening a list (`GetList`, `GetRows`), or running a process method.
- You need the method's parameters, for example a `whereClause` on `GetList`, or the result of a
  retrieval method.
- You want the user to see the effect straight away on screen, such as a default filled in when they
  click **New**.

Use a **data directive** when:

- The rule is about the data itself and must hold however the row is saved, for example "an order line
  must never be saved with a zero price".
- Several business objects write the same table and you don't want to hook each one.
- You need a follow-up action only once a save has definitely been committed (a **Standard** directive).

:::tip
If you find yourself adding the same method directive to `Update`, `MasterUpdate` and a couple of
process methods, a single In-Transaction data directive on the table is usually simpler.
:::

## Choosing the stage

**Pre-Processing** (method) and **In-Transaction** (data) run before the change is final. Use them to
validate, to change the record being saved, or to cancel the operation by raising an exception.

**Post-Processing** (method) runs after Epicor's logic succeeds. Use it to touch *other* records, to
enrich what is returned to the client, or to notify someone. Doing foreign-record updates in
post-processing means they only happen if the main save actually worked.

**Standard** (data) runs after the commit. Use it for notifications and follow-up work. Changes to the
row itself are not saved from here.

**Base Processing** replaces Epicor's code. Don't use it on standard methods.

## Worked examples

| Requirement | Good fit | Why |
|---|---|---|
| Stop users in a sales security group converting a prospect to a customer | Pre-processing on `Customer.Update` | Needs to know who is calling and cancel the save |
| Always lock the unit price on new sales order lines | In-Transaction data directive on `OrderDtl` | Applies whichever process creates the line |
| Default the bank account when a user creates a cash receipt batch | Post-processing on `BankBatch.GetNewBankBatch` | The user should see the default before saving |
| Hide retired ship-via codes in every drop-down | Pre-processing on `ShipVia.GetList` | Only a method directive can change the `whereClause` parameter |
| Email the planner when a scheduled process finishes | Standard data directive on `SysTask` | Processes write their status to that table; there's no screen method to hook |
| Stamp a comment on every job operation when a job is released | Pre- plus post-processing on `JobEntry.Update` | Detect the change before the save, update the other table after it |

The patterns behind these examples are covered in
[Default and lock field values](/platform/bpm/default-field-values/),
[Filter and extend list results](/platform/bpm/customize-list-results/),
[Update other records from a BPM](/platform/bpm/updating-other-records/) and
[Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/).

## Finding the method to hook

The hard part of a method directive is often knowing which method the screen really calls. Kinetic and
Classic don't always call the same one for the same action. See
[Find the method a screen calls](/platform/bpm/finding-the-right-method/).

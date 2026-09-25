---
title: BPM conditions
description: Build Condition widgets that fire only when they should, including change-based checks, group membership, designed queries and conditions written in code.
env: both
sidebar:
  order: 5
sources:
  - title: "EpiUsers: BPM message pops up twice"
    url: https://www.epiusers.help/t/bpm-message-pops-up-twice/46919
---

Most directives start with a **Condition** widget that decides whether the rest of the flow should run.
A condition that is too loose makes the BPM fire on every save; a condition that is too strict makes it
silently do nothing. This page covers the condition types you'll use most and how to keep them precise
and fast.

## How the Condition widget works

A Condition widget has a list of condition lines and two exits, **True** and **False**. Lines are
joined with **And** / **Or**, and you can add opening and closing brackets in the prefix and postfix
columns to group them. Connect the rest of the flow to the exit you care about; an unconnected exit
simply ends the directive.

![Condition widget properties with four lines joined by And and Or, using the Prefix and Postfix columns to bracket the last two lines together](/images/82774676140ceb1913c8077856c6454814de29fa.png)

## Check for a change, not a state

The most common mistake is testing what a field *is* rather than whether it *changed*.

Say you want a message when an order is put on hold. A condition of "`OrderHed.OrderHeld` is equal
to true" is true on every later save of that order too: change the ship date and the message appears
again. The same happens when one save calls the method more than once, which is why users sometimes
see the message twice.

![A state-based condition: ttPOHeader.Approve is equal to true And DocTotalOrder is more than 100000, feeding a Show Message widget. Conditions like this fire on every save, not only when the value changes](/images/b4bb9adea6eaa703f95158a41061dfc0ce097ec4-2-568x500.png)

Use the change-based statement instead: **the specified field has been changed from** `false`
**to** `true`, on **the changed row**. That is only true on the save where the change actually
happened, because it compares the edited row with its before-image (see
[The BPM tableset](/platform/bpm/dataset-and-rowmod/#before-images-the-old-and-new-copies-of-a-row)).

| You want to react when… | Condition |
|---|---|
| A checkbox is ticked | Field changed from `false` to `true` |
| A status moves to a specific value | Field changed from *any* to `"VALUE"` |
| Any edit to a field | Field changed from *any* to *another* |
| A record is created | There is at least one **added** row in the table |

## Restrict by who is calling

Conditions can test the calling user, for example "the user who called the method belongs to the
specified group". Combined with a change check, this gives you simple permission rules without code.

**Example:** stop members of a sales security group converting a prospect into a customer.

1. Create a pre-processing directive on `Erp.BO.Customer.Update`.
2. Add a Condition with two lines joined by **And**:
   - The calling user belongs to the `XX_Sales` security group.
   - `Customer.CustomerType` of the changed row has been changed from *any* to `"CUS"`.
3. Connect **True** to a **Raise Exception** widget with a message such as *"Sales users can't convert
   prospects to customers. Ask Credit Control to do this."*

Because it's a pre-processing directive, the exception cancels the save and the customer stays a
prospect.

## Designed-query conditions

The "number of rows in the designed query" condition lets you run a small query that can join the
directive's tableset to database tables. It's the no-code way to ask questions such as "does a
related record already exist?".

**Example: is this the first record of its kind?** Suppose you want to act on the first labor entry
ever recorded against a job.

1. In a pre-processing directive on `Erp.BO.Labor.Update`, add a Condition line: *number of rows in
   the designed query is equal to 0*.

   ![BPM Workflow Designer with a Condition widget after Start and its condition line "Number of rows in the designed query is equal to 0", with Id, Operator, Prefix, Condition and Postfix columns](/images/bpm-check-first-record-2.png)

2. In the query, add the tableset's `LaborDtl` table and the database `Erp.LaborDtl` table.
3. Join them on `Company` and `JobNum`, and filter the tableset table to added rows.
4. If the query returns no rows, nothing for that job is in the database yet, so the row being added
   is the first.

This has to be pre-processing: in post-processing the new row is already saved, so the query would
always find it.

![Compose Query dialog joining the tableset ds.LaborDtl to ERP.LaborDtl, with Table Relations Company = Company and JobNum = JobNum](/images/bpm-check-first-record-3.png)

## Keep conditions cheap

A directive on `Update` runs on every save of that screen, so its first condition runs a lot.

- Put cheap checks (row state, a field value, a change check) in a **first** Condition widget, and the
  designed query in a **second** one connected to its True exit. The query then only runs when it
  might matter.
- In designed queries, join and filter on indexed key fields (company, job number, order number).
  The **Data Dictionary Viewer** lists each table's indexes.
- Avoid conditions that scan whole tables with no filter from the current row.

## When widgets aren't enough

Some tests are awkward or impossible to express with condition lines, particularly ones that need
several tables or a loop. You have two options:

- Add a **Custom Code** widget that works out the answer and stores it in a directive variable (for
  example a `bool` called `shouldRun`), then follow it with a Condition on that variable. The rest of
  the flow can stay as widgets.
- Write the whole check and action in code. This is often clearer than a long chain of widgets, and
  it means the condition and the change live in one place.

```csharp
// Custom Code widget: decide whether the rest of the directive should run
shouldRun = ds.OrderHed.Any(r =>
    r.RowMod == IceRow.ROWSTATE_UPDATED &&
    r.OrderHeld &&
    ds.OrderHed.Any(o =>
        o.RowMod == "" &&
        o.OrderNum == r.OrderNum &&
        !o.OrderHeld));
```

## Related

- [Common BPM problems](/platform/bpm/troubleshooting/) covers directives that fire twice or not at all.
- [Messages and exceptions](/platform/bpm/messages-and-exceptions/) covers what to do on the True exit.

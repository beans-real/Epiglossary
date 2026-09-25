---
title: Schedule a function
description: Run an Epicor Function automatically on a recurring schedule through the System Agent, check that it ran, and design scheduled functions so failures don't go unnoticed.
env: both
sidebar:
  order: 7
---

Any function can be run by the System Agent on a schedule: nightly data housekeeping, an hourly sync
with another system, a weekly summary email. This replaces the old habit of hanging logic on a
directive that "happens to fire often enough".

## Before you start

- The function's library must be authorized for the company you schedule it from (its **Security**
  card). A scheduled call from an unauthorized company fails.
- Decide what "success" looks like. A scheduled function runs asynchronously, so **nobody receives its
  response parameters**. If you need to know what it did, the function has to tell you (see below).

## Steps

1. **Create a schedule** in **System Agent Maintenance** (**System Setup > System Maintenance > System
   Agent Maintenance**): choose **New Schedule**, give it a description, set the **Schedule Type**
   (for example **Interval**, for "every N minutes") and its timing, and save. Skip this if a suitable schedule
   already exists.
2. Open **Schedule Epicor Function** (under **System Management > Business Process Management** in
   the Classic menu).
3. Select the **Library ID** and the **Function ID**.
4. Enter values for the function's request parameters.
5. Pick the **Schedule** and tick **Recurring**.
6. Click **Submit**.

<!-- TODO verify: the Kinetic menu location of Schedule Epicor Function -->
<!-- TODO screenshot: Schedule Epicor Function with a library, function, parameter value and a recurring schedule selected -->

## Checking that it ran

Each run appears in **System Monitor** as a **Run Epicor Function** task. **History Tasks** shows
completed and failed runs; **Scheduled Tasks** shows what's queued. To stop a recurring schedule,
select it on **Scheduled Tasks** and delete it.

## Designing a function for the scheduler

A scheduled function has no user watching it. Build that in:

- **Report the outcome yourself.** Email a short summary ("42 customers checked, 3 updated"), or write
  a row to a UD table that a dashboard shows. Info messages go nowhere.
- **Send one summary, not one email per problem.** A job that fails for 2,000 records shouldn't send
  2,000 emails. Collect the failures and send one message with a clear subject, such as
  `[FAILURE] Nightly credit review`.
- **Log detail to the server log** for troubleshooting, using the application logger. See
  [Troubleshooting functions](/platform/functions/troubleshooting/#logging).
- **Make it safe to run twice.** Only change records that still need changing, so a re-run after a
  failure, or two overlapping runs, don't do the work twice.
- **Keep each run short.** If a job takes longer than its interval, runs start to overlap. Process in
  batches or lengthen the interval.
- **Retry transient errors.** Record locks and "row has been modified by another user" conflicts often
  succeed on a second attempt a moment later.

## Good candidates

- Housekeeping driven by a BAQ, such as recalculating credit limits or flagging inactive customers (see
  [Run a BAQ from a function](/platform/functions/running-baqs/#pattern-a-baq-driven-maintenance-job))
- Summary emails such as "new customers this week" (see
  [Send email from a function](/platform/functions/sending-email/))
- Pulling data from or pushing data to another system (see
  [Call external APIs from Epicor](/platform/rest-api/calling-external-apis/))
- Clearing out old rows from a UD table used as a log or staging area

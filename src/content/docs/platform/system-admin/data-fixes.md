---
title: Data fixes
description: What Epicor data fixes are, how they are imported and run on-premises and in the cloud, and what to check before asking Support for one.
env: both
sidebar:
  order: 10
---

A **data fix** is a script from Epicor Support that corrects data the application can't correct by
itself: a record stuck in a bad state, a flag set wrongly by an upgrade, a missing database object.
Data fixes are written for a specific problem and a specific release, and most expire after a while.
They are the supported alternative to editing Epicor's tables by hand.

## How data fixes are delivered and run

**On-premises**

1. Support sends you the fix as a `.df` file (or points you to one on EpicWeb).
2. On the server, open the **Epicor Administration Console** and import the file into the database with
   the **Import DB Health(s)** action.
3. In the client, open **Data Fix Workbench** (**System Management > Upgrade/Mass Regeneration > Data Fix
   Workbench**), find the fix, choose the records it should act on if it asks, and run it.

Data Fix Workbench only runs fixes that have been imported, and there is no import option inside it. If
you are looking for **Import Data Fix** in the client's **Actions** menu, you are in the wrong place: the
import happens on the server. Only users with security manager rights can run the workbench.

If a fix has expired, import the current version for your release from the console again.

**Epicor Cloud**

You can't import fixes yourself. Support runs the fix in your environment through your EpicCare case,
often in Pilot first so you can check the result before it is run in Live.

The **Data Health Check Workbench**, reachable from the same place, runs Epicor's health scripts, which
check for known data problems without changing anything. It's worth running when Support asks for it,
or before an upgrade.

## Before you ask for a data fix

- **Rule out the process.** Many "corrupt" records are the result of a normal process run in an unusual
  order. Support will ask how the data got that way. Write down the steps.
- **Reproduce it in Pilot** if you can. It speeds up the case and lets the fix be tested safely.
- **Expect to be charged for user error.** Epicor has started charging for data fixes where the cause
  turns out to be a user mistake rather than a software fault. Check your support agreement before
  opening a case for something like a transaction entered against the wrong record.

:::danger[Don't hand-edit Epicor tables]
Updating Epicor's tables directly with SQL skips business logic, audit and related-table updates, and
can leave data worse than before. Where a fix exists, use it. Where you must touch the database (see
[stuck active tasks](/platform/system-admin/troubleshooting/#a-task-is-stuck-in-active-tasks)), back up
first, do it on-prem only, and keep it to Epicor's system task tables.
:::

## Problems that usually need a data fix

These have their own entries in [Troubleshooting](/platform/system-admin/troubleshooting/):

- [A deleted scheduled task is still in the system](/platform/system-admin/troubleshooting/#a-deleted-scheduled-task-is-still-in-the-system)
- [Could not find stored procedure 'Erp._ZFW_Part_GetByID'](/platform/system-admin/troubleshooting/#could-not-find-stored-procedure-erp_zfw_part_getbyid)
- Standard reports marked inactive after an upgrade (see [Kinetic administration troubleshooting](/kinetic/administration/troubleshooting/#standard-reports-disappear-after-an-upgrade))
- An imported Application Studio layer that arrives empty (see [Application Studio troubleshooting](/kinetic/application-studio/troubleshooting/#imported-layer-is-empty))

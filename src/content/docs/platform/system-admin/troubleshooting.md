---
title: Troubleshooting
description: Symptoms, causes and fixes for common administration problems, from emails that never arrive and phantom scheduled tasks to missing stored procedures, stuck processes and oversized solutions.
env: both
sidebar:
  order: 20
---

Administration problems that come up often enough to be worth writing down, grouped by area. Problems
specific to Epicor Cloud on Linux, the Edge Agent and the browser client are on
[Kinetic administration troubleshooting](/kinetic/administration/troubleshooting/).

## Email

### Emails from Epicor aren't arriving

**Cause:** the message stopped at one of four points: the sending process failed, the email was never
generated, the mail relay suppressed it, or the receiving mail server rejected it (often because of
SPF).

**Fix:** check the **Email Log** first. No entry means Epicor never sent it, so look at the process or
report in System Monitor. An entry means it left Epicor, so check the relay (a Support case in the
cloud), then your mail server's logs, then your SPF record. The full sequence is in
[Email delivery and SPF](/platform/system-admin/email-delivery/#find-where-it-stopped).

## Scheduled tasks

### A scheduled report ran once and never again

**Cause:** **Recurring** wasn't ticked when the report was scheduled, so it was submitted as a one-off.

**Fix:** submit it again with a schedule selected and **Recurring** ticked. See
[Schedule a report](/platform/system-admin/scheduled-tasks/#schedule-a-report).

### A deleted scheduled task is still in the system

**Symptom:** you deleted a scheduled task in System Agent Maintenance or from your own scheduled tasks,
but it still exists in the database. Trying to schedule the same report or process again fails with an
error.

**Cause:** the delete didn't remove all of the task's records.

**Fix:** open a case with Epicor Support. There is a data fix that forcibly removes the orphaned task.
Give them the task description, schedule and owner. See [Data fixes](/platform/system-admin/data-fixes/).

### A task is stuck in Active Tasks

**Symptom:** a report or process shows in **System Monitor > Active Tasks** long after it should have
finished, and cancelling it from System Monitor doesn't clear it.

**Cause:** usually the task agent lost track of the task (it was restarted mid-run, or the process
crashed), so the task was never marked complete.

**Fix:**

1. Restart the task agent first. That clears most stuck tasks. See
   [Restart the task agent](/platform/system-admin/scheduled-tasks/#restart-the-task-agent).
2. In the cloud, if it's still there, ask Support to clear it.
3. On-premises, a database administrator can mark it complete directly. Find the task number, then
   close it and remove any pending cancel request:

```sql
-- 1. Find the stuck task
SELECT SysTaskNum, TaskDescription, TaskStatus, StartedOn
FROM Ice.SysTask
WHERE TaskStatus = 'Active';

-- 2. Mark it complete and clear any cancel request (replace 123456)
UPDATE Ice.SysTask
SET TaskStatus = 'Complete', EndedOn = GETDATE(), History = 1
WHERE SysTaskNum = 123456;

DELETE FROM Ice.SysTaskKill
WHERE SysTaskNum = 123456;
```

:::danger
Take a backup and try it in a test database first. Only touch the one task you identified, and only
when the task agent is not actually still running it. This is outside what Epicor supports, so it's an
on-premises last resort.
:::

<!-- TODO: confirm Ice.SysTask column names and status values ('Active', 'Complete') before anyone runs this UPDATE/DELETE -->

## Database and data model

### A new UD field doesn't show up anywhere

**Cause:** the data model hasn't been regenerated, or users haven't logged in again since.

**Fix:** regenerate the data model (Cloud Management Portal in the cloud; Administration Console plus an
application pool recycle on-prem), then have users log out and back in. See
[UD fields and data model regeneration](/platform/system-admin/ud-fields/).

### Could not find stored procedure 'Erp._ZFW_Part_GetByID'

**Symptom:** a screen or process fails with:

```text
Could not find stored procedure 'Erp._ZFW_Part_GetByID'
```

**Cause:** a SQL script that creates this stored procedure (`ZFW_Part_GetByID.sql`) hasn't been run
against the database.

**Fix:** the script must be run against the Epicor database. In the cloud, open a case and Epicor
Support will run it. On-premises, ask Support for the script and instructions and have your database
administrator run it.

## Performance and locking

### Processes hang or lock up when a BPM fails

**Symptom:** on 2025.1 or later, a process that runs a BPM hangs or locks up after that BPM throws an
error.

**Cause:** BPM activity tracking. In **Activity Type Maintenance**, the activity type that logs BPM
execution is switched on by default from 2025.1. When the BPM fails, its activity log entry can't be
written, and that can lock up the rest of the process.

**Fix:** as a workaround, disable the BPM tracking activity type in **Activity Type Maintenance**, then
fix the failing BPM. Turn tracking back on later if you need it.

## Solution Workbench

### The system freezes while building a solution

**Cause:** the solution is too large, for example every report style in the system at once.

**Fix:** in the cloud, open a case: Support may need to end the task or restore the database. On-prem,
clear it as a stuck task (above). Next time, build several smaller solutions. See
[Solution Workbench](/platform/system-admin/solution-workbench/#keep-solutions-small).

### A solution won't install in another environment

**Cause:** the solution was built on a newer release than the target (common while Pilot is upgraded
ahead of Live), or it's a `.cab` solution and the target is on 2026.1 or later.

**Fix:** build the solution on the target's release, or convert `.cab` solutions to `.zip` on a 2025.x
environment before upgrading. See [Solution Workbench](/platform/system-admin/solution-workbench/).

## Sites

### MfgSys can't be deleted, or comes back

**Cause:** it's still the company's default site, you're still logged in to it, or something (a part,
a warehouse, a transaction) already uses it.

**Fix:** follow the order in [Replace MfgSys](/platform/system-admin/new-site/#replace-mfgsys-in-a-new-company).
If data already uses it, you can't delete it; rename it instead.

---
title: Resources, resource groups and capabilities
description: How the scheduling engine picks who does an operation, why an operation should name only one of resource group, resource or capability, and how to schedule setup and production on different calendars.
env: both
sidebar:
  order: 4
---

Every operation has to be scheduled against something with capacity. Epicor gives you three ways to
say what that is, and choosing the right one decides how flexible the schedule can be.

## The three levels

| Level | What it is | Example |
|---|---|---|
| **Resource** | One machine, station, tool or person that can be scheduled on its own | *Mill 3* |
| **Resource group** | A set of related resources, usually a work centre. Every resource belongs to exactly one group | *Vertical mills* (Mill 1 to Mill 5) |
| **Capability** | A skill shared by resources that can sit in different groups | *Drill*: two drill presses, a mill and a lathe with live tooling |

Each operation's **Scheduling Resources** card says what it needs.

## How the engine chooses

| The operation names | The engine does this |
|---|---|
| A **resource group** | Looks at every resource in the group and takes the first one that can do the work at the time needed. Ties go to the order resources are listed in the group |
| A **resource** | Uses that resource and nothing else, even if another in the group is idle |
| A **capability** | Searches all resources linked to the capability, in any group, and takes the one that can start earliest. Ties are broken by **Resource Priority** (higher number wins) |

A resource with a **Resource Priority** of `99999999` on a capability is never picked by the engine but
stays available for employees to clock onto, which is handy for an overflow machine.

## Name only one of them

Epicor lets you fill in a resource group *and* a resource on the same operation. Don't. The engine
checks available time across the group and on the individual resource, and when the two disagree it can
fail to place the operation. Epicor's own troubleshooting guidance lists an operation with both a
resource group and a resource as a cause of global scheduling runs that loop on the same job, and
treats having more than one of capability, resource group and resource as an error to fix.

To find and fix them:

1. Look in the scheduling log for a job number that repeats.
2. In **Job Entry**, open that operation's **Scheduling Resources** and remove either the group or the
   resource. Reschedule the job.
3. Check the part's method in **Engineering Workbench** and fix it there too, or the next job will copy
   the problem.

A BAQ on `JobOpDtl` where both `ResourceGrpID` and `ResourceID` are filled (and the same on `PartOpDtl`)
finds every affected operation at once.

## Setup and production on different calendars

Setup is often done by a small team of setters working a normal week, while machines run production
around the clock. To schedule that:

1. In the resource group, create two resources: a *setup* resource on a setup calendar (for example 40
   hours a week) and a *production* resource on the machine's calendar.
2. On the operation, add two operation details (scheduling resource lines): one with only setup hours,
   pointing at the setup resource, and one with only a production standard, pointing at the production
   resource.
3. The engine schedules each detail only for the time it carries, so setup load falls on the setters'
   calendar and production load on the machine's.

Don't tick **Setup Complete** on these operations when setup is done. That clears setup time for all
scheduling blocks on the operation detail, which removes the setup load you're trying to model.

## Related pages

- [Scheduling blocks and split operations](/processes/scheduling/scheduling-blocks/)
- [Implementing scheduling](/processes/scheduling/implementing-scheduling/)

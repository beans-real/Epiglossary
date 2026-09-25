---
title: Scheduling overview
description: How Epicor's scheduling engine turns job operations into dated load on resources, the difference between finite, infinite and rough cut scheduling, and how global scheduling runs.
env: both
sources:
  - title: "EpiUsers: Job Entry rough cut scheduling"
    url: https://www.epiusers.help/t/job-entry-rough-cut-scheduling/35830/5
sidebar:
  order: 1
---

Scheduling answers one question for every job: given the work in its routing and the capacity of the
resources that do it, when does each operation start and finish? Epicor's scheduling engine works this
out by converting each operation into blocks of time and placing them on resource calendars.

## What the engine uses

| Input | Where it's defined |
|---|---|
| Operation times: setup, production standard, quantity | Job method (copied from the part method in Engineering Workbench) |
| Queue and move time | Resource group or resource |
| Which resource does the work | The operation's scheduling resources: a resource group, a resource or a capability |
| Available hours | Production calendars and shifts on the site, resource group and resource |
| Operation relationships and send-ahead | The job's operations (Finish-to-Start by default) |
| Dates | The job's **Required By** date (backward) or **Start** date (forward) |
| Priority | Job priority and the global scheduling order |

## Direction: backward or forward

- **Backward scheduling** starts from the **Required By** date and works back to find the latest start
  that still meets it. This is the "just in time" approach: material and labor are committed as late as
  possible, keeping WIP and inventory low.
- **Forward scheduling** starts from a start date (usually today) and works forward to find the earliest
  finish. Use it to answer "when can we have it?" or when a backward schedule would start in the past.

## Capacity: finite, infinite and rough cut

| Mode | Behavior | Good for |
|---|---|---|
| **Infinite** | Places load on resources without checking whether they're already busy | Seeing total demand on each resource; fast what-if dates |
| **Finite** | Only uses capacity that's free; later jobs move out to where capacity exists | A realistic, executable schedule for the near term |
| **Rough cut** | For jobs due beyond the site's **Rough Cut Horizon**, schedules infinitely using lead times and doesn't record any load against resources | Long-range planning without slowing the scheduling run |

Resource groups and resources have a **Finite Capacity** flag and a **Finite Horizon** (in days from
today). Only work inside the horizon is scheduled finitely; beyond it, the engine switches to infinite
capacity, so a job due next year doesn't compete for capacity today.

:::note[Rough cut in practice]
Rough cut only applies to jobs whose **Required By** date is beyond today plus the horizon (set on the
site's planning settings). Jobs inside the horizon get a normal schedule with full load. If you test
rough cut with jobs that are all due soon, you won't see it take effect.
:::

## Global scheduling

Scheduling one job at a time in **Job Entry** is fine for small changes, but it schedules jobs in the
order you touch them. Global scheduling reschedules everything in priority order:

1. **Calculate Global Scheduling Order** selects the candidate jobs, forward schedules each one
   infinitely, and assigns a priority sequence.
2. **Adjust Global Scheduling Order** (optional) lets planners move jobs up or down the sequence.
3. **Global Scheduling** places every selected job on the schedule in that order, on the live schedule
   or a what-if schedule.

Run steps 1 and 3 together in a **Process Set** so the order is always recalculated first. Jobs that
have been locked (for example on the **Job Scheduling Board**) keep their dates.

## Pages in this section

- [Implementing scheduling](/processes/scheduling/implementing-scheduling/): the setup checklist, the
  nightly process set and the screens planners use
- [Operation time: queue, setup, production and move](/processes/scheduling/operation-time/)
- [Resources, resource groups and capabilities](/processes/scheduling/resources-and-resource-groups/):
  how the engine chooses who does the work, and splitting setup from production
- [Operation relationships and send-ahead](/processes/scheduling/relationships-and-send-ahead/)
- [Scheduling blocks and split operations](/processes/scheduling/scheduling-blocks/)

## Related sections

- [The job lifecycle](/processes/jobs-manufacturing/job-lifecycle/): a job must be engineered before it
  can be scheduled

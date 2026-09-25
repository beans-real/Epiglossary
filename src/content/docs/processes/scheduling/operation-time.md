---
title: "Operation time: queue, setup, production and move"
description: How the scheduling engine adds up an operation's length, what queue and move hours really mean, and how to use a long queue time to reserve lead time for engineering or programming.
env: both
sidebar:
  order: 3
---

Each operation on a job takes up a span of the schedule. Only part of that span is work on a resource;
the rest is waiting and moving. Understanding the four components explains why an operation that takes
two hours of machine time can occupy most of a day on the schedule.

## The four components

```text
operation time = queue time + setup time + production time + move time
```

| Component | What it represents | Defined on | Loads the resource? |
|---|---|---|---|
| **Queue** | Time parts wait at the resource before work begins | Resource group or resource (**Queue Hours**) | No |
| **Setup** | Preparing the machine or station | The operation in the method | Yes |
| **Production** | Making the quantity, from the production standard | The operation in the method | Yes |
| **Move** | Time to get finished parts to the next operation (transport, cooling, curing) | Resource group or resource (**Move Hours**) | No |

Production time is the quantity divided by the production standard. For example, 100 pieces at 10 per
hour is 10 hours. Add a 30-minute setup, one hour of queue and 15 minutes of move, and the operation
spans 11 hours 45 minutes of schedule while loading the resource for only 10.5.

![Resource Group Maintenance showing the Queue Hours and Move Hours fields in the Scheduling group](/images/pasted-image-20250127141205.png)

## Queue and move in practice

- Queue sits in front of the operation, move sits after it. The schedule shows them as part of the
  operation's overall span, not as separate bars, so it isn't obvious from a Gantt view how much of an
  operation is padding.
- Because they don't consume capacity, queue and move are the right tool for time that passes without
  work: waiting for an inspector, paint drying, a trip to another building.
- Adding some queue or move time also builds slack into the schedule for the unexpected. Too much makes
  every lead time look longer than it is.
- By default, queue and move are counted in elapsed hours. Select **Use Calendar for Queue Time** or
  **Use Calendar for Move Time** on the resource group to count only working hours on its calendar.
  Only select these when the matching hours are greater than zero; the combination of calendar-based
  queue/move with zero hours is a known cause of scheduling loops.
- Queue and move apply to *every* operation that uses the resource group. If only some operations need
  the delay, create a separate resource group for them.

## Reserving lead time for planning work

Engineering, programming or tooling often has to happen weeks before production but takes few actual
hours. Modelling it as a normal operation schedules it just before machining starts, which is too late.

A simple fix is a planning resource group with a long queue time:

1. Create a resource group for the planning work (for example *Engineering*).
2. Set its **Queue Hours** to the lead time you need. For a 30-day lead time counted in elapsed hours,
   that's 720.
3. Put the planning operation first in the routing, assigned to that group.

Backward scheduling then reserves the lead time in front of production without loading the engineers'
calendar with 720 hours of work. For other ways to model this work, see
[Tooling, engineering and programming work](/processes/jobs-manufacturing/job-planning-operations/).

## Receive time

Parts also have a **Receive Time** (days), set in part planning. The scheduler subtracts it from the
job's required date before back-scheduling, to leave time for putting finished parts away or moving them
to the next job. The same idea works for purchased parts: receive time can cover inspection and
put-away after a PO arrives. See [Purchase orders](/processes/purchasing/purchase-orders/).

## Related pages

- [Operation relationships and send-ahead](/processes/scheduling/relationships-and-send-ahead/)
- [Scheduling blocks and split operations](/processes/scheduling/scheduling-blocks/)

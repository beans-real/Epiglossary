---
title: Implementing scheduling
description: A setup checklist for getting a trustworthy schedule out of Epicor, the processes to run every day, and the screens planners use to read and adjust the result.
env: both
sources:
  - title: "EpiUsers: Overview of how to schedule"
    url: https://www.epiusers.help/t/overview-of-how-to-schedule/60426/4
sidebar:
  order: 2
---

The scheduling engine is only as good as the data behind it. Most "scheduling doesn't work" complaints
come down to calendars, resources or routings that don't describe the real shop. This checklist covers
what has to be true before the schedule is worth trusting, roughly in the order to tackle it.

## 1. Company and site settings

- Decide on the default scheduling direction (backward from the required date, or forward from today).
- On the site's planning settings, set the **Finite Horizon**, **Rough Cut Horizon**, **Overload
  Horizon** and **Scheduling Send Ahead For** option.
- Set up **Scheduling Priority Codes** if you want job priorities to influence the global order.

## 2. Calendars and shifts

- Create **Production Calendars** for the company, each site and any resource group or resource that
  works different hours. Add holidays, planned shutdowns and overtime as calendar exceptions.
- Use **Shifts** for breaks rather than cutting gaps into a calendar day. A calendar day with a gap in the
  middle (for example four hours, a gap, then four hours) can make the engine loop.
- Give suppliers calendars too if subcontract lead times depend on their working days.

## 3. Resources

- Build **Resource Groups** that match real work centres, with a resource for each machine or person
  that can be scheduled separately.
- On each, set the calendar, **Finite Capacity**, queue and move hours and, if needed, **Split
  Operations**.
- Check the **Number of Resources** on each group matches the resources actually listed under it.
- See [Resources, resource groups and capabilities](/processes/scheduling/resources-and-resource-groups/).

## 4. Methods and routings

- Every operation needs realistic setup hours and a production standard, and exactly **one** scheduling
  resource: a resource group, a resource or a capability.
- Include subcontract operations with realistic days out.
- Clean up both the part methods and the open jobs. Open jobs carry their own copy of the method, so
  fixing Engineering Workbench alone doesn't fix what's already scheduled.
- Very large production hours on a single operation (over about 100 hours) are worth checking; they are
  a known cause of scheduling runs that hang.

## 5. Part planning data

Set part type, UOMs, manufacturing lot sizes, lead times, days of supply, **Receive Time**, minimum
on-hand, safety stock and the MRP flags. These drive the jobs and POs that MRP creates, and so the load
the scheduler sees.

## 6. Demand

Keep sales order, job and PO release dates current. The schedule can't be better than the dates it's
aiming at. If demand changes daily, the changes have to be entered daily.

## 7. Daily processes

Put these in a **Process Set** scheduled at least once a day, overnight if possible:

1. **Process MRP** (job and PO suggestions)
2. **Calculate Global Scheduling Order**
3. **Global Scheduling**
4. Any load-graph or cube refresh processes you use

A one-time cleanup run may be needed at go-live to clear arrears and rebuild load.

## 8. Shop floor reporting

The schedule updates from labor. Operators need to clock the right operation, report quantities and
downtime accurately, and tick **Complete** when an operation is done. Operations left open or reported
out of sequence keep load on resources that are actually free.

## Screens planners use

| Screen | Use it to |
|---|---|
| **Job Scheduling Board** | See and drag a job's operations; lock jobs so rescheduling leaves them alone |
| **Resource Scheduling Board** | See what's loaded on each resource and move operations between resources |
| **Resource Schedule Load Graph**, **Site Schedule Load Graph** | Compare load with capacity over time |
| **Overload Informer** | List resources that are over capacity within the overload horizon |
| **Work Queue** | Show operators what's next on their resource |
| **Shop Load**, **Priority Dispatch** reports | Printed load and dispatch lists |
| **Schedule Impact** report | See what a change would push out |
| **Projected Sales Order Shortages** | Find orders the current schedule will miss |
| **Master Production Schedule** | Plan finished-goods output |

## Related pages

- [Scheduling overview](/processes/scheduling/overview/)
- [Operation time: queue, setup, production and move](/processes/scheduling/operation-time/)

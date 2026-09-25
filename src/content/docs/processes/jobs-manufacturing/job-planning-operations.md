---
title: Tooling, engineering and programming work
description: Options for tracking pre-production work such as tooling, engineering and CNC programming, from simple operations with queue time to separate feeder jobs, projects and time-based parts.
env: both
sidebar:
  order: 4
---

Before a part can be made, someone often has to design a fixture, program a machine or review a
drawing. That work takes real hours and can gate the whole job, but it doesn't fit neatly into a routing
of machining operations. This page compares the ways to model it in Epicor, from simplest to most
granular.

## Option 1: an operation on the main job

Add a **Tooling**, **Engineering** or **Programming** operation at the start of the routing, assigned
to the resource group whose people do the work. Employees clock into it like any other operation.

- **Pros:** nothing new to set up; the cost lands on the job that needed it.
- **Cons:** the planning work usually happens weeks before production. If the operation is modelled as
  a few hours of production time, scheduling assumes it finishes just before the next operation. Also,
  operators can often clock into later operations before the planning operation is finished.

To make the schedule reflect the lead time, give the planning resource group a large **Queue Hours**
value (for example, 720 hours for a 30-day engineering lead time) and link the next operation with a
**Start-to-Start** relationship where overlap is allowed. Queue time pads the schedule without loading
the resource. See [Operation time](/processes/scheduling/operation-time/).

## Option 2: subassemblies on the main job

Put each planning activity in its own subassembly under the top assembly, with the planning operation
inside it. This keeps everything on one job but separates the costs and lets you track serial numbers
per subassembly. It still doesn't stop operators clocking into the main routing early.

## Option 3: separate feeder jobs that make "time"

Model the planning work as its own manufactured part whose output is hours, and feed it to the
production job as a material.

1. Create a part per activity, for example `PART-1001-PROG`. Set **Type** to **Manufactured** and give
   it a **UOM Class** of **Time** so its quantity is hours.
2. Give these parts their own **Part Class** and **Product Group** (for example class *Programming*,
   group *Job Planning*) so their costs report separately. A dedicated warehouse for planning parts
   keeps them out of normal stock reports.
3. Add the planning part as a material on the production job, related to the operation that can't start
   without it.
4. Create the feeder job for the planning part. On its operation, set the labor entry method so
   employees report their time as the completed quantity.
5. Link supply to demand, either:
   - **Make To Job**: the feeder job supplies one specific production job. The material on the
     production job must be flagged **Make Direct**. Costs follow precisely.
   - **Make To Stock**: time goes into a general pool and is issued to whichever job uses it. Simpler,
     but you lose the job-by-job link.
6. Let MRP create the feeder jobs from the demand, and handle only exceptions by hand.

<!-- TODO verify: the exact name of the operation setting that makes employees report time as quantity (the note calls it "Time and Quantity" entry). -->

### Grouped vs individual feeder jobs

| | One group job per month (per activity) | One feeder job per part |
|---|---|---|
| Structure | A generic planning part at assembly 0, with a subassembly per production job it supports | The part needing the work is the top assembly |
| Month-end | Easy: close one job per activity | Many small jobs to close |
| Demand visibility | Poor: demand links sit on assembly 0 only, so you can't see which subassembly served which job | Clear: each job's demand link says exactly what it's for |
| Reporting by assembly or operation | Hard, because subassembly sequences get shuffled | Straightforward |
| Part master | A few generic parts | One planning part per production part and activity, which can multiply the part count |

Pick the group job if month-end simplicity matters most, and individual jobs if you need true cost per
part.

## Option 4: link the work with a project

**Project Entry** ties quotes, sales orders and jobs together. You can create jobs purely for
engineering or programming under the same project as the production work, so their hours roll up to the
project and can be reported against the part as a whole. Jobs created from a project default to
**Auto Receive** on their last operation.

## A related case: test coupons

A test coupon is a piece of the raw material sent out to an outside processor (a subcontract
operation) to confirm its properties, for example hardness after heat treatment, before the rest of the
material is machined. Model it as an early subcontract operation, or a separate subcontract job, whose
completion gates the machining operations.

## Related pages

- [Operation time: queue, setup, production and move](/processes/scheduling/operation-time/)
- [The job lifecycle](/processes/jobs-manufacturing/job-lifecycle/)
- [Job costing and WIP](/processes/jobs-manufacturing/job-costing-and-wip/)

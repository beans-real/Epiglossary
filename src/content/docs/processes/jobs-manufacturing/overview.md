---
title: Jobs and manufacturing overview
description: How a manufacturing job fits between demand, inventory, scheduling and costing, and a map of the pages in this section.
env: both
sidebar:
  order: 1
---

A job is where Epicor turns demand into product. It pulls a method of manufacture from engineering,
draws material from stock or purchasing, collects labor from the shop floor, and hands finished parts to
inventory or shipping. Along the way it accumulates cost, which finance later moves out of WIP.

## The flow at a glance

1. **Demand** arrives: a sales order release, a stock shortfall, another job's material or a forecast.
2. **Planning** turns it into a job, either by hand in **Job Entry**, through the **Planning
   Workbench**, or as an MRP suggestion that a planner firms.
3. **Engineering** confirms the method (materials and operations) and marks the job **Engineered**.
4. **Scheduling** gives it start and due dates against resource capacity. See
   [Scheduling](/processes/scheduling/overview/).
5. **Release** sends it to the floor. Material is issued or backflushed, and employees report labor.
6. **Output** goes to stock, to another job or to a customer.
7. **Completion and closing** stop further activity, and **Capture COS/WIP Activity** moves the costs to
   the GL.

| Who | Main screens | Records created |
|---|---|---|
| Planner | Job Entry, Planning Workbench, Job Manager | `JobHead`, `JobAsmbl`, `JobMtl`, `JobOper` |
| Engineer | Engineering Workbench, Mass Part Replace/Delete | `ECORev`, `ECOMtl`, `PartMtl`, `PartOpr` |
| Floor | Start/End Activity (MES), Issue Material, Report Quantity | `LaborHed`, `LaborDtl`, `PartTran` |
| Cost accountant | Work in Process report, Capture COS/WIP Activity | `TranGLC`, GL journals |

## Pages in this section

- [The job lifecycle](/processes/jobs-manufacturing/job-lifecycle/): where jobs come from, demand links,
  status flags, stocked vs make-direct materials, and a release-readiness check
- [How inventory flows through jobs](/processes/jobs-manufacturing/inventory-flow-through-jobs/):
  issuing and backflushing material, Auto Receive and Auto Move, chaining jobs through stock
- [Tooling, engineering and programming work](/processes/jobs-manufacturing/job-planning-operations/):
  modelling pre-production work as operations, subassemblies, feeder jobs or projects
- [Methods, revisions and mass changes](/processes/jobs-manufacturing/methods-and-revisions/): customer
  drawing revisions, Mass Part Replace/Delete, and a BOM Cost report failure
- [Job costing and WIP](/processes/jobs-manufacturing/job-costing-and-wip/): how the WIP report splits
  costs, Capture COS/WIP, and resource group efficiency
- [Deleting jobs, audit logs and locked labor](/processes/jobs-manufacturing/job-entry-housekeeping/)

## Related sections

- [Inventory transaction types](/reference/transaction-types/) for the `PartTran` codes jobs create
- [Inventory](/processes/inventory/overview/) for reconciliation and on-hand problems
- [Quality and RMA](/processes/quality-rma/overview/) for nonconforming parts found during production

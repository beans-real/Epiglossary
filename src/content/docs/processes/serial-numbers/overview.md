---
title: Serial numbers overview
description: Why businesses serialize parts, how a serial number travels from creation to shipment in Epicor, the screens and tables involved, and where to start when setting it up or fixing it.
env: both
sidebar:
  order: 1
---

Serial numbers give each physical unit its own identity. Where a lot number says "these fifty came from
the same batch", a serial number says "this one, and only this one". Businesses serialize when they
need to answer questions about a single unit: which components went into it, who it was sold to, when
its warranty started, and which units are affected by a recall.

Epicor can track serial numbers through purchasing, manufacturing, inventory and shipping. It works
well, but it's strict: once a part is serial tracked, every transaction that moves it needs serial
numbers, and mistakes are fiddly to undo. Most of the pain comes from not understanding the order
things must happen in, so this section starts with the process.

## The life of a serial number

A typical made-to-order serialized product goes through these stages:

1. **Created.** Serial numbers are generated or entered when the unit first appears: at purchase
   receipt for bought-in parts, or on the job for manufactured ones (in **Serial Number Assignment**,
   or at the operation that requires serials).
2. **In production (WIP).** The parent serials belong to the job. Serialized components issued to the
   job are recorded against it too.
3. **Matched.** Component serials are linked to the parent serial they were built into, so you can
   later see exactly what is inside each unit.
4. **Received to stock.** The finished unit is received from the job, carrying its serial into
   inventory.
5. **Picked, packed and shipped.** The shipment records which serials went to which customer.
6. **After the sale.** Returns (RMA), service and warranty work look the serial up again.

Each stage sets a **status** on the serial number (WIP, Inventory, Consumed, Shipped and so on), and
Epicor only allows the next transaction if the status is right. See
[How serial tracking works](/processes/serial-numbers/serial-number-logic/).

## Who does what

| Role | Serial number work |
|---|---|
| Receiving | Enters or generates serials for purchased serialized parts |
| Production / planners | Assigns serials to jobs, reports labor at serial-required operations |
| Production / quality | Matches component serials to parent serials |
| Shipping | Selects serials on customer shipments |
| Engineering / system admin | Sets up tracking options, masks and part settings |
| Service / quality | Traces serials for RMAs, warranty and recalls |

## Where it lives in Epicor

**Screens:** **Site Configuration** (tracking options), **Company Configuration** (mask characters),
**Serial Mask Maintenance**, **Part Maintenance** (the **Track Serial Numbers** setting and serial
format), **Serial Number Assignment**, **Serial Matching**, **Serial Number Maintenance** and the
**Serial Number Tracker**.

**Tables:** `SerialNo` holds each serial number's current status and location. `SNTran` holds the
transaction history for serial numbers, one row per movement, which makes it the first place to look
when you need to know *what happened* to a serial.

## Pages in this section

- [How serial tracking works](/processes/serial-numbers/serial-number-logic/): tracking options,
  statuses, where serials are created, and the rules behind them
- [Serial number masks and prefixes](/processes/serial-numbers/masks-and-prefixes/): formatting
  serials, per-site prefixes, CAGE codes and fixing prefixes in bulk
- [Serial matching and shipping](/processes/serial-numbers/matching-and-shipping/): linking components
  to parents, and the errors that stop matching or shipping
- [Setting serial numbers in code](/processes/serial-numbers/setting-serials-in-code/): a BPM that
  adds a date code to newly assigned serials
- [Troubleshooting serial numbers](/processes/serial-numbers/troubleshooting/)

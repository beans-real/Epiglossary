---
title: DMT overview
description: What the Data Management Tool does, how its templates and add, update and delete loads work, and the habits that make bulk loads safe to run and easy to undo.
env: both
sidebar:
  order: 1
---

The **Data Management Tool (DMT)** is Epicor's utility for loading data in bulk. You fill in a
spreadsheet or CSV laid out to match a DMT *template*, and DMT pushes each row through the same
business objects the screens use. It's the standard way to migrate data into Epicor, and just as useful
afterwards for mass changes: re-pointing hundreds of materials, fixing a field on every part in a
class, or loading a new price list.

## How it works

- **Templates.** Each kind of record has a template: **Part**, **Part Plant**, **Part Revision**,
  **Bill of Operations**, **Bill of Materials**, customers, suppliers, and many more. A template lists
  the columns DMT understands, marks the required ones, and gives the order parent and child records
  must be loaded in.
- **Column headers are field names.** Your file's first row must use the template's field names.
  Include the key columns for every row and only the other columns you want to set.
- **Add, update or delete.** When you run a load you choose whether to add new records, update
  existing ones, or delete. The same file can be used to update or to add, depending on what you tick.
- **Business logic applies.** Because DMT calls business objects, Epicor's validation runs, defaults
  are filled in, and **your BPMs fire**. That's usually what you want, since the data ends up as if
  entered by hand, but it also means a directive that sends email sends one per row.
- **Results.** DMT reports each row's success or error, and can write the failed rows to a file you
  fix and reload.

:::caution[Test in Pilot first]
Run every new load against a test environment before Production. A bad update of a thousand records is
fast to make and slow to put right.
:::

## Habits that save you

1. **Export before you change.** Pull the current values (with a BAQ or a DMT export) into a file
   before an update or delete. That file is your rollback.
2. **Write down the reverse loads.** For anything multi-step, list the loads that undo it, in order,
   before you start. See [Resequence operations](/platform/dmt/resequence-operations/) for an example.
3. **Load parents before children.** A child row can't find a parent that doesn't exist yet. See
   [Methods of manufacture](/platform/dmt/methods-of-manufacture/) for the classic chain.
4. **Load a handful of rows first.** Run five rows, check them on screen, then run the rest.
5. **Keep the data clean in Excel.** Leading spaces, leading zeros and line breaks all have traps; see
   [Excel and data gotchas](/platform/dmt/excel-gotchas/).
6. **Pause noisy directives.** Disable email or auto-print directives for the length of a mass load, or
   add a condition that skips them for the loading user, and remember to turn them back on.

## Automating DMT

DMT can also run from the command line without its window, which makes it scriptable. PowerShell
scripts that run a sequence of DMT loads, check the results and stop on errors are a powerful way to
repeat a migration or a regular data feed exactly the same way each time.

## Pages in this section

- [Methods of manufacture](/platform/dmt/methods-of-manufacture/): load parts, revisions, operations
  and materials in the right order
- [Resequence operations](/platform/dmt/resequence-operations/): move materials to a new operation and
  remove the old one, with a rollback plan
- [Excel and data gotchas](/platform/dmt/excel-gotchas/): leading spaces, lost line breaks and other
  spreadsheet traps
- [Troubleshooting DMT loads](/platform/dmt/troubleshooting/)

DMT is also the usual fix for serial number prefixes carried over from old part settings; see
[Serial number masks and prefixes](/processes/serial-numbers/masks-and-prefixes/).

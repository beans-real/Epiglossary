---
title: UD fields and data model regeneration
description: Add a user-defined column to an Epicor table with UD Column Maintenance, then regenerate the data model on-premises or in Epicor Cloud so the field can be used.
env: both
sidebar:
  order: 5
---

When a standard table has no field for something you need to store, you add a **user-defined (UD)
column**. Epicor keeps UD columns in a companion table (for example `OrderHed_UD` next to `OrderHed`),
but the data model merges the two, so in BAQs, BPMs, screens and REST the new field looks like part of
the base table.

A new column doesn't exist for the application until the **data model is regenerated**. That second
step is the one people forget.

## Add the column

1. Open **UD Column Maintenance**.
2. Select the table you want to extend.
3. Add a new column (**Column > Detail**) and enter its name and description.
4. Choose the data type, size or format, and any other attributes the column needs.
5. Save.

:::caution[Don't type the suffix]
Epicor appends `_c` to every UD column name automatically. Name your column `CertRequired` and it
becomes `CertRequired_c`. If you type `CertRequired_c` yourself you get `CertRequired_c_c`, and you'll
be stuck with that name everywhere it's used.
:::

A few habits that save pain later:

- Use a short, descriptive name without spaces. You'll type it in BAQs and code for years.
- Pick the type carefully. Changing a column's data type after it holds data is not straightforward.
- Keep a list of the UD columns you add and why. Nothing in Solution Workbench tells you which UD
  columns a solution depends on (see [Solution Workbench](/platform/system-admin/solution-workbench/)).

## Regenerate the data model

### Epicor Cloud

Run **Data Model Regen** from the **Database** tab of the tenant instance in the
[Cloud Management Portal](/kinetic/administration/cloud-management-portal/). You don't need to stop
anything first: the pipeline stops the instance, regenerates the model and starts the instance again.
Follow progress in **Deployment Status Detail**. Users are disconnected while it runs, so do it out of
hours.

If you don't have portal access, ask Epicor Support to run the regeneration for you through an EpicCare
case.

### On-premises

Plan a short outage, then:

1. **Stop the task agent** for the environment, so no scheduled process is running against the old
   model (see [Restart the task agent](/platform/system-admin/scheduled-tasks/#restart-the-task-agent)).
2. **Regenerate the data model.** In the **Epicor Administration Console**, expand **Database Server
   Management**, select the database, and choose **Regenerate Data Model**. Check the server and database
   names, then **Generate**.
3. **Recycle the application pool** for the application server, in IIS Manager or with the console's
   **Recycle IIS Application Pool** action. This step is mandatory: the application server only picks
   up the new model when it restarts.
4. **Start the task agent** again.

If generation fails because the data model file is in use, recycle the application pool and try again.
If it reports that some tables didn't synchronize, the error message tells you where the log file is.

## After the regeneration

- Users must log out and back in to see the new field.
- Add the field to screens with an Application Studio layer (Kinetic) or a customization (Classic), and
  to BAQs like any other column.
- BPM directives and functions that use the new field can't run until the data model has been
  regenerated, so regenerate before you build logic around it.

## Related pages

- [User codes](/platform/system-admin/user-codes/), for a list of values rather than a new field
- [Default and lock field values](/platform/bpm/default-field-values/)

---
title: Report styles for BarTender
description: Set up a Bartender Labels report style so Epicor writes .bt files to the folder BarTender watches and names a template BarTender can open.
env: both
sidebar:
  order: 3
---

On the Epicor side, a BarTender label is just a report style. Instead of rendering through SSRS, a
style with the report type **Bartender Labels** writes the report data to a `.bt` file and leaves the
printing to BarTender. This page covers the two paths a style needs and how the printer is chosen.

## Steps

1. Open **Report Style Maintenance** (**System Management > Reporting > Report Style**).
2. Find the label report, for example `GenShip`. It already has an out-of-the-box BarTender style you
   can review.
3. Copy that style (or add a new one) so your changes survive upgrades, and give it a clear
   description, such as "Carton label (BarTender)".
4. Confirm **Report Type** is **Bartender Labels** and the **Data Definition** is the one for this
   report (`GenShip` here, or your own copy).
5. Set **Report Location** to the `.btw` template, written as a path the *BarTender server* can open.
   Epicor passes this value through into the file's `%BTW%` header, and BarTender opens whatever it
   says.
6. Set **Output Location** to the folder the BarTender integration scans. Leave it blank on an
   on-premises server to use the default, a `Bartender\<CompanyID>` folder under the server's
   EpicorData folder. On cloud environments running on Linux, use the mounted path described in
   [cloud and Linux](/platform/bartender/cloud-and-linux/).
7. Save, then print one label from the report's own screen and check that a `.bt` file appears in the
   output folder.

## Keep the folders separate

Use three distinct locations, and don't nest one inside another:

| Folder | Written by | Read by |
|---|---|---|
| Templates (`.btw`) | Label designers | BarTender, at print time |
| Output (`.bt`, the folder to scan) | Epicor | The BarTender integration |
| Processed / archive | The BarTender integration | People, when checking history |

Mixing them causes confusing symptoms: processed files being printed a second time, files from one
environment printed by another environment's integration, or a cleanup script deleting templates.

## How the printer is chosen

Epicor doesn't send anything to the printer. When a label report runs, the printer you pick (in the
print dialog or in an Auto Print widget) is written into the `.bt` header, and BarTender prints to the
printer of that name. That has two consequences:

- The printer must exist on the **BarTender server** with exactly the same name.
- If the file is written to a folder that no integration watches, nothing prints and Epicor reports
  no error. The report task still shows as completed.

When the **Use Default Printer** option is used, Epicor first tries the workstation's default label
printer and then falls back to the default label printer set for the company.

## Adding fields to a label

The fields available on the label are the columns in the report's data definition. If you need one
that isn't there, copy the report data definition, add the table or field to the copy, and point your
report style at the copy. The new column then appears in the `.bt` file for the template to use.

## Related

- [Label templates and data fields](/platform/bartender/label-templates/)
- [Auto-print labels from a BPM](/platform/bartender/auto-print/)
- [Integration Builder setup](/platform/bartender/integration-setup/)

---
title: Mass updates with Uptake from Excel
description: Use a classic updatable dashboard's Uptake from Excel action as a small, controlled mass-update tool, including a quick way to flag just the rows you want to change.
env: classic
sidebar:
  order: 4
---

An updatable dashboard grid can take rows back from an Excel file with **Actions > Uptake from Excel**. It adds new rows or updates existing ones through the dashboard's updatable BAQ, so the BAQ's business logic and any BPMs still run. For a few hundred rows of one kind of change, that's often quicker and safer than setting up a DMT load.

## Before you start

- The grid must come from an **updatable BAQ**, with the columns you want to change marked updatable.
- The number of **visible** columns in the grid must match the number of **updatable** columns, in the same order as your spreadsheet. Hide anything else before you start.
- Excel files must be saved as `.xlsx`.

## Steps

1. Refresh the dashboard grid so it shows the rows you want to change.
2. Right-click the grid and copy the rows **with labels** (**Copy Selection Include Labels**, or copy all), then paste into a new Excel sheet.
3. Change the values you want to update. Leave the key columns alone.
4. Delete every row you are **not** changing (see the tip below for a quick way), and save as `.xlsx`.
5. Back in the dashboard, click into the grid, then choose **Actions > Uptake from Excel**.
6. Browse to the file, tick **Skip Header Row**, and click **OK**. The grid fills with your rows, marked as changed.
7. Review the grid, then **Save**. In the **Multi Threaded Save** window you can choose a batch size and up to 10 threads; click **Start** and wait for it to finish.

## Tip: flag the rows from a list

Often you're given a list of IDs (jobs, parts, orders) and need to change only those rows out of a big export. Put the list in its own column and let Excel flag the matches:

1. Insert two empty columns at the left of the export: **A** and **B**.
2. Paste your list of IDs into column **A**.
3. Suppose the export's ID column is now **C**. In **B2**, enter:

   ```text
   =COUNTIF($A:$A, $C2) > 0
   ```

4. Fill the formula down. Rows whose ID appears anywhere in your list show `TRUE`.
5. Filter column B to `TRUE`, copy the visible rows (and header) to a new workbook, delete columns A and B, make your changes and save that file for the uptake.

:::caution
Uptake from Excel writes straight to live data. Try it with two or three rows first, and keep the original export so you can put values back if something goes wrong. For large or regular loads, use DMT instead.
:::

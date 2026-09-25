---
title: Troubleshooting DMT loads
description: Causes and fixes for common DMT problems, including menu loads with a blank company, rows that fail because parents are missing, and values changed on the way in.
env: both
sidebar:
  order: 5
---

When a DMT load misbehaves, start with DMT's own results: the error text for each failed row usually
names the missing record or invalid field. The problems below are the ones where the message doesn't
make the cause obvious.

## Menu load: Company must be blank but present

**Symptom:** a DMT load that updates menus (the `Ice.Menu` table) fails to find the menus, or behaves
differently for some menus than others.

**Cause:** most menu records are system-wide. Their **Company** value is blank unless the menu has
been copied into a specific company. DMT looks records up by their key, so a load that fills in your
company ID won't match a system-wide menu.

**Fix:** include the **Company** column in the file even though the template doesn't mark it as
required, and leave it **empty** for system-wide menus. Only fill it for menus that really belong to a
company.

<!-- TODO: source note said MenuID must be present even if empty; confirm it meant the Company column -->

## Child rows fail because a parent is missing

**Symptom:** operation or material rows fail with messages about an invalid part, revision or
operation.

**Cause:** the load order was wrong, or an earlier load partly failed and nobody noticed.

**Fix:** load parents first (Part, Part Plant, Part Revision, then operations, then materials) and
reload the failed rows once their parents exist. See
[Load methods of manufacture with DMT](/platform/dmt/methods-of-manufacture/).

## An update can't find records that are clearly there

**Symptom:** rows fail as "not found" (or an add creates duplicates) for keys you can see on screen.

**Cause:** the key in the file differs from the one in the database, most often a leading space that
Excel or DMT dropped, or leading zeros Excel removed.

**Fix:** check the first character code and cell formats as described in
[Excel and data gotchas](/platform/dmt/excel-gotchas/).

## Text comes in with odd characters or on one line

**Cause:** the file was exported from Epicor to Excel, which replaced line breaks with the record
separator character.

**Fix:** substitute `CHAR(30)` with `CHAR(10)` before loading. See
[Excel and data gotchas](/platform/dmt/excel-gotchas/#line-breaks-come-back-as-a-strange-character).

## Deleting an operation fails or leaves materials unlinked

**Cause:** materials still relate to the operation being deleted.

**Fix:** re-point the materials first, then delete the operation. See
[Resequence operations with DMT](/platform/dmt/resequence-operations/).

## A load triggers emails, prints or other side effects

**Cause:** DMT runs through the business objects, so method and data directives fire for every row.

**Fix:** for large loads, disable the noisy directives for the duration, or add a condition that skips
them for the user running the load. Remember to re-enable them. See
[Common BPM problems](/platform/bpm/troubleshooting/) if a directive behaves unexpectedly during a
load.

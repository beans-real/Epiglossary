---
title: Load methods of manufacture with DMT
description: Build part methods from scratch with DMT by loading Part, Part Plant, Part Revision, Bill of Operations and Bill of Materials in the right order, and plan for subassemblies.
env: both
sidebar:
  order: 2
---

Loading methods of manufacture is one of the most common DMT jobs, and one of the easiest to get
tangled in. A method depends on a chain of records, and each DMT template expects the records above it
to exist already. Load them in order and it's routine; load them out of order and every row fails.

## Load order

| Step | Template | Creates | Needs |
|---|---|---|---|
| 1 | **Part** | The part master | Part classes, product groups, UOMs set up |
| 2 | **Part Plant** | Site-level settings for the part | The part, the site |
| 3 | **Part Revision** | The revision the method hangs on | The part |
| 4 | **Bill of Operations** | Operations on the revision | The revision, operation codes, resource groups |
| 5 | **Bill of Materials** | Materials on the revision | The revision, the material parts, and the operation each material relates to |

Operations come before materials because each material row names its **related operation**, the
operation sequence it is issued to. If that operation isn't there yet, the material row fails.

## Steps

1. Load **Part** for every part involved: the top-level parts *and* every purchased or manufactured
   part used as a material.
2. Load **Part Plant** for each part and site that needs site-specific settings.
3. Load **Part Revision** for the manufactured parts, leaving the revisions unapproved while you load
   methods.
4. Load **Bill of Operations**. Number operation sequences with gaps (10, 20, 30…) so you can insert
   operations later without resequencing.
5. Load **Bill of Materials**, giving each material the operation sequence it relates to.
6. Review a few methods on screen (in the Engineering Workbench or Part Maintenance), then approve the
   revisions, either by hand or with an update load of **Part Revision**.

## Subassemblies

A single-level method is straightforward. Multi-level methods, where a material is itself a
manufactured part with its own method, need more planning:

- Load bottom-up. A subassembly's own part, revision and method should exist before the parent that
  uses it.
- Decide per subassembly whether it's a separate part pulled in as a material, or an assembly built
  inside the parent's method. The two load differently, and mixing them up is the usual reason
  multi-level loads "go screwy".
- Run the first parent end to end in Pilot and inspect the whole tree before loading the rest.

## Notes

- Keep one workbook with a tab per template. The keys (part, revision, operation and material
  sequences) must agree across tabs, and seeing them side by side catches mistakes.
- For repeat work, script the five loads in order (see
  [Automating DMT](/platform/dmt/overview/#automating-dmt)).
- To change an existing method rather than build one, update only the columns you need. To move
  materials between operations, see [Resequence operations](/platform/dmt/resequence-operations/).

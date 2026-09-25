---
title: Resequence operations with DMT
description: Move materials from one operation to another with DMT and delete the old operation safely, with the loads to run in reverse if you need to undo it.
env: both
sidebar:
  order: 3
---

Sometimes an operation has to go: it's being merged into another, or replaced by a new one at a
different sequence. Materials point at operations through their **related operation**, so you can't
simply delete the old operation. First re-point everything that uses it, then remove it.

This page walks through that as a pair of DMT loads, plus the pair that undoes it.

## Before you start

- **The new operation must already exist** on the method. If it doesn't, add it first with a
  **Bill of Operations** load (add mode).
- **Save the current state.** Export two files and keep them untouched:
  1. The original operation row(s) you plan to delete, in **Bill of Operations** template layout.
  2. The material rows that relate to that operation, in **Bill of Materials** layout, with their
     current related operation.

  These are your rollback files.

## Steps

1. **Re-point the materials.** Take the saved materials file, change the related operation column
   from the old sequence to the new one, and run it as a **Bill of Materials** update.
2. **Check the method.** Open a couple of the affected methods and confirm no materials still relate
   to the old operation.
3. **Delete the old operation.** Run the saved operations file as a **Bill of Operations** delete.

Materials first, then the operation, never the other way round.

A minimal materials update file needs the keys that identify each material row and the column being
changed:

```text
Company,PartNum,RevisionNum,MtlSeq,RelatedOperation
EPIC06,PART-1001,A,10,30
EPIC06,PART-1001,A,20,30
```

## Rolling back

If something goes wrong, run the reverse loads, in this order:

1. **Add the original operation back** with the saved operations file as a **Bill of Operations**
   add.
2. **Point the materials back** by running the *original* saved materials file (still holding the
   old sequence) as a **Bill of Materials** update.

The order mirrors the forward change: the operation must exist again before materials can relate to
it.

## Notes

- Other records can hang off an operation too, such as operation details and resources. Deleting the
  operation removes those with it, so export them as well if you might need them back.
- The same approach works for job methods using the job templates: re-point the job materials, then
  remove the job operation.
- Do the whole change in Pilot first and time it; the rollback is only useful if you know it works.

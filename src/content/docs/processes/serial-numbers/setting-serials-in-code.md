---
title: Setting serial numbers in code
description: A pre-processing BPM on Serial Number Assignment that adds a date code, taken from the job, to every new serial number before it is saved.
env: both
sidebar:
  order: 5
---

Masks cover most serial formats, but not all. A mask's date characters use the date the serial is
*generated*. If the business wants the serial to carry a date from the job or the order, such as the
month the unit is due, or some other value from the data, a BPM can adjust each new serial as it is
assigned.

Try a mask first (see [Serial number masks and prefixes](/processes/serial-numbers/masks-and-prefixes/)).
Reach for code only when the value can't come from the mask.

## What it does

When a user assigns serial numbers to a job in **Serial Number Assignment**, the directive appends a
two-character code to each new serial: a letter for the month (A = January … L = December) and the
last digit of the year, both taken from the job's required due date. A serial generated as `SN000451`
for a job due in March 2026 is saved as `SN000451C6`.

## Where it runs

**Method directive**, **Pre-Processing**, on `Erp.BO.SerialNoAssign.SetSerialNoAssign`.

Pre-processing lets you change the serial numbers in the incoming tableset before Epicor validates and
saves them. The tableset carries:

- `SerialNoAssign`: the header, including `JobNumber`.
- `SelectedSerialNumbers`: the serials being assigned. New ones have `RowMod` of `"A"`.

## Example

```csharp
var newSerials = ds.SelectedSerialNumbers
    .Where(r => r.RowMod == "A")
    .ToList();

if (!newSerials.Any())
    return;

string jobNum = ds.SerialNoAssign.Select(r => r.JobNumber).FirstOrDefault();
if (string.IsNullOrEmpty(jobNum))
    return;

DateTime? dueDate = Db.JobHead
    .Where(j => j.Company == Session.CompanyID && j.JobNum == jobNum)
    .Select(j => j.ReqDueDate)
    .FirstOrDefault();

if (dueDate == null)
    return;

char monthCode = (char)('A' + dueDate.Value.Month - 1);
int yearDigit = dueDate.Value.Year % 10;
string suffix = $"{monthCode}{yearDigit}";

foreach (var sn in newSerials)
{
    sn.SerialNumber = sn.SerialNumber + suffix;
    sn.RawSerialNum = sn.SerialNumber;
}
```

## How it works

- Only rows with `RowMod == "A"` are changed, so serials that were already assigned aren't touched when
  the user saves again. See [The BPM tableset: ds, tt and RowMod](/platform/bpm/dataset-and-rowmod/).
- The job is read with a single-value LINQ query. If the job or its due date is missing, the directive
  exits and the serials are saved as generated rather than failing the save.
- `SerialNumber` and `RawSerialNum` are both set, and to the same final value. Build the new number
  once and copy it, rather than appending the suffix to each field separately, or one of them ends up
  with the suffix twice.
  <!-- TODO verify: how Epicor uses RawSerialNum versus SerialNumber when a mask with strip characters is in use -->

## Variations

- **Date from the sales order.** For make-to-order jobs, follow the job's demand link (`JobProd`) to
  the order line and use its request date instead.
- **Fixed codes.** Prepend a site code or a CAGE code stored in a UD field on company or site
  configuration.
- **Values from UD fields.** Append a model year or configuration code held in a UD field on the
  order line or part.

## Things to watch

- **Validation masks.** If the part also has a validation mask, the changed number must still pass it.
- **Uniqueness.** Appending the same suffix to already unique sequence numbers keeps them unique.
  Replacing part of the number doesn't, so test that case before going live.
- **Other entry points.** Serials created elsewhere (at receipt, or at labor on a serial-required
  operation) don't go through this method. Trace each screen your process uses (see
  [Find the method a screen calls](/platform/bpm/finding-the-right-method/)) and decide whether they
  need the same rule.
- **Keep it in one place.** If several directives need the same format, put the logic in an Epicor
  Function and call it from each one.

## Related

- [Query the database with LINQ](/platform/bpm/linq-queries/)
- [Serial number masks and prefixes](/processes/serial-numbers/masks-and-prefixes/)

---
title: Auto-print labels from a BPM
description: Print BarTender labels automatically when a shipment or other record reaches a status, and stage extra label values in a UD table when the report data doesn't have them.
env: both
sidebar:
  order: 5
---

Users forget to print labels, or print them twice. The **Auto Print** widget in a BPM prints a label at
the moment something happens, such as a pack being closed, without anyone opening the report screen.
BarTender labels work with the same widget as SSRS reports; only the report type differs.

For the widget itself and how its parameters work, see
[Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/). This page covers the
label-specific parts.

## Example: shipping labels when a pack is closed

1. Create a **Standard** data directive on the `ShipHead` table. Standard means the label is only
   produced once the save has been committed.
2. Add a **Condition**: the `ShipStatus` field of the changed row *has been changed from any to*
   the closed status (`CLOSED` in the source setup). Testing for the change, not the state, stops a
   reprint every time someone edits the closed pack.
   <!-- TODO verify: the ShipHead.ShipStatus value set when a pack is closed or shipped in current releases -->
3. On True, add **Auto Print** and choose the report:
   - **Report:** `GenShip` (Generic Shipping), with **Report Type** set to **Bartender Labels**.
   - **Style:** your BarTender style for this label.
4. Set the report options:
   - **Run Schedule:** **Immediate**, or **Queued** if you'd rather the task agent pick it up in turn.
   - **Print Action:** **Auto Print**.
   - **Printer:** a server printer whose name matches a printer on the BarTender server, or **Use
     Default Printer**.
   - **Print Quantity:** a constant, usually `1`. Label quantities are normally driven by the data or
     the template.
5. On **Report Parameters**, set `PackNum` to the table field `ShipHead.PackNum` from the directive's
   row. Leave the other parameters at their defaults.
6. Enable the directive and close a test pack. A `.bt` file should appear in the style's output folder
   within a few seconds.

<!-- TODO screenshot: Auto Print widget report options for a Bartender Labels style, with a placeholder printer name -->

:::caution[Pilot and test environments]
A copied database brings its directives with it. If a test environment writes to the same output
folder as production, closing a test pack prints a real label in the warehouse. Give each environment
its own output folder, and only watch the production one from the production integration.
:::

## Staging values the report doesn't have

Sometimes a label needs values that exist only at print time: the quantity per carton, or how many
labels to print, typed by the user when they print. One way to get them onto the label is to stage
them in a UD table, keyed so the report data can join to them.

The shape of the pattern:

1. Collect the values, for example in a BPM data form, and hold them in `callContextBpmData` (see
   [Pass data from pre- to post-processing](/platform/bpm/passing-data-pre-to-post/)).
2. In a directive that runs when the label report is submitted, write one row per print request to a
   UD table such as `UD05`, keyed by the pack number.
3. Add the UD table to a copy of the report data definition, joined on that key, so its columns appear
   in the `.bt` file.
   <!-- TODO verify: joining a UD table into a copied GenShip data definition for a Bartender Labels style -->
4. Clean up old staging rows on a schedule.

The staging write, in a pre-processing directive on the packing slip report's submit method (its
tableset carries the `PackingSlipParam` row), so the row exists before the report task starts:

<!-- TODO verify: the exact report service method (for example SubmitToAgent) the packing slip print calls in your release -->

```csharp
int packNum = ds.PackingSlipParam[0].PackNum;

var stage = new Ice.Tables.UD05
{
    Company = Session.CompanyID,
    Key1 = packNum.ToString(),
    Key2 = Guid.NewGuid().ToString(),  // one row per print request
    Key3 = "",
    Key4 = "",
    Key5 = "",
    Date01 = DateTime.Now              // lets the cleanup find old rows
};

// XX_ columns added to UD05 in Extended UD Table Maintenance
stage.XX_QtyPerCarton_c = callContextBpmData.Number01;
stage.XX_LabelCount_c = Convert.ToInt32(callContextBpmData.Number02);

Db.UD05.Insert(stage);
Db.Validate();
```

And a cleanup, as an Epicor Function run on a schedule. It deletes only rows older than an hour, so it
never removes a row for a label that is still in the queue:

```csharp
var cutoff = DateTime.Now.AddHours(-1);

var oldRows = Db.UD05
    .Where(r => r.Company == Session.CompanyID && r.Date01 < cutoff)
    .ToList();

foreach (var row in oldRows)
{
    Db.UD05.Delete(row);
}

Db.Validate();
```

The function library needs `UD05` added as a table reference with write access for this to compile.

:::tip[Why not clear the whole table?]
A cleanup that deletes everything every few minutes is tempting, but it can remove a row between the
directive writing it and the report task reading it, and the label then prints without its values.
Delete by age instead. A single test on `Date01` is enough.
:::

### How it works

- Every row has a unique key (`Key2` is a GUID), so two people printing the same pack at once don't
  collide or overwrite each other.
- `Db.Validate()` writes the inserted or deleted rows to the database there and then, rather than
  leaving them to whatever save happens next.
- If the table is shared with other uses, put a fixed value in a spare key (for example
  `Key3 = "LABEL"`) and filter the cleanup on it too.

## Related

- [Report styles for BarTender](/platform/bartender/report-styles/)
- [Update other records from a BPM](/platform/bpm/updating-other-records/)
- [BPM conditions](/platform/bpm/conditions/)

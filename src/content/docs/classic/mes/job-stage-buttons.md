---
title: Customizing Report Quantity
description: Turn the classic MES Report Quantity form into a one-click, job-driven screen by reporting quantity from code, enabling only the next step from BAQ status, looping over operations, and optionally closing the job.
env: classic
sidebar:
  order: 4
---

Out of the box, **Report Quantity** asks the operator for a job, assembly, operation and quantity every time. In a shop with a fixed routing, that's a lot of typing for "this unit just finished welding". A customization can turn it into a job-driven screen: scan or type the job, see where it is, press the button for the step that's just been done.

This page builds that up from the pieces. The same pieces work on other MES forms.

## The shape of the screen

- A **job** text box at the top. When it's validated, a BAQ loads the job's details and progress.
- Display-only fields for the part, serial number, customer and so on.
- One large **button per stage** of the routing. Only the next stage's button is enabled.
- The base Report Quantity fields hidden (or moved off to one side), and the toolbar hidden with `baseToolbarsManager.Visible = false;` so operators can't wander off.

## Report a quantity from code

The Report Quantity form keeps the transaction in a data view named `RQ`. Fill its key fields and let the form save, exactly as if the operator had typed them:

```csharp
private EpiDataView edvRQ;   // set in InitializeCustomCode: (EpiDataView)oTrans.EpiDataViews["RQ"]

private bool ReportQty(string jobNum, int asmSeq, int oprSeq, decimal qty)
{
    try
    {
        edvRQ.dataView[edvRQ.Row]["JobNum"] = jobNum;
        edvRQ.dataView[edvRQ.Row]["AssemblySeq"] = asmSeq;
        edvRQ.dataView[edvRQ.Row]["OprSeq"] = oprSeq;
        edvRQ.dataView[edvRQ.Row]["CurrentQty"] = qty;

        bool saved = oTrans.Update();       // same as clicking OK
        oTrans.GetNewReportQty("-1", "-1"); // start a fresh transaction for the next report
        return saved;
    }
    catch (Exception ex)
    {
        ExceptionBox.Show(ex);
        return false;
    }
}
```



- Writing `JobNum` first matters: the form validates the job and defaults other fields as each column changes, just as with typing.
- Show errors. An empty `catch {}` makes failed reports look like successes, and on the shop floor nobody finds out until the job is short.
- Remember the rights: reporting against an operation the employee isn't clocked into needs **Override Job Number** on their employee record.

## One button per stage

Map each stage button to the operation it reports. Keeping the mapping in one table makes the enabling logic and the click handlers trivial:

```csharp
private class Stage { public EpiButton Button; public int OprSeq; public string DoneColumn; }
private List<Stage> stages;

private void SetUpStages()
{
    stages = new List<Stage>
    {
        new Stage { Button = btnCut,     OprSeq = 10, DoneColumn = "Calculated_CutDone" },
        new Stage { Button = btnWeld,    OprSeq = 20, DoneColumn = "Calculated_WeldDone" },
        new Stage { Button = btnPaint,   OprSeq = 30, DoneColumn = "Calculated_PaintDone" },
        new Stage { Button = btnInspect, OprSeq = 40, DoneColumn = "Calculated_InspectDone" },
    };
    foreach (Stage s in stages) s.Button.Click += Stage_Click;
}
```

Your operation numbers and stage names will differ; the point is that they live in one list. (Needs `using System.Collections.Generic;` at the top of the script, and a matching `-=` in `DestroyCustomCode()`.)

### Enable only the next stage

A BAQ with a `JobNum` parameter returns one row per job, with a calculated true/false column per stage (for example, whether that operation's completed quantity has reached its run quantity). Run it when the job is validated, keep the row, and enable the first stage that isn't done:

```csharp
private DataRow jobStatus;   // the BAQ row for the current job, or null

private void SetStageButtons()
{
    bool foundNext = false;
    foreach (Stage s in stages)
    {
        bool done = jobStatus != null && (bool)jobStatus[s.DoneColumn];
        bool isNext = jobStatus != null && !done && !foundNext;
        s.Button.ReadOnly = !isNext;
        if (isNext) foundNext = true;
    }
}
```

Loading the job with a BAQ from a `Validated` event is shown in [Adapters, BAQs and searches](/classic/customization/adapters-and-baqs/#running-a-baq). If the BAQ returns no row, tell the operator the job isn't valid for this screen, clear the fields, and put the focus back in the job box.

### Handle the click

```csharp
private void Stage_Click(object sender, System.EventArgs args)
{
    Stage s = stages.Find(x => x.Button == sender);
    string jobNum = txtJob.Text.Trim();

    if (ReportQty(jobNum, 0, s.OprSeq, 1m))
    {
        ClearScreen();   // blank the fields, reset buttons, focus the job box for the next scan
    }
}
```

## Reporting several operations with one press

Sometimes one physical step completes several operations, for example the same operation code on each subassembly. Let a BAQ decide which operations belong to the press: pass it the job and the stage, have it return `JobOper_AssemblySeq`, `JobOper_OprSeq` and the quantity, then call `ReportQty` for each row. Keeping the selection in the BAQ means you can change which operations count without touching the script.

Operations on subassemblies that feed a parent operation can be found through `JobAsmbl.RelatedOperation`, which records the parent operation each assembly is consumed at.

## Closing the job from the last step

If the final stage should also close the job, `JobClosingAdapter` does what **Job Closing** does:

```csharp
private void CloseJob(string jobNum)
{
    string msg;
    JobClosingAdapter jc = new JobClosingAdapter(oTrans);
    try
    {
        jc.BOConnect();
        jc.GetNewJobClosing();
        jc.OnChangeJobNum(jobNum, out msg);
        jc.JobClosingData.JobClosing[0].BackFlush = true;
        jc.CloseJob(out msg);
    }
    finally
    {
        jc.Dispose();
    }
}
```

<!-- TODO verify: which JobClosing fields (JobComplete, QuantityContinue, BackFlush) must be set for close vs complete, and the OnChangeJobCompletion step if completing -->

:::caution
Closing a job is hard to undo and affects costing. Agree with production and accounting exactly which stage closes the job, whether it should **complete** it as well, and whether backflushing is wanted, before you wire it to a button. Those decisions change; keep them in one method so a change is a one-line edit.
:::

## Small things that help operators

- In the quantity box's `Enter` event, call `numQty.SelectAll()` so the next number typed or scanned replaces the old one.
- After every successful action, clear the screen and focus the job box, ready for the next scan ([Barcode scanning in MES](/classic/mes/barcode-scanning/)).
- Colour the enabled button so the next step is obvious from across the cell ([Controls and styling](/classic/customization/controls-and-styling/#colouring-a-control-from-its-value)).

## Moving this to Kinetic

None of this code runs in Kinetic MES. The durable part is the logic: which operations a stage reports and when a job closes. Move that into an Epicor Function and call it from a button in an Application Studio layer; [Report quantity from an Epicor Function](/kinetic/mes/quantity-from-a-function/) shows how.

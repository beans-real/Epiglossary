---
title: Printing from a customization
description: Print or email an Epicor report from a Classic customization button by filling the report adapter's parameters, and batch-print reports together with their attachments by tagging and polling system tasks.
env: classic
sidebar:
  order: 10
sources:
  - title: "EpiUsers: Job traveler attachment printing (10.2)"
    url: https://www.epiusers.help/t/job-traveler-attachment-printing-10-2/83689/6
---

Every Epicor report form (PO Form, Job Traveler, Pack Slip...) is driven by a **report adapter** whose dataset holds one parameter row: the same options you'd tick on the report screen. A customization can fill that row and submit the report without the user ever opening the report form. That's how you build buttons like "email this PO to the supplier" or "print travelers for every selected job".

## Print or email one report from a button

The pattern is: create the report adapter, load its default parameters, set the fields you need, submit.

```csharp
private void SendPurchaseOrder(int poNum, string toEmail, string ccEmail)
{
    POFormAdapter rpt = new POFormAdapter(oTrans);
    try
    {
        rpt.BOConnect();
        rpt.GetDefaults();

        var p = rpt.ReportData.POFormParam[0];
        p.PONum = poNum;
        p.AutoAction = "SSRSPrint";
        p.SSRSEnableRouting = false;
        p.PrintReportParameters = false;
        p.AttachmentType = "PDF";
        p.EMailTo = toEmail;
        p.EMailCC = ccEmail;
        p.FaxSubject = "Purchase order " + poNum;
        p.EMailBody = "Please find purchase order " + poNum + " attached.";

        rpt.RunDirect();
    }
    finally
    {
        rpt.Dispose();
    }
}
```

<!-- TODO verify: which AutoAction value sends the report by email in your release (this pattern was used with SSRSPrint plus the EMail fields on 10.2), and whether FaxSubject is the field used as the email subject -->

- The parameter row's name and fields differ per report (`POFormParam`, `JobTravParam`...). Open the report form in Developer Mode and look at the `ReportParam` view's columns, or use the Object Explorer, to see what's there.
- `RunDirect()` runs the report straight away; `SubmitToAgent(...)` queues it on the task agent like the report screen's **Print** button does. Queuing is kinder to the user's screen for large reports.
- Look up addresses with an adapter rather than hard-coding them, for example the buyer's email from `PurAgentAdapter.GetByID(buyerID)` or the supplier's primary contact from `VendorAdapter`. See [Adapters, BAQs and searches](/classic/customization/adapters-and-baqs/).

Wire the method to a button or to a custom Actions menu tool, and enable that tool only when the record is in the right state (approved, has an email address); see [Toolbars and tool clicks](/classic/customization/toolbars-and-tool-clicks/#adding-an-item-to-the-actions-menu).

:::tip
If the email should go out every time a PO is approved, regardless of who approves it or where, do it server-side with a BPM instead; see [Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/). A customization button is best when a person decides when to send.
:::

## Batch printing reports with their attachments

A common shop-floor request: print the traveler for each selected job **and** the drawings attached to it, in order, as one stack. Epicor won't interleave report output with attachments by itself, but a customization can orchestrate it:

1. **Pick the jobs.** A BAQ (in an embedded grid) returns jobs ready to print, with a checkbox column.
2. **Submit one report per job, tagged.** Generate one run ID (`Guid.NewGuid()`) for the batch and put it in each report's `TaskNote` parameter, then submit each report to the task agent with the render format set to PDF and routing off.
3. **Wait for them to finish.** Poll a BAQ that counts system tasks with that note that are still active or pending. When the count reaches zero, every report is done.
4. **Fetch the generated PDFs.** A second BAQ joins the completed tasks to their report output to return each report's `SysRowID` (and the job number from the task parameters). Download each with the report monitor adapter.
5. **Fetch each job's attachments** and save them next to the report.
6. **Send the files to the printer** in the order you want.

The polling query can be as small as this:

```sql
select count(*) as PendingCount
from Ice.SysTask
where SysTask.TaskStatus in ('ACTIVE', 'PENDING')
  and SysTask.TaskNote = @RunID
```

Downloading a finished report is one call:

```csharp
using (ReportMonitorAdapter monitor = new ReportMonitorAdapter(oTrans))
{
    monitor.BOConnect();
    byte[] pdf = monitor.GetReportBytes(reportSysRowID);
    string file = System.IO.Path.Combine(System.IO.Path.GetTempPath(), reportSysRowID + ".pdf");
    System.IO.File.WriteAllBytes(file, pdf);
}
```

How you download attachments depends on where they're stored: files on a network share can be copied directly, while documents in Epicor's content management store are downloaded through the attachment service. <!-- TODO verify: attachment download method names for file-share vs ECM storage in 10.2 -->

:::caution
Poll with a delay (a few seconds between checks) and a time-out, and show progress to the user. A loop that calls the server as fast as it can will slow the system for everyone while the reports render.
:::

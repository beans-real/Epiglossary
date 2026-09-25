---
title: Email a report as a PDF attachment
description: Generate an Epicor SSRS report from a function, wait for the System Agent to render it, attach the PDF to your own HTML email, and record a memo so the same document isn't sent twice.
env: both
sidebar:
  order: 9
---

Sometimes the report's own email option isn't enough: you want a branded HTML message, recipients
worked out from the data, a copy to the sales rep, and a note on the record saying it was sent. A
function can do all of that. It submits the report to the System Agent, waits for the PDF, and sends
it as an attachment.

The example sends a sales order acknowledgment, but the same technique works for any report with a
report service: invoices, packing slips, customer statements, purchase orders.

## How it works

1. **Check it hasn't already been sent**, by looking for a memo on the record.
2. **Gather the data** for the email body and work out the recipients.
3. **Submit the report**: get the report's parameter tableset, fill it in, tag it with a unique
   marker, and submit it to the System Agent.
4. **Wait for the output**: poll the report monitor for a row carrying your marker, then read the
   report bytes.
5. **Send the email** with the PDF attached.
6. **Record a memo** on the record saying who it went to.

## Library setup

- Services: the report service (here `SalesOrderAck`), `ReportMonitor`, `Memo`
- Tables (read-only): `ERP.OrderHed`, `ERP.Customer`, `ERP.CustCnt`, `ICE.Memo`
- Signature: request `orderNum` (`System.Int32`); response `result` (`System.String`)

## Example

```csharp
const string memoTitle = "XX Order ack emailed";

// 1. Already sent?
bool alreadySent = Db.Memo.Any(m =>
    m.Company == Session.CompanyID &&
    m.RelatedToFile == "OrderHed" &&
    m.Key1 == orderNum.ToString() &&
    m.MemoDesc == memoTitle);

if (alreadySent)
{
    result = "Already sent. Delete the memo on the order to send it again.";
    return;
}

// 2. Data and recipients
var order = Db.OrderHed.FirstOrDefault(o => o.Company == Session.CompanyID && o.OrderNum == orderNum);
if (order == null) throw new Ice.BLException($"Order {orderNum} was not found.");

var customer = Db.Customer.First(c => c.Company == order.Company && c.CustNum == order.CustNum);

string recipient = Db.CustCnt
    .Where(c => c.Company == order.Company && c.CustNum == order.CustNum
             && c.ShipToNum == "" && c.ConNum == order.PrcConNum)
    .Select(c => c.EMailAddress)
    .FirstOrDefault();

if (string.IsNullOrWhiteSpace(recipient))
    recipient = customer.EMailAddress;          // fall back to the customer's address

if (string.IsNullOrWhiteSpace(recipient))
{
    result = "No email address on the order contact or customer.";
    return;
}

// 3. Submit the report, tagged with a unique marker
string marker = Guid.NewGuid().ToString();

this.CallService<Erp.Contracts.SalesOrderAckSvcContract>(rpt =>
{
    var ds = rpt.GetNewParameters();
    var p = ds.SalesOrderAckParam[0];

    p.OrderList = orderNum.ToString();
    p.AutoAction = "SSRSPREVIEW";
    p.SSRSRenderFormat = "PDF";
    p.AgentID = "SystemAgent";
    p.WorkstationID = Session.TaskClientID;
    p.TaskNote = marker;                         // lets us find this run's output

    rpt.SubmitToAgent(ds, "SystemAgent", 0, 0, "Erp.UIRptSalesOrderAck");
});

// 4. Wait for the rendered report (give up after two minutes)
byte[] pdf = null;

this.CallService<Ice.Contracts.ReportMonitorSvcContract>(monitor =>
{
    DateTime giveUpAt = DateTime.Now.AddMinutes(2);

    while (pdf == null && DateTime.Now < giveUpAt)
    {
        bool morePages;
        var rows = monitor.GetRows($"RptNote = '{marker}'", 1, 1, out morePages);

        if (rows.SysRptLst.Count > 0)
            pdf = monitor.GetReportBytes(rows.SysRptLst[0].SysRowID);
        else
            System.Threading.Thread.Sleep(2000);
    }
});

if (pdf == null)
{
    result = "The report didn't finish in time. Check the System Monitor.";
    return;
}

// 5. Send the email
string html =
    $"<p>Hello,</p>" +
    $"<p>Thank you for your order. Your acknowledgment for order {orderNum}" +
    $" (your PO {System.Net.WebUtility.HtmlEncode(order.PONum)}) is attached.</p>";

var message = new Ice.Mail.SmtpMail();
message.SetFrom("orders@example.com");
message.SetTo(recipient);
message.SetSubject($"Order acknowledgment {orderNum}");
message.SetBody(html);
message.IsBodyHtml = true;

var attachments = new Dictionary<string, byte[]>
{
    { $"OrderAck_{orderNum}.pdf", pdf }
};

using (var mailer = new Ice.Mail.SmtpMailer(this.Session))
{
    mailer.Send(message, attachments);
}

// 6. Record that it was sent
this.CallService<Ice.Contracts.MemoSvcContract>(memoSvc =>
{
    var ts = new Ice.Tablesets.MemoTableset();
    memoSvc.GetNewMemo(ref ts, "Erp", "OrderHed", order.SysRowID);
    ts.Memo[0].MemoDesc = memoTitle;
    ts.Memo[0].MemoText = $"Acknowledgment emailed to {recipient} on {DateTime.Now:g}.";
    memoSvc.Update(ref ts);
});

result = $"Sent to {recipient}.";
```

<!-- TODO verify: AutoAction value for render-only output from SubmitToAgent (the source used SSRSPRINT; REST examples use SSRSPreview), and that TaskNote is copied to SysRptLst.RptNote -->

## How the pieces fit

**The marker.** Reports run asynchronously on the System Agent, so the function can't simply ask for
"the report I just ran". Putting a new GUID in the parameter row's `TaskNote` and then looking for it in
the report monitor's `RptNote` finds exactly this run's output, even when other users are printing at
the same moment. Don't pick "the newest row in the report list" instead; that's a race you'll
eventually lose.

**The wait.** Always put a limit on the loop and pause between checks. A loop with no delay and no
timeout hammers the database and can hang the call forever if the System Agent is stopped.

**The memo.** Recording the send on the order gives users visible history on the record and gives the
function a cheap way to refuse duplicates. Deleting the memo is a natural "send again" switch.

**Report style.** `GetNewParameters` gives you the default style. To use another one, for example a
style with a different layout per company, set `ReportStyleNum` on the parameter row.

## Where to call it from

The function waits for the report, so a call takes several seconds. That's fine from a button in
Application Studio, from REST, or on a schedule. Avoid calling it inside a save directive, where the
user would sit waiting and a slow report could time out the save.

For a batch (for example, every order entered today), have a scheduled function loop over the orders
and call this function for each one, so one bad order doesn't stop the rest.

## Variations

- **Several documents at once.** Many report parameter tables take a list (such as `OrderList`), so a
  single run can produce one PDF covering several orders.
- **Customer statements.** Use the statement report's service and parameters, and look up the
  billing contact instead of the order contact.
- **Cc the sales rep** or the person who entered the order by looking up their email address and adding
  it with `SetCC`.

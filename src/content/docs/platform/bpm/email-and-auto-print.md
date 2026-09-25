---
title: Send email and auto-print from a BPM
description: Send notifications with the Send E-mail widget or custom code, alert people when scheduled processes finish, and print reports automatically with Auto Print.
env: both
sidebar:
  order: 14
sources:
  - title: "EpiUsers: Email alert - MRP and Production Planner process"
    url: https://www.epiusers.help/t/email-alert-mrp-and-production-planner-process/57364
  - title: "EpiUsers: Documentation of what the parameters of Set Up Auto Print are"
    url: https://www.epiusers.help/t/documentation-of-what-the-parameters-of-set-up-auto-print-are/41104
---

Notifications are one of the most useful things a directive can do: tell a buyer a PO needs approval,
tell sales a quote task is done, tell planning that last night's MRP run failed. This page covers email
from widgets and from code, a pattern for process alerts, and the Auto Print widget.

Your system's SMTP settings must be configured in Epicor before any of this sends mail.

## The Send E-mail widget

Add a **Send E-mail** widget and fill in its template: **From**, **To**, **CC**, **Subject** and
**Body**. You can insert field values from the tableset and directive variables into any of them, and
choose whether to send one email per matching row.

![Design E-mail Template dialog with the right-click menu in the body offering Call Context, Field Query, Table Query and Scalar variables, with a directive variable listed](/images/pasted-image-20260325151843.png)

The widget can send **synchronously** (during the call) or **asynchronously** (queued, so the user isn't
kept waiting).

:::tip[Email not arriving?]
If emails from the widget silently never arrive, switch it to synchronous and test again. This has
fixed failures for some sites, and a synchronous send also surfaces SMTP errors to you during testing
instead of failing quietly in the background.
:::

**Put email in the right stage.** Send from post-processing or a **Standard** data directive, so the
email only goes out once the save has succeeded. An email from pre-processing is sent even if the save
is later rejected.

## Sending from custom code

Code gives you full control over the body, such as building an HTML table of lines:

```csharp
var mailer = this.GetMailer(async: false);
var message = new Ice.Mail.SmtpMail();

message.SetFrom("erp@example.com");
message.SetTo(recipient);
message.SetSubject($"Order {orderNum} is on hold");
message.SetBody($"<p>Order <b>{orderNum}</b> was placed on hold by {Session.UserID}.</p>");
message.IsBodyHtml = true;

mailer.Send(message);
```

`GetMailer(async: false)` sends immediately; `true` queues the send. `SetCC` is available as well.

### Getting recipients from data

Hard-coded addresses break when people change roles. Look them up instead: the buyer on a PO from
`PurAgent.EMailAddress`, the user who made the change from their user account, a contact from the
customer or supplier. See [Query the database with LINQ](/platform/bpm/linq-queries/#strings-and-nulls)
for a buyer lookup, and always handle an empty result so a missing address doesn't throw.

## Example: email when a CRM task on a quote is completed

1. Create a **Standard** data directive on the `Task` table.
2. Add a Condition:
   - `Complete` of the changed row has been changed from `false` to `true`, **and**
   - `RelatedToFile` of the changed row is equal to `"QuoteHed"` (the task belongs to a quote).
3. Add any lookups you need for the message, for example the customer ID from the task's customer
   number, into directive variables.
4. On True, add **Send E-mail** with a subject that includes the customer ID variable and the quote
   number, so the recipient can tell at a glance which quote it's about.

The change-based condition means the email is sent once, when the task is ticked complete, not on every
later edit.

## Example: alert when a scheduled process finishes

Processes run from the System Monitor (MRP, Generate PO Suggestions, scheduling and so on) record their
progress in the `SysTask` table. A **Standard** data directive on `SysTask` can watch for a particular
process finishing:

1. Create a Standard data directive on `SysTask`.
2. Add a Condition:
   - `TaskType` equals `"Process"`, **and**
   - `TaskDescription` equals the process name exactly as it appears in the System Monitor, for example
     `"Generate PO Suggestions"`, **and**
   - `TaskStatus` has changed from any value to `"COMPLETE"` (or to `"ERROR"` if you also want to hear about failures).

   ![SysTask condition lines: TaskType equals "Process" And TaskDescription equals "Generate PO Suggestions" And, in brackets, TaskStatus changed from any to "COMPLETE" Or changed from any to "ERROR"](/images/82774676140ceb1913c8077856c6454814de29fa.png)

3. On True, send an email with the task description, status and end time.

This is particularly worth doing for MRP: if an overnight run fails, planners find out at the start of
the day rather than when the suggestions look wrong.

:::caution[Test and pilot environments]
Copying a production database into a test environment copies its directives too. Disable email
directives in non-production environments, or make them check the environment, so people don't receive
alerts about test runs they then act on.
:::

## Printing a report automatically: Auto Print

The **Auto Print** widget runs a report (a packing slip after shipment, a traveler after job release)
without the user opening the report screen. You pick the report and style, a printer or output option,
and then the report's parameters.

![Set up Auto Print dialog, Report Options tab: report, style, run schedule, print action, printer choice and print quantity](/images/0ec69f7791589bf6f22d8d08c06f159029b49eaf.png)

The **Report Parameters** list comes from the report's parameter table in its report data definition,
so it's different for every report. In most cases you only change the key parameter (for a packing slip,
the pack number) from its default constant to an expression or directive variable that holds the value
from the transaction, and leave the rest at their defaults. If you need extra fields available as
parameters, they have to be added to the report data definition first.

![The Report Parameters list for a packing slip: PackNum set to a directive variable, the other parameters left at their default constants or blank](/images/245f0cb79bcd43d137825c14aec1964f1a3cad24.png)

## Related

- [BPM conditions](/platform/bpm/conditions/) for sending an email once rather than on every save
- [Common BPM problems](/platform/bpm/troubleshooting/)

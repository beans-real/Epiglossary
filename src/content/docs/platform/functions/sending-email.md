---
title: Send email from a function
description: Build and send HTML email from an Epicor Function, keep recipient lists out of the code, add a testing switch, and send a scheduled digest such as new customers this week.
env: both
sidebar:
  order: 8
---

Functions are a natural home for notification email: a button that emails a document, a nightly digest,
an alert raised by several directives. This page covers sending from function code. For the Send E-mail
widget and emailing from directives, see
[Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/).

Epicor's SMTP settings must be configured before anything will send.

## Sending a message

Use Epicor's own mail classes, which send through the SMTP server configured in Epicor:

```csharp
var message = new Ice.Mail.SmtpMail();
message.SetFrom("erp@example.com");
message.SetTo(recipients);          // typically several addresses separated by semicolons
message.SetSubject(subject);
message.SetBody(html);
message.IsBodyHtml = true;

using (var mailer = new Ice.Mail.SmtpMailer(this.Session))
{
    mailer.Send(message);
}
```

`SetCC` and `SetBcc` work the same way as `SetTo`.

:::caution[Don't hard-code an SMTP server]
It's possible to use `System.Net.Mail.SmtpClient` with a host name in the code, but then the function
breaks when the mail server changes, bypasses Epicor's mail settings, and ties your code to one
environment. Use `Ice.Mail` unless you have a specific reason not to.
:::

## Keep recipients out of the code

Hard-coded addresses break the day someone changes role. Store them where an administrator can edit
them without touching the function, for example in a user code:

1. In **User Codes Maintenance**, create a code type such as `XX_Notify`.
2. Add a code, for example `NEWCUST`, and put the addresses in its long description, separated by
   semicolons.
3. Read it in the function (add `ICE.UDCodes` to the library's table references):

```csharp
string recipients = Db.UDCodes
    .Where(c => c.Company == Session.CompanyID
             && c.CodeTypeID == "XX_Notify"
             && c.CodeID == "NEWCUST")
    .Select(c => c.LongDesc)
    .FirstOrDefault();

if (string.IsNullOrWhiteSpace(recipients))
    return;   // nobody to tell; don't fail the job
```

For per-record recipients, look them up from the data: the contact on the order, the buyer on the PO,
the sales rep on the customer.

## Add a testing switch

When testing, you don't want real customers or colleagues receiving mail. Give the function a
`testMode` Boolean request parameter (or read one from a user code) and redirect everything when it's
set:

```csharp
if (testMode)
{
    message.SetTo("tester@example.com");
    subject = "[TEST] " + subject;
}
```

Remember that copying production into a test environment copies scheduled tasks and directives too.

## Example: weekly "new customers" digest

This function emails a table of customers whose first-ever order was in the last seven days. It's meant
to be [scheduled](/platform/functions/scheduling-functions/) weekly.

- Request: none (or `testMode`)
- References: tables `ERP.OrderHed`, `ERP.Customer`, `ICE.UDCodes` (all read-only)

```csharp
DateTime since = DateTime.Today.AddDays(-7);

// Customers whose earliest order falls inside the window
var newCustNums = Db.OrderHed
    .Where(o => o.Company == Session.CompanyID)
    .GroupBy(o => o.CustNum)
    .Where(g => g.Min(o => o.OrderDate) >= since)
    .Select(g => g.Key)
    .ToList();

if (newCustNums.Count == 0)
    return;   // nothing to report, send nothing

var customers = Db.Customer
    .Where(c => c.Company == Session.CompanyID && newCustNums.Contains(c.CustNum))
    .OrderBy(c => c.Name)
    .Select(c => new { c.CustID, c.Name, c.City, c.State, c.CreditLimit })
    .ToList();

var sb = new System.Text.StringBuilder();
sb.Append("<p>New customers with their first order this week:</p>");
sb.Append("<table border='1' cellpadding='4' style='border-collapse:collapse'>");
sb.Append("<tr><th>Customer</th><th>Name</th><th>City</th><th>State</th><th>Credit limit</th></tr>");

foreach (var c in customers)
{
    sb.Append("<tr>")
      .Append($"<td>{System.Net.WebUtility.HtmlEncode(c.CustID)}</td>")
      .Append($"<td>{System.Net.WebUtility.HtmlEncode(c.Name)}</td>")
      .Append($"<td>{System.Net.WebUtility.HtmlEncode(c.City)}</td>")
      .Append($"<td>{System.Net.WebUtility.HtmlEncode(c.State)}</td>")
      .Append($"<td style='text-align:right'>{c.CreditLimit:N2}</td>")
      .Append("</tr>");
}
sb.Append("</table>");

// Recipients from the user code shown earlier
string recipients = Db.UDCodes
    .Where(u => u.Company == Session.CompanyID && u.CodeTypeID == "XX_Notify" && u.CodeID == "NEWCUST")
    .Select(u => u.LongDesc)
    .FirstOrDefault();
if (string.IsNullOrWhiteSpace(recipients)) return;

var message = new Ice.Mail.SmtpMail();
message.SetFrom("erp@example.com");
message.SetTo(recipients);
message.SetSubject($"New customers: {customers.Count} this week");
message.SetBody(sb.ToString());
message.IsBodyHtml = true;

using (var mailer = new Ice.Mail.SmtpMailer(this.Session))
{
    mailer.Send(message);
}
```

Points worth copying into your own digests:

- **One query per table.** Grouping in the database and then fetching all matching customers in one
  call is far cheaper than looking up each order's customer in a loop.
- **HTML-encode data.** A customer name containing `&` or `<` otherwise breaks the table.
- **Send nothing when there's nothing to say.** An empty weekly email trains people to ignore it.
- **Keep the HTML simple.** Email clients support a narrow subset of HTML and CSS; plain tables with
  inline styles render almost everywhere.

To cover several companies, loop over the companies you care about and filter by each one, rather
than dropping the company filter.

## Next

To attach an Epicor report to the email, see
[Email a report as a PDF attachment](/platform/functions/emailing-report-pdfs/).

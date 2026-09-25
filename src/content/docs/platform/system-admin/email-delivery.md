---
title: Email delivery and SPF
description: How an email from Epicor gets to its recipient, how to work out where a missing email stopped, and what SPF records have to do with it.
env: both
sidebar:
  order: 3
---

Epicor sends email for emailed reports, BPM notifications, workflow alerts and password invitations.
When one doesn't arrive, the problem can be in any of four places: the process that should have sent
it, Epicor's own mail relay, the receiving mail server, or the DNS records that tell that server whether
to trust the sender. Work through them in order and you'll find it quickly.

## The path an email takes

1. A report, process or BPM finishes and asks Epicor to send a message.
2. Epicor hands the message to an SMTP server. On-premises that is whatever mail server your company
   configured. In Epicor Cloud it is Epicor's hosted mail relay service.
3. The relay delivers it to the recipient's mail system (Exchange, Microsoft 365, Gmail and so on).
4. The recipient's mail system checks the sender's domain records (SPF, and often DKIM and DMARC) and
   decides whether to deliver it, junk it or reject it.

## Find where it stopped

1. **Did Epicor try to send it?** Open the **Email Log** and look for the message. If there is no
   entry, the email was never sent. Go to step 2. If there is an entry, go to step 3.
2. **Did the process that sends it succeed?** Epicor does not send the email for a report or process
   that fails. Check **System Monitor** for the task and its error, and check any customization or BPM
   involved. A report that errors when previewed won't email either.
3. **Did the relay deliver it?** If the log says sent, the message left Epicor. In the cloud, open a
   case with Epicor Support and ask them to check the relay's logs for that message. A frequent cause is
   the relay flagging a recipient address (often after a bounce or a spam report) and suppressing further
   mail to it. Support can lift the block.
4. **Did the receiving server accept it?** If the relay shows it as delivered, check the message trace
   or logs on your mail server. Look for it being quarantined or rejected, and confirm the sending
   mailbox or address hasn't been changed or removed on the mail server side.
5. **Do your DNS records allow the sender?** If the receiving server is rejecting or junking the mail,
   check your domain's SPF record (below).

## SPF in brief

**Sender Policy Framework (SPF)** is a DNS record a domain owner publishes to list the servers allowed
to send email using that domain. When a mail server receives a message claiming to be from
`erp@example.com`, it looks up the SPF record for `example.com` and checks whether the server that
delivered the message is on the list. If it isn't, the message may be junked or refused.

An SPF record is a single `TXT` record on the domain:

```text
v=spf1 include:spf.protection.outlook.com include:relay.example.net -all
```

- `v=spf1` marks it as an SPF record.
- Each `include:` pulls in another provider's list of sending servers. Your email host and any service
  that sends on your behalf (such as an ERP mail relay) need to be included.
- `-all` means "reject anything not listed". `~all` (soft fail) means "accept but treat as suspicious".

If Epicor sends mail "from" your company's domain through a relay that your SPF record doesn't include,
receiving servers see it as spoofed. Ask Epicor (cloud) or your mail administrator (on-prem) which
sending hosts to include, then have whoever manages your DNS add them.

To see your current record:

```text
nslookup -type=txt example.com
```

Online SPF checkers will also look up the record and flag syntax errors, too many DNS lookups (the limit
is ten) and duplicate records. A domain must have only one SPF record.

## Related pages

- [Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/)
- [Scheduled tasks](/platform/system-admin/scheduled-tasks/)

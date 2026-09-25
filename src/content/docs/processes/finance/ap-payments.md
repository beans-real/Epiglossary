---
title: AP payments, ACH and remittance advice
description: How supplier payment methods, payment groups and Select Invoices fit together in AP Payment Entry, the ACH flow from payment to bank file to remittance advice, and where the NACHA file format comes from.
env: both
sources:
  - title: "Video: Streamline AP payments in Epicor (check, ACH and wire)"
    url: https://www.youtube.com/watch?v=SrmPW-XLbeE
sidebar:
  order: 2
---

Paying suppliers in Epicor happens in **AP Payment Entry** (called **Payment Entry** in some menus and
searches). Payments are made in groups, and each group uses one payment method, such as printed checks
or an electronic file for the bank. Understanding that link explains most "where's my invoice?"
questions.

## The pieces

| Record | Where | What it controls |
|---|---|---|
| **Payment method** | **Payment Method Maintenance** | The type of payment (manual check, printed check, electronic) and, for electronic methods, which electronic interface builds the bank file |
| **Supplier's payment method** | **Supplier Maintenance**, supplier detail | The default method for paying this supplier. New invoices for the supplier take it on |
| **Supplier bank** | **Supplier Maintenance**, **Bank/Remit To** | Where electronic payments go. EFT payments fail if the supplier has no bank record |
| **Bank account** | **Bank Account Maintenance** | The account payments come from. For EFT, the bank account needs an EFT payment method |
| **Payment group** | **AP Payment Entry** | A batch of payments with one bank account, one payment method and one payment date |

## Paying a group of invoices

1. In **AP Payment Entry**, create a group: bank account, **Payment Method**, payment date.
2. From the landing page, highlight the group and choose **Select Invoices** from the **Overflow**
   menu (in Classic, **Actions > Select Invoices**). Filter by supplier, due date or amount, and tick the
   invoices to pay. Epicor creates one payment per supplier.
3. Review the payments and adjust any amounts or discounts.
4. Choose **Process Payments**: **Print** (assigns payment numbers, creates the electronic file and prints
   remittance advice), or **Generate Only** (numbers and file, no print). For printed checks, this prints
   the checks.
5. **Post** the group.

## "Some suppliers' invoices don't appear"

**Symptom:** when selecting invoices for a payment group, invoices for certain suppliers are missing even
though they're open and due.

**Cause:** **Select Invoices** shows, by default, only invoices whose payment method matches the group's.
Each invoice takes the payment method from its supplier when it's entered. A supplier set to ACH won't
appear in a check run, and a supplier with no payment method selected won't match an electronic group.

**Fix:**

- Create a separate group for each payment method you pay with, or
- Correct the supplier's **Payment Method** (and the method on any invoices already entered), then
  select again.

**Prevention:** make **Payment Method** part of your new-supplier checklist.

## ACH payments and remittance advice

A safe order of operations for ACH:

1. Enter the ACH payments in a group that uses the electronic payment method.
2. **Generate** the bank file. This step assigns the payment numbers, which the remittance advice
   needs.
3. Upload the file to the bank and confirm it was accepted without errors.
4. **Print Remittance Advice** and send it to suppliers.

Sending remittance after the bank accepts the file means suppliers aren't told a payment is coming if the
upload failed. Set up **report routing** (via Advanced Print Routing or a BPM) to email each supplier's
remittance advice to the address on their supplier record automatically, rather than printing and
emailing by hand. See [Send email and auto-print from a BPM](/platform/bpm/email-and-auto-print/).

:::note
In the standard SSRS reports, the remittance advice is a subreport of the **APCheck** report style. The
style's report path lists the check report and the remittance report together (the check print report
first, then `PaymentRemittanceAdvice/APRemit`). Customise the remittance by copying that style and
changing the `APRemit` report.
:::

## The NACHA file

In the US, ACH files follow the NACHA format. Epicor builds the file with an **electronic interface**: a
C# program selected on the payment method in **Payment Method Maintenance** (managed in **Electronic
Interface Maintenance**). There's no screen for the file layout itself.

To change what goes into the file (for example, a different reference in an addenda field), copy the
standard interface program, change which field from its data it writes to that position, register your
copy as a new electronic interface, and point the payment method at it. Keep the change small: every
field is fixed-width, and the bank will reject a file whose record lengths drift.

:::note
Epicor Cloud (multi-tenant) may not allow custom electronic interface programs. Check with Epicor before planning this change on a cloud tenant.
:::

## Related pages

- [Buyers and suppliers](/processes/purchasing/buyers-and-suppliers/)
- [Invoice tax and customer credit](/processes/finance/invoices-tax-and-credit/)

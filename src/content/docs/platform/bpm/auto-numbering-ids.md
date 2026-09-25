---
title: Auto-number customer and supplier IDs
description: Assign the next sequential Customer ID or Supplier ID automatically at save, using a user code as a counter and a lock so two users never get the same number.
env: both
sidebar:
  order: 12
---

Epicor gives every customer and supplier an internal number (`CustNum`, `VendorNum`) automatically, but
the IDs people see and type (`CustID`, `VendorID`) are entered by hand. If you want those to be
sequential numbers, a short pre-processing directive can hand them out. This is a well-known community
pattern; the version here is written to be safe with several users saving at once.

## What it does

- Users create a customer and enter `AUTO` as the Customer ID (or you default it to `AUTO`; see below).
- On save, the directive replaces `AUTO` with the next number from a counter and increments the counter.
- Users can still type a real ID when they need a specific one; the directive leaves those alone.

## Before you start

Create the counter as a user code:

1. Open **User Codes Maintenance**. <!-- TODO verify: menu path for User Codes Maintenance in Kinetic and Classic -->
2. Add a code type `NEXTNUM`.
3. Under it, add a code `CUSTOMER` and put the first number to issue (for example `100001`) in its
   description.

## The directive

Pre-processing on `Erp.BO.Customer.Update`, Custom Code widget:

```csharp
var newCustomers = ds.Customer
    .Where(c => c.RowMod == IceRow.ROWSTATE_ADDED && c.CustID == "AUTO")
    .ToList();

if (newCustomers.Count == 0) return;

using (var txScope = IceContext.CreateDefaultTransactionScope())
{
    var counter = Db.UDCodes.With(LockHint.UpdLock).FirstOrDefault(u =>
        u.Company == Session.CompanyID &&
        u.CodeTypeID == "NEXTNUM" &&
        u.CodeID == "CUSTOMER");

    int next;
    if (counter == null || !int.TryParse(counter.CodeDesc, out next))
        throw new Ice.BLException("Customer numbering isn't set up. Check user code NEXTNUM / CUSTOMER.");

    foreach (var cust in newCustomers)
    {
        // skip any number someone has already used by hand
        while (Db.Customer.Any(c => c.Company == Session.CompanyID && c.CustID == next.ToString()))
            next++;

        cust.CustID = next.ToString();
        next++;
    }

    counter.CodeDesc = next.ToString();
    Db.Validate();
    txScope.Complete();
}
```

## How it works

- **Why `Update` and not `GetNewCustomer`.** Numbers are only taken when a customer is actually saved.
  Assigning at **New** would use up a number every time someone started a customer and abandoned it.
- **Why `UpdLock`.** Reading the counter with an update lock inside a transaction makes a second user
  wait until the first has written the new value back. Without it, two saves at the same moment can
  read the same number.
- **Why the `Any` check.** If someone typed a numeric ID by hand earlier, the counter could otherwise
  collide with it.
- The counter lives in data, not code, so an administrator can move it (for example to start a new
  range) without editing the directive.

## Variations

- **Supplier IDs.** Same pattern on `Erp.BO.Vendor.Update`, working on `ds.Vendor` and `VendorID`, with
  a separate counter code such as `SUPPLIER`. Use separate counters so customers and suppliers don't
  share a sequence.
- **Fixed width.** Use `next.ToString("D6")` to produce `000123`-style IDs. Make sure the `Any` check
  uses the same format.
- **Default to AUTO.** A post-processing directive on `Erp.BO.Customer.GetNewCustomer` with a **Set
  Field** of `CustID` on the added row to `"AUTO"` saves users typing it.

:::note
Numbers can still be skipped, for example if the save fails on another validation after a number was
assigned. If you need strictly gap-free numbering, test that scenario on your version and design for it
explicitly.
:::

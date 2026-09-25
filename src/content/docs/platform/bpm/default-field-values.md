---
title: Default and lock field values
description: Set sensible defaults on new records, fill fields when a related value changes, and lock fields, choosing the right method or table to hook for each.
env: both
sidebar:
  order: 9
---

Setting a field automatically is the most common BPM of all: default a bank account, copy notes from
the ship-to, pre-fill a contact email, lock a price. The logic is usually one **Set Field** widget. The
real decision is *where* to put it, because that controls when the user sees the value and which entry
paths it covers.

## Where to put a default

| Hook | When the value appears | Covers |
|---|---|---|
| Post-processing on a `GetNew…` method | As soon as the user clicks **New** | Records created through that method |
| Post-processing on a `Change…` method | When the user changes the related field | That screen's field-change path |
| Pre-processing on `Update` | At save | Saves through that method |
| In-Transaction data directive on the table | At save | Every save to the table, from any source |

A defaulting BPM on `GetNew…` is friendly, since the user sees and can override the value, but it's
not a guarantee. If the value *must* be set, add a data directive as well.

## Example: default the bank on new cash receipt batches

If nearly every receipt goes to one bank account, save users a step.

1. Create a post-processing directive on `Erp.BO.BankBatch.GetNewBankBatch`.
2. Add a **Set Field** widget: set `BankBatch.BankAcctID` of **the added row** to the expression
   `"MAIN"` (your bank account ID).

The new batch opens with the bank filled in, and users can still change it.

## Example: copy ship-to notes onto the order

Suppose you keep delivery instructions in a UD field on the ship-to (`ShipTo.ShipNotes_c`) and want
them on the sales order's ship comment whenever the ship-to is chosen.

Order Entry calls `ChangeShipToID` when the ship-to changes. Use **post-processing**, so Epicor's own
logic has already refreshed the ship-to-related fields and won't overwrite yours. Nothing is saved yet;
the updated values go back to the screen, and the user saves as normal.

```csharp
var order = ds.OrderHed.FirstOrDefault(h =>
    h.RowMod == IceRow.ROWSTATE_ADDED || h.RowMod == IceRow.ROWSTATE_UPDATED);
if (order == null) return;

string notes = Db.ShipTo
    .Where(s => s.Company == order.Company
             && s.CustNum == order.CustNum
             && s.ShipToNum == order.ShipToNum)
    .Select(s => s.ShipNotes_c)
    .FirstOrDefault();

if (!string.IsNullOrWhiteSpace(notes))
{
    order.ShipComment = notes;
}
```

This replaces whatever was in the comment. If users type their own comments too, append instead of
overwriting. If you ship to other customers' addresses, look the ship-to up under the ship-to customer
rather than the sold-to customer.

## Example: fill a field from a lookup, with no code

Set Field accepts any C# expression, including a LINQ query. Here an In-Transaction data directive on
`POHeader` fills a UD field `SupplierEmail_c` with the supplier's primary purchasing contact's email
when a PO is created and the field is blank.

1. Add a Condition: `SupplierEmail_c` of **the added row** is equal to `""`.
2. On True, add **Set Field**: set `SupplierEmail_c` of the added row to this expression:

```csharp
(from c in Db.VendCnt
 join v in Db.Vendor
    on new { c.Company, c.VendorNum, ConNum = c.ConNum }
    equals new { v.Company, v.VendorNum, ConNum = v.PrimPCon }
 where c.Company == ttPOHeaderRow.Company && c.VendorNum == ttPOHeaderRow.VendorNum
 select c.EmailAddress).FirstOrDefault() ?? ""
```

`ttPOHeaderRow` is how the expression editor refers to the row being processed. The `?? ""` matters:
without it, a supplier with no primary contact gives `null`.

:::note
Supplier contacts are also keyed by purchase point. If you use purchase points, add a purchase point
filter so you don't pick up a contact from the wrong one.
:::

## Example: lock the price on new order lines

`OrderDtl.LockPrice` greys out the unit price on an order line so it can't be changed by accident.

1. Create an **In-Transaction** data directive on the `OrderDtl` table.
2. Add a Condition: there is at least one **added** row in `ttOrderDtl`.
3. On True, add **Set Field**: set `LockPrice` of **the added row** to `true`.

Use In-Transaction rather than Standard: a Standard data directive runs after the save, so changing
the row there doesn't stick.

## More ideas

- **PO suggestions unapproved by default.** New suggestions can arrive already marked for approval.
  A post-processing directive on `Erp.BO.POSugg.GetRowsPlant` can clear that flag on the returned rows
  so buyers approve deliberately.
- **Price PO suggestions from last cost.** An In-Transaction data directive on `SugPoDtl` can fill a
  zero `UnitPrice` from `PartCost.LastMaterialCost`. Watch two details: `PartCost` is keyed by cost ID
  as well as part, and part costs are in base currency while the document price is in the supplier's
  currency.
- **Labor defaults** such as clearing the request-move flag are covered in
  [Labor entry BPMs](/platform/bpm/labor-entry-bpms/).

## Related

- [Method directives vs data directives](/platform/bpm/method-vs-data-directives/)
- [Query the database with LINQ](/platform/bpm/linq-queries/)

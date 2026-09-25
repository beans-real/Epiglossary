---
title: Freight and Quick Ship errors
description: Get a freighted pack that won't unfreight back to an editable state, and a field guide to the common categories of carrier freighting errors from a Quick Ship manifest integration.
env: both
sources:
  - title: "Insite Quick Ship help: Freighting error messages"
    url: http://help.insiteship.com/100/Freighting_Error_Messages.htm
sidebar:
  order: 3
---

When Epicor is connected to a manifest system such as Insite's Quick Ship, **Freight** on a pack sends
it to the carrier, and the carrier's answer (tracking number or error) comes back to Epicor. Most
freighting problems are data problems on the pack, the ship via or the customer, reported in the
carrier's words. This page covers getting a stuck pack back, and how to read the errors.

## A freighted pack that won't unfreight

**Symptom:** a pack is **Freighted** (or shows `EM0270: Invalid Shipment Number` when you try to work
with it), and **Unfreight** fails, so you can't reopen it to change lines.

**Cause:** on a manifest-enabled workstation, every status change on the pack is sent to the manifest
system. If the manifest no longer recognises the shipment, the change is rejected and the pack can't
move.

**Fix:** make the status changes from a workstation that *isn't* connected to the manifest, so Epicor
doesn't try to talk to the carrier:

1. Switch to a workstation whose manifest **Enabled** box is clear (check in **Workstation
   Maintenance**). If every workstation is enabled, temporarily clear **Enabled** on one, save, and
   switch to it (in Classic, re-select it with **Options > Change Workstation**).
2. Open the pack in **Customer Shipment Entry**.
3. Enter a stage name and use **Stage** to move the pack to **Staged**.
4. Open **Stage Ship Confirm Entry**, select the pack and choose **Unstage**. Refresh; the pack shows
   **Closed**.
5. Back in Customer Shipment Entry, clear the stage name and save, then **Open** the pack.
6. Make your changes, close the pack and freight it again from a manifest workstation (or mark it shipped
   if it has already gone).
7. If you disabled a workstation in step 1, enable it again.

:::caution
This bypasses the manifest. If the carrier still has a live shipment for this pack, void it in the
manifest system too, or you may be billed for a shipment that doesn't exist in Epicor.
:::

## Reading freighting errors

The carrier and manifest return hundreds of distinct messages, but they fall into a handful of groups.
Start by working out which group you're in; the fix is usually on the pack's **Billing** or
**Manifest** details, the ship via code, or the customer record.

| Category | Typical wording | Where to look |
|---|---|---|
| **Account and billing** | "Account not found", "Invalid payment type", "payor's account number is invalid", "Missing billing method for collect or third party" | The pack's billing tab: billing type, third-party or collect account number and address. A common cause is a mismatch such as a FedEx billing type on a UPS ship via. A customer on credit hold can also trigger it |
| **Service not available** | "The selected service is not available from the origin to the destination", "not supported for the destination" | The ship via code. Pick a service that serves that route, country or address type |
| **Address data** | "Invalid recipient postal code format", "Address not found", "Shipment address country is null" | Customer or ship-to record: postal code, state and country must agree and match the country's format |
| **Residential and home delivery** | "Designated as residential but qualifies for home delivery" | Use a home-delivery ship via, or clear **Residential Delivery** on the pack |
| **International paperwork** | Duties payor errors, "Total commodities weight is greater than package weight", missing tariff or origin codes | Duty/tax payor on international ship vias, part weights, and the part's customs data (Schedule B and trade-agreement codes) |
| **Hazmat** | "Invalid hazardous commodity packaging units" | Hazmat group on the manifest's product record and the container type's commodity details |
| **Ship code setup** | Missing elements, declared value or signature errors | The ship via/ship code needs the matching accessorial (declared value, signature type, APO/FPO settings) set up in the manifest |
| **Workstation and licensing** | "Invalid workstation key", "not licensed for rate shopping" | The manifest workstation code must match the Epicor workstation ID. Licensing messages need your manifest vendor |
| **Test environment limits** | Intermittent "unable to obtain rates", can't void or unfreight | Carrier test systems are flaky and some actions (such as voiding with UPS) aren't supported there. Retry, or test in production with care |

Two habits make these much rarer:

- **Validate at order entry.** Most billing and service errors come from choices made on the sales order.
  A BPM that checks the ship via and billing type combination on the order release stops them before
  shipping sees them. See [Order to shipment](/processes/sales-shipping/order-to-shipment/).
- **Fix the source record, then recreate the pack.** A pack copies customer and order details when it's
  created. Correcting the customer record doesn't fix an existing pack; either edit the pack too or
  delete and recreate it.

For the exact meaning of a specific message, the manifest vendor's documentation (credited below) is the
reference.

## Related pages

- [Order to shipment](/processes/sales-shipping/order-to-shipment/)

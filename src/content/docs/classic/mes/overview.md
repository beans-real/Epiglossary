---
title: Classic MES overview
description: How the classic MES (Manufacturing Execution System) menu is customized, how to launch it in Developer Mode, and which techniques in this section suit shop-floor screens.
env: classic
sidebar:
  order: 1
---

**MES** is the shop-floor front end of Epicor: large buttons for clocking in and out, starting and ending activities, reporting quantities and issuing material. In the Classic client it's the same smart client started in MES mode, and its screens are ordinary Classic forms, so everything in [Classic customization](/classic/customization/overview/) applies. What's different is how you get into it and what shop-floor users need from it: fewer clicks, big targets, scanners instead of keyboards.

For MES in the Kinetic browser client, see [Kinetic MES overview](/kinetic/mes/overview/).

## Opening MES for customization

MES doesn't open from the normal menu with Developer Mode. Start the client with a switch instead:

| Shortcut target ends with | Starts |
|---|---|
| `-MES` | MES in run mode, as operators use it |
| `-MESC` | MES in Developer Mode |

Setting up the shortcuts is covered in [Installing the smart client](/classic/administration/installing-the-client/#a-shortcut-for-mes).

With `-MESC`:

1. Sign in. The **Select Customization** window appears; pick an existing MES customization or click **OK** to start a new one.
2. On the **MES Menu**, right-click anywhere and choose **Customization** to open the Customization Tools Dialog.
3. Make your changes, **Test Code**, save, and attach the customization to the MES menu item in **Menu Maintenance** as for any other form.

The programs MES launches (**Start Production Activity**, **End Activity**, **Report Quantity** and the rest) are separate forms with their own customizations. Open them from MES while in Developer Mode to customize them.

## Things to know about MES screens

- **Employees, not users, drive MES.** Most actions depend on the employee who's clocked in. Rights such as reporting quantity without being clocked into the operation come from the employee record (for example **Override Job Number** in **Shop Employee Maintenance**), not from the user account.
- **Report Quantity** records completed quantity against an operation without ending the activity. It isn't available for operations whose labour type is backflushed from quantity.
- **Keep it quick.** Every extra dialog costs time for every operator, every shift. Prefer defaults, validation on `Validated` events and one-click actions.
- **Put the rules on the server.** A button on the MES screen is a good trigger, but the logic it runs (what gets reported, what gets closed) is safer in a BPM or Epicor Function, where it also survives a move to Kinetic MES.

## In this section

| Page | What it covers |
|---|---|
| [Custom buttons on the MES menu](/classic/mes/mes-menu-buttons/) | Reusing a spare MES button to launch a dashboard or custom form, and passing it a value |
| [Barcode scanning in MES](/classic/mes/barcode-scanning/) | Scanning a traveler barcode to start an activity, and programming scanners so MES keeps up |
| [Customizing Report Quantity](/classic/mes/job-stage-buttons/) | One-click quantity reporting per operation, stage buttons driven by job status, closing a job from a button |

---
title: Managing customizations
description: Save and version Classic customizations, keep work in progress hidden, put a customization on a menu, and export, import and verify customizations with Customization Maintenance.
env: classic
sidebar:
  order: 11
---

A customization isn't live just because you saved it. It has to be attached to a menu item (or selected by the user in Developer Mode) before anyone sees it, and after an upgrade it has to pass verification before it loads. This page covers that life cycle.

## Saving and versions

Saving from the Customization Tools Dialog opens the **Customization Save Dialog**:

- **Name** and **Description** identify the layer. Use a consistent prefix and a meaningful name (`XX_OrderEntry`), because the name is what you pick in Menu Maintenance.
- **All Companies** makes the layer available in every company; otherwise it belongs to the current one.
- **Work in Progress (WIP)** hides the customization from everyone but you. Use it while you're building so a half-finished layer can't be attached to a menu by accident.
- The **Existing Customizations** grid shows the other layers for the same form.

To keep a known-good version while you experiment, save under a new name (`XX_OrderEntry_v2`), test it by selecting it in Developer Mode, and only switch the menu over once it works. The old layer stays available as a fallback.

:::tip
Each save asks for a comment. Write what changed; after a few months that comment history is the only change log you'll have.
:::

## Putting a customization on the menu

Users get the customization attached to the menu item they launch:

1. Open **Menu Maintenance** (for example **System Setup > Security Maintenance > Menu Maintenance**).
2. Find the menu item for the form, for example **Order Entry**.
3. In the **Customization** field, select your layer. Save.
4. Users pick it up the next time they open the form after restarting the client or refreshing their session.

You can also add a **new** menu item that runs the same program with a different customization, which lets you pilot a change with a few users while everyone else keeps the original. Restrict the new item with menu security.

Customizations of sub-programs (forms launched from another form, such as **Memo Entry** or **Part Transaction History**) are added under the **Process** node in Menu Maintenance and then activated through **Process Calling Maintenance**.

## Customization Maintenance

**Customization/Personalization Maintenance** (**System Management > Upgrade/Mass Regeneration > Customization Maintenance**) lists every customization and personalization and is where you:

| Task | How |
|---|---|
| Find what's attached to a form | Search by form or name on the **Detail** tab |
| Export a customization to a file | **Actions > Export Customization**; enter a new name for it inside the file and a filename |
| Import it into another company or environment | **Actions > Import Customization**; choose the file, a new name and whether it's for all companies |
| Check it still compiles and matches the form | **Actions > Verify Customization** (one) or **Verify All** (many, slow) |
| Remove old layers | Delete obsolete customizations and a leaver's personalizations |
| Keep something hidden | Toggle **Work in Progress** |

You need **Security Manager** rights to change or delete other people's layers; without them the program is read-only.

### Moving a customization between environments

1. Export it from the source environment (test, usually).
2. Import it into the target environment under the name you want users to see.
3. Run **Verify Customization** on the imported layer. **Valid For** should show the current version and **Status** should be **Pass**; any compile problems appear on the **Compile/Script Errors** tab and control problems on **Warnings**.
4. Attach it to the menu item in the target environment.

Anything the customization depends on has to exist in the target first: UD columns, BAQs it runs by ID, UD codes, menu items it launches.

## After an upgrade

Upgrades can change the base form underneath your layer: a control renamed, a data view column removed. When a customization no longer matches, users get an error instead of the form. Run **Verify All** after every upgrade (in a test copy first), fix the failures in Developer Mode, then verify again.

:::note
Classic customizations don't convert to Kinetic Application Studio layers. If you're planning a move to Kinetic, use the upgrade window to take stock of what you have; see [Migrating to Kinetic](/classic/migrating-to-kinetic/).
:::

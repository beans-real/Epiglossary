---
title: "End Activity: the Actions grid and stuck activities"
description: Why Kinetic End Activity has an Actions section you never see in MES, and how to end a labor activity an employee can't end themselves.
env: kinetic
sidebar:
  order: 3
sources:
  - title: "EpiUsers: Anyone know what Actions in End Activity is?"
    url: https://www.epiusers.help/t/anyone-know-what-actions-in-end-activity-is/122630/2
---

**End Activity** is where operators report quantity and close out the labor they started. Two questions about it come up regularly: what the mysterious **Actions** section is, and what to do when an employee is stuck in an activity they can't end.

## The hidden Actions section

Open **End Activity** in Application Studio and you'll find an **Actions** panel with a grid (Completed, Sequence, Description, Required, Completed By, Completed On) that never appears when operators use MES.

![End Activity Actions panel with columns Completed, Sequence, Description, Required, Completed By and Completed On](/images/1b1885d3c38f85458b9fe0439a9a1f63d5978781.png)

It's hidden by a base **data rule**. Search the Data Rules designer for "action" and you'll find a rule that sets the actions grid to **Invisible** when the licensed-modules view says `RecipeAuthoring` is `false`:

![Data rule hideActionsGrid with condition sysLicensedModules.RecipeAuthoring equal to false and action SettingStyle.Invisible on LaborDtlActionsGrid](/images/2f04f8d4042ed0017ca74c6a64f5ab2518325c9b-2-690x267.png)

**Recipe authoring** belongs to Epicor Automation Studio, where automated workflows are called recipes. The grid appears to be where employees would tick off the steps a recipe defines as they end an activity. Without that licence it stays hidden, and there's nothing to configure.

The takeaway for your own layers: when a base field or panel won't show, check the base data rules before assuming it's missing. [Data rules](/kinetic/application-studio/data-rules/) covers reading and overriding them.

## Ending an activity an employee can't end

Now and then an employee ends up in labor they can't get out of from MES. A typical case: they're clocked into two operations at once, and the transactions can't be ended or removed through **Time and Expense Entry**.

A supervisor can end the activity for them:

1. Open **End Activity on Active Labor Header** (to end the employee's whole active labor header) or **End Activity on Active Labor Detail** (to end one activity). Search the menu for "End Activity" if the names differ in your version.
2. Enter the **employee ID**.
3. Select the transaction to end.
4. Click **Process** and wait for it to finish.
5. Reload to confirm the activity is no longer active, then check the resulting labor in **Time and Expense Entry**; hours and quantities may need correcting.

These are server processes, so they behave the same whichever client the supervisor uses.

:::tip
If the same employees get stuck repeatedly, look at why. Clocking into several operations at once may be allowed on purpose (multi-job labor), or a BPM on `Labor.Update` may be blocking the end. [Labor entry BPMs](/platform/bpm/labor-entry-bpms/) covers directives on this method.
:::

---
title: Solution Workbench
description: Package customizations, layers, BAQs, BPMs and reports into a solution and move it between environments, and avoid the version, size and file-format traps.
env: both
sidebar:
  order: 7
---

**Solution Workbench** bundles your custom work (BAQs, dashboards, Application Studio layers, Classic
customizations, BPM directives, Epicor Functions, report styles, menus and more) into a single
**solution** file. You build the solution in one environment (usually Pilot or Test), export it, and
install it in another (usually Live). It is the supported way to promote changes, and it doubles as a
backup of your custom work before an upgrade.

For a worked example that takes a dashboard from build to production, see
[Build a dashboard step by step](/kinetic/application-studio/dashboards/).

## Basic flow

1. In the source environment, open **Solution Workbench** and create a new solution.
2. Add the elements you want to move. Add related items too: a dashboard needs its BAQs, a layer may
   need its menu item.
3. **Build** the solution. This produces the solution file.
4. In the target environment, open **Solution Workbench** and **install** the file.
5. Test in the target, including logging in as a normal user.

<!-- TODO screenshot: Solution Workbench with a solution open and its element list -->

## Rules to know

### You can't go backwards in version

A solution built on a newer release can't be installed on an older one. Build in the same version as
the target, or older. This matters during upgrades, when Pilot is often a release ahead of Live: a
solution built in the upgraded Pilot can't go back into the old Live. Either make the change in Live's
version, or wait until Live is upgraded.

### Keep solutions small

Exporting a very large solution, such as every report style in the system, can run long enough to
freeze or crash the environment. In the cloud that can mean a support case to clear the stuck task or
restore the database. Build solutions around one change or feature, and if you need a broad backup,
split it into several smaller solutions.

### UD fields aren't listed

When you install a solution that relies on [UD fields](/platform/system-admin/ud-fields/), Solution
Workbench doesn't tell you which UD columns it needs. If they don't exist in the target, the BAQs,
layers and BPMs that use them will fail. Keep a list of the UD columns each piece of work depends on,
or compare the UD columns in both environments before you install, and regenerate the data model in the
target first.

### From 2026.1, solutions are .zip, not .cab

Older releases produced solutions as `.cab` files. From Kinetic 2026.1, Solution Workbench only accepts
`.zip` solutions. If you are upgrading from a release before 2025.x and want to keep solutions you built
earlier:

1. Install your `.cab` solutions into an environment on a 2025.x release.
2. Rebuild each solution there and export it as a `.zip`.
3. Upgrade the environment to 2026.1 or later.
4. Install the `.zip` solutions.

Do this before the upgrade: once you are on 2026.1 there's nothing to open the old `.cab` files with.

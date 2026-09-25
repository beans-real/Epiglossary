---
title: Troubleshooting
description: Symptoms, causes and fixes for Kinetic administration problems, including file share errors, hanging BPM and function editors and failing SSRS reports after the Linux migration, Edge Agent errors, and menu items that won't open in the browser.
env: kinetic
sidebar:
  order: 20
sources:
  - title: "EpiUsers: Can't edit Functions, BPMs, or Configurators"
    url: https://www.epiusers.help/t/cant-edit-functions-bpms-or-configurators/132787
  - title: "EpiUsers: Cloud SSRS reports failing since the upgrade"
    url: https://www.epiusers.help/t/cloud-ssrs-reports-failing-since-the-upgrade-on-monday/128812
  - title: "EpiUsers: MES shortcut and accessing MES and Kinetic on same system"
    url: https://www.epiusers.help/t/mes-shortcut-and-accessing-mes-and-kinetic-on-same-system/132783
  - title: "EpiUsers: Bartender labels"
    url: https://www.epiusers.help/t/bartender-labels/132604
  - title: "GitHub Gist: Kinetic on Linux known issues"
    url: https://gist.github.com/Epic-Santiago/c82c06989fec4d3a6d9fc2b59e7da2a3
---

Kinetic-specific administration problems. For problems that apply to both clients (email, scheduled
tasks, data fixes, Solution Workbench) see
[System admin troubleshooting](/platform/system-admin/troubleshooting/).

## After the Linux migration

These appeared when Epicor Cloud environments moved to Linux containers. Background is on
[Linux containers in Epicor Cloud](/kinetic/administration/linux-containers/). Epicor fixes some of them
in later updates, so check the known issues list in the sources as well.

### File integrations fail with "Permission denied" or "Could not find a part of the path"

**Symptom:** anything that reads or writes the file share (BarTender label files, EDI documents,
exports) fails with:

```text
Permission denied
```

or

```text
Could not find a part of the path
```

It usually starts in Pilot while Live, still on Windows, keeps working.

**Cause:** the code or setting uses a Windows UNC path, which doesn't exist on Linux, or the environment's
file share now points somewhere different.

**Fix:** change the path to the Linux mount (`/epi/fs/...` or `/epi/ftp/...`), or in BPMs and functions
use `FilePath` with a `ServerFolder`. Check that `ServerFolder.FileShare` still resolves to the Azure File
Share and not the FTP root. If paths are right and access still fails, open a case: there's no
self-service fix for share permissions. See
[File shares and Linux paths](/kinetic/administration/cloud-file-paths/).

### BPM or function editors hang, or saving never finishes

**Symptom:** after the migration weekend, saving a BPM directive or Epicor Function spins forever, or the
client crashes when opening the editor.

**Cause:** not documented by Epicor. It showed up on many tenants straight after their migration, and
a restart of the application server clears it.

**Fix:** restart the site from the [Cloud Management Portal](/kinetic/administration/cloud-management-portal/)
(**Summary > Restart Site**). That resolves it in most reported cases. If configurator editing hangs as
well, treat it as a separate issue and raise a case.

### A function library is disabled or its functions fail after the move

**Symptom:** functions that worked before the migration now fail, or the library won't publish, with
`ECF1002` or other compile errors, even though Epicor's Linux compatibility report didn't flag it.

**Cause:** the library contains code that doesn't compile or run on the Linux platform, and the
compatibility report missed it.

**Fix:** open the library in Pilot, fix each error it reports (Windows-style file paths are a likely
culprit), and publish it again. Don't rely on the compatibility report to clear your code; compile every
library yourself after Pilot moves.

<!-- TODO verify: whether Epicor automatically disables libraries that fail to compile after the migration, and the exact meaning of ECF1002 -->

### SSRS reports fail with a path length error, or can't be copied

**Symptom:** a report fails to print or preview, or copying a report style fails with a permissions
error.

**Cause:** Epicor adds its own folders to the report path, and a long report style name can push it past
the limit (about 100 characters). The copy permission error is a separate post-migration defect.

**Fix:** give report styles short names. A fix for the length limit was reported for 2025.2.10; until
you're on a release with it, keep names short. For the copy error, open a case.

### Standard reports disappear after an upgrade

**Symptom:** out-of-the-box report styles are missing or can't be selected after an upgrade.

**Cause:** an upgrade defect set the standard reports to inactive in the system's report store.

**Fix:** Epicor Support has a data fix. Open a case. See [Data fixes](/platform/system-admin/data-fixes/).

### The MES URL opens full Kinetic instead of MES

**Symptom:** the data collection URL (`...?mode=DC`) opens the full Kinetic menu rather than MES.

**Cause:** a routing defect on Linux Pilot environments.

**Fix:** until it's corrected, use Office MES or the Classic MES client for testing, and raise a case if a
go-live depends on it.

## Edge Agent

### "Edge Agent not detected"

**Cause:** the agent isn't installed, isn't running, or is older than the version the server expects.
The message shows the installed and available versions when it's an old version.

**Fix:** download and run the installer from the message, and enter the application server URL it shows.
If you can't download it, an administrator must allow the download in Company Maintenance or install it
for you. Check `https://localhost:6071/#/home` to confirm it's running. See
[Edge Agent](/kinetic/administration/edge-agent/).

### Classic forms won't open from the browser

**Symptom:** the Edge Agent reports that the Kinetic classic client executable isn't registered, or that
it couldn't start the desktop client.

**Cause:** the agent was installed without the path to the desktop client's `Epicor.exe`, or with the
wrong one.

**Fix:** find the correct path from the **Target** of the desktop client shortcut (right-click it,
**Properties**), then run the Edge Agent installer again and enter that path at the Kinetic client step.

## Menus

### A menu item works in the desktop client but not in the browser

**Cause:** the item has a Classic program but no Kinetic application. In 2025.2 the standard **Menu
Custom Processes** items shipped this way.

**Fix:** in **Menu Maintenance**, set the item's **Kinetic Application** and save, then log out and back
in. See [Menu Maintenance](/platform/system-admin/menus/#custom-processes-that-dont-open-in-the-browser-20252).

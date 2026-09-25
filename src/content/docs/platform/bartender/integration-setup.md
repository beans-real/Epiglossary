---
title: Integration Builder setup
description: Configure a BarTender file integration that watches the folder Epicor writes .bt files to, prints them, and keeps a clean record of what printed and what failed.
env: both
sidebar:
  order: 2
---

On the BarTender side, printing from Epicor is a **file integration**: a service that polls a folder,
finds each new `.bt` file Epicor writes, prints it, and then moves the file out of the way. In current
BarTender versions you build this in **Integration Builder**; older installs used the separate
Commander application for the same job.

This page covers the settings that matter from Epicor's point of view. Everything else in the
integration can stay at BarTender's defaults. Epicor's knowledge base article KB0107461 lists the
values Epicor Support recommends, based on BarTender 2019. If your version differs, the option names may
too.

## Before you start

- **Know the folder.** You need the path of the folder Epicor writes `.bt` files to, as the BarTender
  server sees it. On-premises that is usually a share on the Epicor server, for example
  `\\epicor-app01\EpicorData\Bartender`. For Epicor's public cloud it is the Azure file share, mapped
  to a drive letter on the BarTender server (see [cloud and Linux](/platform/bartender/cloud-and-linux/)).
- **Use a service account.** Run the BarTender integration service as a domain account that can read,
  rename and move files in that folder, and read the `.btw` templates. Don't rely on whoever happens to
  be logged in.
- **Create a processed folder** on the BarTender server, for example `C:\Bartender\Processed`. Keep it
  separate from the folder Epicor writes to.

## Steps

1. On the BarTender server, open **Integration Builder** and create a new integration.
2. Choose the **File** integration method.
3. Set the **detection options**:

   | Setting | Value | Why |
   |---|---|---|
   | Location | **Computer/Network** | Reads a local path, UNC path or mapped drive. This is the method Epicor certifies |
   | Folder to scan | The `.bt` output folder | Must match the report style's output location |
   | Scan method | **Polling only** | File-system notifications are unreliable on network shares |
   | Polling interval | About **10 seconds** | Fast enough for users waiting at a printer |
   | File pattern | `*.bt` | Ignores processed, failed and other files in the folder |
   | Minimum file size | **1 byte** | Skips empty files that are still being written |

4. Add the action that runs the command script in the file's `%BTW%` header, so BarTender opens the
   template and prints to the printer named in the file.
5. Set **actions after detection** so a printed file is never picked up again:
   - Action: **Move file** to the processed folder.
   - New extension: something like `printed`.
   - Make the file name unique by **appending a timestamp**.
6. Set **actions after failure**:
   - Action: **Rename file**, with a new extension such as `failed`.
   - Again, append a timestamp.
7. Save and deploy the integration, and check that its service is running.

## What you get

With these settings, every `.bt` file ends up in one of two places:

- **Printed files** sit in the processed folder with a `.printed` extension and a timestamp, which
  gives you a history of what printed and when.
- **Failed files** stay in the scan folder, renamed to `.failed`. Because the pattern is `*.bt`, they
  aren't retried in a loop, and they're easy to spot.

:::tip[Reprinting a label]
To print a label again without rerunning anything in Epicor, copy its file from the processed folder
back into the scan folder and give it a `.bt` extension. The integration treats it as new. The same
works for a `.failed` file once you've fixed the cause.
:::

## Notes

- One integration can serve many templates and printers, because each file names its own. You don't
  need an integration per label.
- The printer named in the file must be installed on the BarTender server under exactly that name.
- The processed folder grows forever. Clear out old files on a schedule.

## Related

- [Report styles for BarTender](/platform/bartender/report-styles/): where Epicor writes the files
- [Troubleshooting BarTender labels](/platform/bartender/troubleshooting/)

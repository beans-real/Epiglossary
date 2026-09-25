---
title: Troubleshooting BarTender labels
description: Work out which side of the Epicor to BarTender hand-off failed, and fix labels that don't print, print wrong data, print twice or stop after a server or cloud change.
env: both
sidebar:
  order: 7
---

Every BarTender problem sits on one side of the `.bt` file. So the first question is always the same:
**was a `.bt` file created?**

- **No file:** the problem is in Epicor (report style, task agent, BPM, path).
- **File created but still sitting in the folder:** the BarTender integration isn't picking it up.
- **File renamed to `.failed`:** BarTender picked it up and couldn't print it.
- **File moved to the processed folder but the label is wrong or missing:** the template, the data or
  the printer.

## No .bt file appears

**Cause:** the report task failed, the style points somewhere unexpected, or (for Auto Print) the
directive never fired.

**Fix:**

1. Open the **System Monitor**, find the report task on the history tab, and check its status. An
   error status has a detail message that usually names the problem, such as a path that can't be
   written.
2. Check the style's **Output Location**. On-premises, a blank value means the default
   `Bartender\<CompanyID>` folder under EpicorData, which may not be the folder BarTender watches.
3. For Auto Print, prove the directive runs (a temporary message after the condition) and that its
   condition tests a change, not a state. See [Common BPM problems](/platform/bpm/troubleshooting/).

## Files pile up in the folder and nothing prints

**Cause:** the integration isn't running, isn't looking at this folder, or can't read it.

**Fix:** check the integration service is running on the BarTender server and that its **folder to
scan** is the same folder (as that server sees it) and the file pattern is `*.bt`. Then check the
service account can read, rename and move files there. In the cloud, confirm the mapped drive exists
*for the service account*, not just for the person logged in.

## Files are renamed to .failed

**Cause:** BarTender couldn't carry out the command in the file header. Common reasons:

- The template path in the header (`/AF=`, from the style's **Report Location**) doesn't exist from
  the BarTender server, often a drive letter that is only mapped on someone's PC.
- The printer in the header (`/PRN=`) isn't installed on the BarTender server under that exact name.
- BarTender's license has expired or reverted to trial, for example after the server was moved.

**Fix:** open the `.failed` file in a text editor, read the `%BTW%` line and try the template path and
printer name from the BarTender server itself. BarTender's integration log gives the precise error.
When fixed, rename the file back to `.bt` to print it.

## Labels stopped after a cloud environment moved to Linux

**Symptom:** labels (and often EDI or other file integrations) stop in one environment, typically Pilot
first, while another still works.

**Cause:** the environment now runs on Linux containers, which can't write to Windows UNC paths.

**Fix:** change output paths to the `/epi/fs/...` mount. See
[BarTender with Kinetic cloud and Linux](/platform/bartender/cloud-and-linux/).

## The label prints but fields are blank or wrong

**Cause:** the template's fields don't match the columns in the `.bt` file, usually because the data
definition was changed or the template was designed against a different report.

**Fix:** take a fresh `.bt` file, strip the header and reconnect the template to it as described in
[Label templates and data fields](/platform/bartender/label-templates/#design-against-real-epicor-fields).
Check field names match exactly.

## Designer shows one strange database field

**Symptom:** in BarTender Designer, the database field list shows a single field containing
`%BTW% /AF=…` instead of the report's columns.

**Cause:** Designer was pointed at a raw `.bt` file, so the command header is being read as data.

**Fix:** delete the header lines from a copy of the file, save it as `.txt` and use that as the design
data source.

## Labels print twice, or with another print's values

**Cause:** usually one of:

- The Auto Print condition tests a state ("status is closed") and fires on every later save.
- Two integrations (production and test, or an old server and a new one) watch the same folder.
- A staging table is shared between prints without a unique key, or is cleared at the wrong moment.

**Fix:** use a change-based condition, make sure exactly one integration watches each folder, and key
staged rows uniquely with an age-based cleanup, as in
[Auto-print labels from a BPM](/platform/bartender/auto-print/#staging-values-the-report-doesnt-have).

## Nothing prints from a test environment (or it prints in the warehouse)

**Cause:** the test environment's report styles and Auto Print directives were copied from production.
They either write to a folder nobody watches (nothing prints, no error) or to production's folder
(real labels print).

**Fix:** give every environment its own output folder and decide deliberately whether a BarTender
integration watches it.

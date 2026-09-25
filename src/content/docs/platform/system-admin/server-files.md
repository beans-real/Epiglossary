---
title: Server files and logs
description: Where Epicor keeps the files it writes on the server, and how to download logs, report data and other server files with Server File Download when you can't reach the server directly.
env: both
sidebar:
  order: 11
---

Processes, logs, report data files and integrations all write files on the Epicor server. On-premises
you can usually browse to them. In Epicor Cloud, or when you simply don't have server access, you get
them through **Server File Download**.

## Where files live

Epicor writes most of its working files under a **server data directory** (on-premises, commonly
`C:\EpicorData`), split into company and user folders:

| Kind of file | Typical on-prem location |
|---|---|
| Process logs (MRP, scheduling, posting engine and others) | `EpicorData\Companies\<Company>\Processes\<User>\` |
| Company-level files (multi-company logs and similar) | `EpicorData\Companies\<Company>\` |
| Report data (XML) for printed reports | the server data directory's reports folder |
| Electronic Interface (EI) files | `C:\inetpub\wwwroot\<EpicorAppServer>\Server\Erp\EI\` on the application server |

In Epicor Cloud the same logical folders exist, but the paths are different, and on Linux-based cloud
environments Windows paths don't work at all. See
[File shares and Linux paths in Epicor Cloud](/kinetic/administration/cloud-file-paths/).

## Download a file with Server File Download

1. Open **Server File Download** (**System Management > Schedule Processes > Server File Download**).
2. Choose the **Directory Type**:
   - **User**: files belonging to the logged-in user, such as the logs from processes you ran.
   - **Company**: company-level files, such as multi-company or posting engine logs.
   - **Reports**: the XML data files generated for printed reports.
3. Click **Select File**, browse the folders, and pick the file. The dialog shows each file's date and
   size, which helps you pick the latest log.
4. Choose where to save it: click **Client Path** and pick a local folder.
5. Click **OK**. The file is copied to your computer.

You can only download one file at a time, and you can't delete files from the server with this tool.
In the cloud, these folders are purged periodically by Epicor, so download what you need soon after the
process runs.

:::tip
If the download fails from the Classic desktop client, try the same steps in the Kinetic browser
client. A defect in some 2024 releases broke the desktop
version while the browser version kept working.
:::

## Related pages

- [Scheduled tasks](/platform/system-admin/scheduled-tasks/), where most process logs come from
- [Kinetic administration troubleshooting](/kinetic/administration/troubleshooting/) for file-share errors after the Linux migration

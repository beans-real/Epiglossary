---
title: File shares and Linux paths in Epicor Cloud
description: How files get in and out of an Epicor Cloud environment (Azure File Share, FTP), which paths file-based integrations must use once the environment runs on Linux, and how to reference them from BPMs and functions.
env: kinetic
sidebar:
  order: 5
sources:
  - title: "EpiUsers: Linux containers for Cloud"
    url: https://www.epiusers.help/t/linux-containers-for-cloud/132581
  - title: "EpiUsers: ServerFolder.FileShare repointed to FTP"
    url: https://www.epiusers.help/t/seriously-epicor-decided-to-repoint-my-serverfolder-fileshare-to-my-ftp-i-did-not-request-it-pilot/132866
---

In Epicor Cloud you can't browse the application server's disk. Files that integrations produce or
consume (EDI documents, label files for BarTender, shipping carrier files, import files) go through a
file share that both Epicor and your own systems can reach. How you connect to that share, and how
Epicor code refers to it, changed when Epicor moved cloud environments from Windows to Linux.

## Ways to exchange files with the cloud

| Method | Status |
|---|---|
| **Azure File Share, mapped as a network drive** | The supported and certified option for Public Cloud. Your servers map the share over SMB. |
| **Azure File Share (Government Cloud)** | Supported over SMB on port 445, alongside FTP. |
| **FTP** | Kept for existing installations and multi-tenant systems. Not offered for new Public Cloud setups. |
| Anything else (sync tools, scripts pulling over other protocols) | Allowed at your discretion, but problems with it are outside Epicor Support's scope. |

Two practical catches:

- **Port 445 (SMB) is blocked by many internet providers**, including some large residential and
  business ISPs, and that can't always be changed. Test from the network your integration server
  actually sits on before committing to a mapped drive.
- **Plain FTP sends the user name and password unencrypted.** Avoid it for anything new.

## Paths on Linux environments

Epicor Cloud environments are moving from Windows containers to Linux containers (see
[Linux containers in Epicor Cloud](/kinetic/administration/linux-containers/)). On Linux, **Windows UNC
paths such as `\\server\share\folder` don't work.** Any BPM, function, report or integration setting that
builds a Windows-style path to the file share fails on Linux, even though the same code keeps working on
an environment still running Windows. That is why an integration can work in Live and break in Pilot
during the migration.

Linux environments mount the shares at fixed paths instead:

| Mount | Points to |
|---|---|
| `/epi/fs` | The Azure File Share, or the FTP location if FTP is the only storage configured |
| `/epi/ftp` | The FTP folder, always |

So a folder that used to be `\\fileserver\share\Outbound\Orders` becomes one of:

```text
/epi/fs/Outbound/Orders     (Azure File Share)
/epi/ftp/Outbound/Orders    (dedicated FTP)
```

Use `/epi/fs` if you are keeping the Azure File Share. Use `/epi/ftp` when you want an integration to
work only against FTP, separate from general file share storage. Note the forward slashes, and that Linux
paths are case-sensitive: `/epi/fs/Outbound` and `/epi/fs/outbound` are different folders.

<!-- TODO verify: current Epicor documentation for the /epi/fs and /epi/ftp mount points -->

## In BPMs and Epicor Functions

Code in BPMs and functions shouldn't build file paths as strings at all. Use the sandboxed `FilePath`
class with a `ServerFolder`, which resolves to the right location on either operating system:

```csharp
// Write a CSV to the Outbound\Orders folder of the file share.
// The path is relative to the ServerFolder; no drive, share or mount point.
string csvText = "OrderNum,PartNum,Qty\n10001,PART-1001,5\n";
var path = new FilePath(ServerFolder.FileShare, @"Outbound\Orders\order-10001.csv");

this.Sandbox.IO.File.WriteAllText(path, csvText);
```

<!-- TODO verify: that FilePath subpaths written with backslashes resolve correctly on Linux environments (Epicor's examples use backslashes) -->

- `ServerFolder.FileShare` is the environment's file share (the `/epi/fs` mount on Linux).
- `ServerFolder.Ftp` reaches the FTP folder on its own, so you can use both in one environment.
- `ServerFolder.CompanyData` and `ServerFolder.UserData` are the company and user folders on the server.

Older code in some cloud environments used a helper that converted UNC-style paths. That approach is
deprecated in favor of `FilePath`, and UNC-style paths fail on Linux regardless.

<!-- TODO verify: ServerFolder.FileShare and ServerFolder.Ftp member names; Epicor's Functions guide only documents CompanyData and UserData -->

:::caution[Check where ServerFolder.FileShare points]
There are reports of an environment's `ServerFolder.FileShare` being repointed to the FTP root instead of
the Azure File Share during the migration. If files suddenly land somewhere unexpected, check what the
share resolves to before changing your code, and raise it with Support.
:::

## Checklist for file-based integrations

1. List every integration that reads or writes files: EDI, label printing, carrier software, scheduled
   imports and exports, report output to disk.
2. Find where each one builds its path: BPM or function code, report settings, the external software's
   configuration.
3. Replace UNC paths with `FilePath` in code, and with `/epi/fs/...` or `/epi/ftp/...` in settings that
   take a literal path.
4. Test in Pilot once Pilot is on Linux, before Live migrates.

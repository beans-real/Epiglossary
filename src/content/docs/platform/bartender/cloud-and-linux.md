---
title: BarTender with Kinetic cloud and Linux
description: How the BarTender hand-off works in Epicor's public cloud, and which paths to use once your environment moves to Linux containers, where Windows UNC paths stop working.
env: kinetic
sidebar:
  order: 6
---

In Epicor's public cloud you don't have a Windows server of your own to share a folder from. Epicor
writes `.bt` files to the cloud environment's **Azure file share**, and your BarTender server, a
Windows machine you run, reads them from that share. This page covers that setup and the path change
that comes with Epicor moving cloud environments onto Linux containers.

## The supported cloud setup

- The BarTender server maps a drive (for example `Z:`) to your environment's Azure file share.
- The BarTender integration service runs as a named domain account, and the share's credentials are
  stored for that account. Epicor Cloud Operations provides a script for this; run it while logged in
  as the service account, in a normal (not elevated) PowerShell session, so the credentials land in
  that account's profile.
- The integration's **folder to scan** is the mapped path, for example `Z:\Production\Bartender`.

Epicor certifies only this method, a computer/network path to the file share. FTP-based setups
continue for older installations but aren't the route for new ones.

## What changes with Linux containers

Epicor is moving cloud environments from Windows to Linux containers, usually **Pilot first** and
Production some weeks later. On Linux, Epicor can no longer write to Windows-style UNC paths such as
`\<account>.file.core.windows.net\<share>\…`. Any file-based integration configured with one (BarTender
report styles, EDI, carrier integrations) stops producing files.

Instead, the Epicor side uses Linux mount points:

| Mount | Points to | Use when |
|---|---|---|
| `/epi/fs` | The environment's Azure file share, or the FTP location if that is the only one configured | Default choice; BarTender keeps reading the same share through its mapped drive |
| `/epi/ftp` | The FTP folder | You deliberately keep the integration on the FTP side |

So a report style output location that used to be a UNC path to the share's `Bartender` folder becomes
something like:

```text
/epi/fs/Bartender/Data
```

The BarTender server side doesn't change: it still sees the same files through its mapped drive. Only
the paths *Epicor* writes to change.

:::caution[Pilot and Production can differ for a while]
During the migration window, Pilot may already be on Linux while Production still uses UNC paths.
A style that works in Production can fail in Pilot, and a fix copied from Pilot to Production too early
breaks Production. Check which platform each environment is on before changing paths.
:::

## Checklist when your environment moves

1. List every place a Windows path is stored: BarTender report styles (output location), any BPM or
   function that writes files, and other file integrations.
2. Change each output path to the `/epi/fs/...` equivalent, keeping the same folder structure beneath.
3. Print a test label from each style, confirm the `.bt` file appears in the share, and confirm it
   prints.
4. Keep the template path in **Report Location** as the path the *BarTender server* uses. Epicor only
   copies it into the file; BarTender is the one that opens it.

## Related

- [Report styles for BarTender](/platform/bartender/report-styles/)
- [Integration Builder setup](/platform/bartender/integration-setup/)
- [Troubleshooting BarTender labels](/platform/bartender/troubleshooting/)

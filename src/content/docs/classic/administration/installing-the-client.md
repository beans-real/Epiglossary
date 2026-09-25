---
title: Installing the smart client
description: Install, copy and remove the Epicor smart client on a Windows PC, and set up the desktop shortcuts, including one for MES.
env: classic
sidebar:
  order: 2
---

The smart client has to be installed on each Windows PC that uses it. The install is per machine, but shortcuts and settings can be shared, so a little care up front saves repeating the work on every desk.

## Before you start

- **Local administrator** rights on the PC.
- The installer. For Epicor-hosted (cloud) environments it's downloaded from Epicor's client download site using your **Site ID**; you choose the environments (live, pilot, education...) before downloading, and the installer is built with those options. For on-premise systems, it comes from your server's client deployment share.

## Install

1. Run the installer as administrator and follow the prompts.
2. When it finishes, check where the shortcuts went. Installers commonly put them in the **Public Desktop** folder (`C:\Users\Public\Desktop`) so every user of the PC sees them. Move or rename them there if you want a tidy desktop; Windows asks for administrator confirmation because it's a shared folder.
3. Launch the client once and let it update itself to the server's version before handing the PC over.

The **Education** environment, if you have one, is useful for people working through Epicor's training courses without touching live data.

## A shortcut for MES

MES is the same client started with a switch on the command line. Copy the normal shortcut, rename it (for example **Epicor MES**), open **Properties**, and add the switch to the end of **Target**:

| Switch | Starts |
|---|---|
| `-MES` | MES in normal (run) mode |
| `-MESC` | MES in Developer Mode, for customizing the MES screens |

For example: `C:\Epicor\ERP10\Client\Epicor.exe -MES`. Only give the `-MESC` shortcut to people who customize MES; see [Classic MES overview](/classic/mes/overview/).

## Copying an existing install

On a busy network it can be quicker to copy a working client folder than to run the installer on every PC. Robocopy does it in one line; run it from an elevated prompt on the target PC:

```text
robocopy "\\fileserver\share\EpicorClient" "C:\Epicor\ERP10" /e /r:0 /w:0 /mt:16
robocopy "\\fileserver\share\EpicorShortcuts" "C:\Users\Public\Desktop" /e /r:0 /w:0 /mt:16
```

- `/e` copies all subfolders, `/r:0 /w:0` stops robocopy retrying locked files forever, `/mt:16` copies with 16 threads.
- The first line copies the client itself, the second drops shared shortcuts on the public desktop.
- Keep the source share up to date with the current client version, or every copied PC will immediately download an update.

<!-- TODO verify: whether a copied (non-installed) client needs any prerequisites (e.g. .NET, report viewer runtimes) that the installer would normally add -->

## Removing the client

Run the installer again as administrator and choose to remove the installation. Afterwards, delete the user's local Epicor folder if you want a completely clean slate; see [Clearing the client cache](/classic/administration/troubleshooting/#clearing-the-client-cache).

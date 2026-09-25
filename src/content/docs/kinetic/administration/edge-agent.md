---
title: Edge Agent
description: What the Kinetic Edge Agent does, how it lets the browser client print locally, read local files and open Classic forms, and how to install, test, update and deploy it silently.
env: kinetic
sidebar:
  order: 3
sources:
  - title: "EpiUsers: Edge Agent (for Kinetic UX in the browser)"
    url: https://www.epiusers.help/t/edge-agent-for-kinetic-ux-in-the-browser/99116
---

A web browser is deliberately cut off from the computer it runs on. A page can't list your printers,
send a job to one, or read a file from your disk without asking you to pick it. That's good security,
but it gets in the way of an ERP that needs to print pick lists to the label printer on the desk.

The **Epicor Edge Agent** is a small service you install on each user's computer to bridge that gap.
The Kinetic browser client talks to the agent, and the agent does the local work. You need it for:

- **client printing**: printing straight to a printer installed on the user's computer,
- **local files**: attaching files from the user's machine in some attachment setups, and
- **Classic forms in the browser**: opening a Classic program or customization from the browser menu
  (see [Menu Maintenance](/platform/system-admin/menus/)).

Server-side printing to network printers set up on the server doesn't need the agent.

## How it works

The Edge Agent runs a tiny HTTPS web server on the user's own computer, listening on
`https://localhost:6071`. When Kinetic needs something local, the page sends an ordinary web request to
that address:

1. To list printers, Kinetic asks the agent for the local printer list and gets back JSON with each
   printer's name, whether it's the default, and its status.
2. To print, Kinetic sends the document and the chosen printer name, and the agent submits the job like
   any other Windows program would.

File browsing and uploads work the same way.

A web server anyone could call would be a security hole, so the agent only answers requests that come
from the Epicor application server addresses entered when it was installed. A page from any other site
gets nothing. You can register up to four application server URLs, for example Live, Pilot and Test.

## Install it

**Download the installer**

- Administrators: in **Company Maintenance**, open the overflow menu and choose **Download Edge Agent**
  for the operating system. In the browser client the installer goes to your downloads folder; in the
  desktop client you pick the folder.
- Users without access to Company Maintenance: an administrator ticks **Allow Edge Installer Download**
  in Company Maintenance and saves. The first time a user chooses client printing, Kinetic offers the
  download. The same prompt appears if the installed agent is older than the version the server expects.

**Run the installer**

1. Copy the **application server URL** before you start. Kinetic shows it in the download prompt. It's
   the address of the environment, not of a particular page.
2. Run the installer and accept the defaults until it asks for allowed URLs.
3. Paste the application server URL. Add other environments' URLs in the extra slots if the user works
   in more than one.
4. If it asks for the Kinetic desktop client, point it at `Epicor.exe` for the matching environment.
   This is needed only to open Classic forms from the browser.
5. Finish the install. Two new icons appear in the system tray: **Epicor Edge Agent** (logs and the
   diagnostics page) and **Epicor Print Tray** (advanced print options).

<!-- TODO screenshot: Edge Agent installer page where the allowed application server URLs are entered -->

## Test it

With the agent running, open `https://localhost:6071/#/home` in the browser. The diagnostics page shows
the agent's status and lets you list printers and try a test print. If the page doesn't load, the agent
isn't running.

## Keep it up to date

When Epicor releases a newer agent than the one installed, Kinetic prompts the user to download it the
next time they use a feature that needs it. Run the new installer the same way. The installer is
large (around 200 MB), which matters if you are updating many machines over a slow link.

## Deploy it silently

For more than a handful of machines, install it unattended with your software deployment tool or a
login script. The installer accepts command-line options for an unattended install, the allowed server
URL and the path to the desktop client:

```powershell
# Install the Edge Agent silently for one Kinetic environment, if it isn't already installed.
$installer = '\\fileserver\share\EdgeAgent\edgeagent-kinetic-windows-x64-installer.exe'
$appServer = 'https://epicor-app01.example.com/Kinetic'

$uninstallKeys = Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall' |
    Select-Object -ExpandProperty PSChildName
if ($uninstallKeys -contains 'Epicor Edge Agent') { return }

# Find the desktop client whose .sysconfig points at this environment (optional, for Classic forms)
$config = Get-ChildItem 'C:\Epicor' -Filter '*.sysconfig' -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { ([xml](Get-Content $_.FullName)).configuration.appSettings.AppServerURL.value -eq $appServer } |
    Select-Object -First 1

$installArgs = @(
    '--mode', 'unattended',
    '--unattendedmodeui', 'none',
    '--installMode', 'localInstall',
    '--allowedURL', $appServer
)
if ($config) {
    $clientExe = Join-Path (Split-Path (Split-Path $config.FullName)) 'Epicor.exe'
    $installArgs += @('--clientExePath', "`"$clientExe`"")
}

Start-Process -FilePath $installer -ArgumentList $installArgs -Wait
```

How it works:

- It skips machines where the agent is already registered as installed.
- It looks for a desktop client `.sysconfig` whose `AppServerURL` matches the environment, and takes
  `Epicor.exe` from the client folder above it. On machines without the desktop client it installs the
  agent for printing only.
- `--allowedURL` sets the application server the agent will accept requests from.

Change `$installer` and `$appServer` for your environment. Run it with administrator rights.

<!-- TODO verify: the Edge Agent Configuration menu item mentioned for mass installs, and whether it replaces or complements a scripted install -->

## If it doesn't work

See [Kinetic administration troubleshooting](/kinetic/administration/troubleshooting/#edge-agent) for
"Edge Agent not detected", older-version and desktop-client path errors.

---
title: Classic client troubleshooting
description: Fix smart-client problems that live on the user's PC, including stale dashboards and forms, the IceShell LogonDialog constructor error, and "An item with the same key has already been added" at sign-in.
env: classic
sidebar:
  order: 4
---

Many "Epicor is broken for just this one person" problems come from the smart client's local cache or the user's saved personalizations rather than the server. These are the ones that come up most.

## Clearing the client cache

**Symptom**: one user sees an old version of a dashboard or customization after it was redeployed, a form behaves differently on one PC, or the client fails to start after an update.

**Cause**: the client caches downloaded assemblies, including the compiled DLL for every dashboard a user has opened, under the user's local profile.

**Fix**:

1. Close every Epicor window on the PC, including the System Monitor.
2. Delete the `Epicor` folder in the user's local application data: `C:\Users\<user>\AppData\Local\Epicor`.
3. Empty the user's temp folder: `C:\Users\<user>\AppData\Local\Temp` (skip files Windows says are in use).
4. Start Epicor again. The first launch is slower while the cache is rebuilt.

:::tip
Typing `%LOCALAPPDATA%` into the Explorer address bar takes you straight to the current user's `AppData\Local` folder.
:::

## "The invocation of the constructor on type 'IceShell.Apps.LogonDialog'..."

**Symptom**: an error mentioning the constructor of `IceShell.Apps.LogonDialog` appears when opening (or closing) Epicor. Reinstalling the client doesn't help.

**Cause**: corrupt local client data in the user's profile. A reinstall doesn't touch the profile, which is why it has no effect.

**Fix**: delete the user's `AppData\Local\Epicor` folder as described in [Clearing the client cache](#clearing-the-client-cache), then start Epicor again.

## "An item with the same key has already been added" at sign-in

**Symptom**: after an upgrade (seen after moving to 10.2.600), a user can sign in with the Classic menu style but gets `An item with the same key has already been added` when using any other menu style.

**Cause**: the user has personalizations of the main menu saved by the older version (the `MainMenuHistory` and `MainMenuLayout` personalizations) that clash with the newer menu styles.

**Fix**:

1. Open **Personalization Purge** (**System Management > Purge/Cleanup Routines > Personalization Purge**).
2. Find the user and select their personalizations for the main menu history and layout.
3. Purge them. The user can then sign in with the newer menu styles and rebuild their layout.

If the user still can't sign in to the Modern Shell after a purge (the client freezes and has to be closed from Task Manager), Epicor's system administration guide describes removing the user's personalization tables on the server. That's a database-level fix; involve whoever administers your database and take a backup first.

## Still stuck?

- Start the form in Developer Mode and choose **Base Only**. If the problem goes away, it's in a customization or personalization rather than the client install.
- Turn on client tracing and repeat the problem; the trace shows the failing server call. See [Find the method a screen calls](/platform/bpm/finding-the-right-method/).

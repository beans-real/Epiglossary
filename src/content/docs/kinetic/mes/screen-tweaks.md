---
title: MES screen tweaks
description: Give users a one-click link to browser MES from the Kinetic home page, and show a live clock on an MES screen using a client-side timer instead of server calls.
env: kinetic
sidebar:
  order: 2
---

Two small changes that shop-floor users ask for often.

## A home-page link to MES

Users who use both the normal Kinetic menu and MES in the browser shouldn't have to remember or type the MES address. Add a web link widget to their Kinetic home page that points at MES:

1. Open MES in the browser once and copy the address from the address bar.
2. On the Kinetic home page, add a widget and choose the web link type.
3. Paste the MES address, give it a clear title such as **Shop floor (MES)**, and save the home page.

For shared shop-floor PCs, a browser shortcut on the desktop that opens straight into MES does the same without a home page at all.

## A live clock on an MES screen

Operators like to see the current time on the screen they clock in from. It's tempting to fetch the time from the server, but a server call every second from every shop-floor PC adds up quickly. The browser already knows the time, so do it all client-side: one data view column, one control, and two events.

1. **The column.** Pick a scratch column to hold the time, for example `TransView.XX_CurrentTime`. `TransView` columns don't need to be declared; binding to one creates it.
2. **The control.** In the Layout designer, add a text box where you want the clock, name it `txtClock`, bind it to `TransView.XX_CurrentTime` and make it read-only.
3. **An event that sets the time.** Create an event, say `XX_UpdateClock`, with no trigger. Give it a `row-update` action that sets `TransView.XX_CurrentTime` to the expression:

   ```js
   '#_new Date().toLocaleString()_#'
   ```

   The `#_..._#` wrapper runs JavaScript in the browser; see [Expressions and JavaScript](/kinetic/application-studio/expressions/).

4. **An event that starts the clock.** Create a second event triggered when `txtClock` is **created**. Give it the same `row-update` (so the clock shows immediately), then a timer widget that calls `XX_UpdateClock` every second (check which interval unit the widget expects).

Use `toLocaleTimeString()` instead of `toLocaleString()` for the time without the date. The value is display-only and never saved, because nothing writes `TransView` back to the server.

:::tip
The same timer pattern can refresh a data view on a schedule (for example a work-queue grid every minute). Keep the interval as long as users can tolerate, because unlike the clock, a refresh does call the server.
:::

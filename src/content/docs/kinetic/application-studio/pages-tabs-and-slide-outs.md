---
title: Pages, tabs and slide-outs
description: Understand Application Map page types, add a new page, put tabs inside a panel card, give a dashboard one tab per grid, and open a slide-out panel from an event.
env: kinetic
sidebar:
  order: 4
---

The **Application Map** designer shows how an application's pages hang together: the landing page, the tabs, the pages under each tab and any slide-out panels. This page covers the page types you'll meet and the three ways to split content into tabs.

## Page types

Select a page in the Application Map to see its properties. **Page Type** decides how it behaves:

| Page type | What it is |
|---|---|
| **Apps** / **Dashboard** (landing) | The root. Defines what users see when the app opens, usually a grid bound to the `LandingPage` data view |
| **Tab** | A top-level tab shown after a record is selected. Its child pages appear in the navigation tree under it |
| **TabPage** | An ordinary content page. This is the type you use for new pages and for pages shown in a tab strip |
| **SlidingPanel** | A panel that slides in from the right when an event opens it. These sit in the separate **Slide Out Panels** area of the map |

You'll also see **virtual pages**. These aren't a type you pick. A panel card with **Enable FullScreen** turned on shows up in the map as a page, because clicking its full-screen button behaves like navigating to a page.

Other page properties worth knowing:

- **Page Caption** can include placeholders, for example `Job {JobHead.JobNum}`, to show the current record in the title.
- **Tab Id** says which tab the page belongs under.
- **Page Peer Order** sets its position among its siblings.

![Application Map of an entry screen: the landing page, the entry Tab and its child pages, with a SlidingPanel page selected in the separate Slide Out Panels area and its properties on the right](/images/81ae92801210e407a1c3867e377a153b98b7dfff-2-690x348.png)

## Add a new page

1. In the Application Map, select the page that should be the parent and click **Add** (the **+** icon).
2. Select the new page and set **Name**, **Caption** and **Page Type** (keep **TabPage**).

   ![A new page added under the entry page in the Application Map, with its Name, Caption, Page Type TabPage and Parent shown in page-details](/images/pasted-image-20260803104435.png)

3. Click **Edit** and add controls.
4. Save the layer and preview.

## Tabs inside a panel card

To split a panel card's content into tabs, use a **panel card stack** (`metafx-panel-card-stack`). It shows a row of tab headers, each switching to a different panel card.

![A panel card stack showing a row of tab headers such as Purchasing, Costs and Comments](/images/pasted-image-20250922105839.png)

1. Add the panel cards that should become tabs to the page first. Each one is a separate panel card on the same page.
2. Select the panel card stack (or add one from the Toolbox) and open its **Panels** property.
3. The list shows every panel card on the page. Tick the ones that should appear as tabs and drag them into order.

A panel card that isn't ticked stays a normal card on the page. Ticking it moves it into the stack as a new tab.

![The metafx-panel-card-stack Panels list with the existing tabs ticked and a newly added Purchase By panel card unticked at the bottom; ticking it adds it as the next tab](/images/pasted-image-20250922105949.png)

A panel card grid also has a **Make Card Stack** button at the top of its properties, which looks like a quicker way to start a stack from an existing grid card.

<!-- TODO verify: what Make Card Stack does exactly (wraps the selected card in a new panel card stack?) -->

## One tab per grid on a dashboard

For a dashboard with several grids, separate **TabPage** pages plus a tab component on the parent page give a cleaner result than stacking grids in one card.

1. In the Application Map, add a page under the dashboard's main page for each tab. Set **Page Type** to **TabPage**.
2. Edit each TabPage and put its grid (and anything else for that tab) on it. Anything meant to show inside a tab has to be built *on that TabPage*, not on the parent.
3. Edit the parent page and add a **Tab** component from the Toolbox (search for "tab").

   ![Toolbox Components search for "tab" returning the Tab component](/images/pasted-image-20260804153624.png)

4. In the tab component's data properties, add an entry per tab: an **Id**, a **Title** and the **Page** to show.
5. Save and preview.

Keep each TabPage's **Name**, its **Tab Id** and the tab's **Title** consistent. Mismatches are a common reason a tab shows up blank.

<!-- TODO verify: whether Name / Tab Id / Title must match exactly for dashboard TabPages, or only for tabs added to an application's main tab strip -->
<!-- TODO screenshot: Application Map with two TabPages under a dashboard's main page, and the Tab component's data list showing Id, Title and Page for each -->

## Slide-out panels

A slide-out is a page with **Page Type** `SlidingPanel`. It doesn't appear in navigation. An event opens it.

1. In the Application Map, add a page and set its **Page Type** to **SlidingPanel**. It moves to the **Slide Out Panels** area.
2. Note its **Name**, for example `XX_PageHistory`.
3. Edit it and add content, typically a panel card grid bound to a data view.
4. In the event that should open it (a button or tool click), end the chain with the `slider-open` widget and set its **Page** parameter to the panel's **Name**.

   ![A slider-open widget at the end of a click event, with its Page parameter set to the Name of the SlidingPanel page](/images/ba78d49f32c8818620e018a7d30786e8949da207-2-690x348.png)

Load the data *before* `slider-open` in the same event, so the panel opens already filled. [Calling BAQs, services and functions](/kinetic/application-studio/calling-services/#example-a-change-log-slide-out) has a full example that fetches a record's change log and shows it in a slide-out.

Slide-out properties include **Show Title**, **Show Buttons**, **Hide Close Icon** and **Collapse On Outside Click**, plus **Add Buttons** for buttons along the panel that can trigger events of their own.

---
title: Kinetic MES overview
description: What changes when MES runs in the Kinetic browser client, how its screens are customized with Application Studio, and what's covered in this section.
env: kinetic
sidebar:
  order: 1
---

Kinetic MES is the shop-floor menu (clock in and out, start and end activities, report quantity, material requests) rebuilt as a Kinetic application. It runs in the browser or the Kinetic desktop wrapper, and its screens are customized with **Application Studio** layers like any other Kinetic screen. Classic MES customizations don't carry over. If you're coming from Classic, [Classic MES overview](/classic/mes/overview/) and [Migrating to Kinetic](/classic/migrating-to-kinetic/) explain what has to be rebuilt.

## Customizing Kinetic MES

- Open the MES screen (or the program it launches, such as **End Activity**) in **Application Studio** and create a layer, as described in [Application Studio overview](/kinetic/application-studio/overview/).
- Hide or add fields in the Layout designer, react to buttons with events, and style or hide things with data rules. Base MES screens already use data rules to hide sections your licence doesn't cover; see [End Activity: the Actions grid and stuck activities](/kinetic/mes/end-activity/).
- Keep business logic on the server. A button's event should call an Epicor Function or a BPM-backed method rather than stringing together many client-side calls; see [Report quantity from an Epicor Function](/kinetic/mes/quantity-from-a-function/).
- Barcode scanners behave the same as in Classic: they type. The advice on letting MES validate the job before the next field arrives applies unchanged; see [Barcode scanning in MES](/classic/mes/barcode-scanning/#option-2-program-the-scanner-to-pause).

## In this section

| Page | What it covers |
|---|---|
| [MES screen tweaks](/kinetic/mes/screen-tweaks/) | A home-page link to browser MES, and a live clock on an MES screen with no server calls |
| [End Activity: the Actions grid and stuck activities](/kinetic/mes/end-activity/) | Why the Actions section is hidden, and how to end an activity an employee can't end themselves |
| [Report quantity from an Epicor Function](/kinetic/mes/quantity-from-a-function/) | Reporting quantity for one or many operations server-side, called from an MES button |
| [Per-employee language in MES](/kinetic/mes/employee-language/) | Why MES can't switch language per clocked-in employee, and what to avoid while trying |

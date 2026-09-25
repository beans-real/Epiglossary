---
title: About Epiglossary
description: What this wiki is, who it's for, and how it's organised.
sidebar:
  order: 1
---

Epiglossary is a practical guide to Epicor ERP, covering both **Kinetic** (the browser client) and **Epicor 10** (the classic smart client). It focuses on what the official documentation tends to leave out: the gotchas, the workarounds, and the "why is it doing that" explanations you usually only get from experience or a long forum thread.

## Who it's for

- **Developers and admins** building BPMs, Epicor Functions, Application Studio layers, BAQs and reports.
- **Power users** who want to understand how a process such as job costing, inventory transactions or scheduling works under the hood.
- **Anyone moving from Classic to Kinetic** who needs to know what changed.

## How it's organised

| Section | What's in it |
|---|---|
| **Kinetic** | Browser-client topics: Application Studio, Kinetic dashboards, debugging |
| **Classic (E10)** | Smart-client topics: customizations, `oTrans`, Event Wizard |
| **Platform** | Server-side tools that work in both clients: BPMs, Functions, BAQs, SSRS, REST, DMT |
| **Processes** | How the business flows work: jobs, inventory, scheduling, purchasing, shipping, finance |
| **Reference** | Lookup tables such as inventory transaction types |

Every article shows a badge for the client it applies to: <span style="color:var(--eg-kinetic)">**Kinetic**</span>, <span style="color:var(--eg-classic)">**Classic (E10)**</span>, or <span style="color:var(--eg-both)">**Kinetic + Classic**</span>. See [Kinetic vs Classic](/start/kinetic-vs-classic/) for what the difference means in practice.

## A note on sources

Every page is written in our own words. Where a page was informed by a public forum thread or article, it's credited in a **Sources** list at the bottom. Examples use placeholder data (`EPIC06`, `PART-1001`, `XX_` prefixes) and are written for teaching. Test anything in a non-production environment first.

:::note
Epiglossary is an independent community project. It is not affiliated with, endorsed by, or supported by Epicor Software Corporation.
:::

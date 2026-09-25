---
title: Tools and links
description: A short, curated list of public communities, Epicor resources and utilities that are genuinely useful when building, supporting or troubleshooting Epicor.
env: both
sidebar:
  order: 10
---

A handful of places and tools that repay the time it takes to learn them. Everything here is public or
available to any Epicor customer; nothing is an endorsement, and third-party tools are used at your own
risk. For the best community catalogues (EpiUsers' Experts' Corner, the Kinetic Control Compendium and
the How-To series), see [How to use Epiglossary](/start/how-to-use/#the-best-catalogues-outside-epiglossary).

## Community

- **[EpiUsers](https://www.epiusers.help/)**: the independent Epicor user forum. The first place to
  search for an error message or a "has anyone done…" question, with years of worked answers.
- **[Epicor Ideas](https://epicor.ideas.aha.io/ideas)**: Epicor's enhancement request portal. Search
  before posting and vote on existing ideas; votes are how requests get noticed.
- **[The XY Problem](https://xyproblem.info/)**: a one-page read on asking about your real goal
  rather than your attempted fix. Worth reading before posting on any forum.

## Epicor resources

- **Application help**: press **F1** on a field or screen in Kinetic to open the help for it. The
  help explains fields and processes and is often faster than searching.
- **[EpicWeb documentation archive](https://epicweb.epicor.com/doc/Pages/KineticERP-Archive.aspx)**
  (customer login): user guides, technical reference guides and release documents by version.
- **EpicCare Problem Repository** (customer login): in EpicCare, **Other Resources > Problem
  Repository** lists every known problem record (PRB), which is useful when you suspect a bug rather
  than a setup issue.
- **[Epicor status page](https://status.epicor.com/)**: cloud incidents and scheduled maintenance and
  upgrade windows, useful to check before blaming your own configuration.
- **[GingerHelp: an overview of Kinetic for developers](https://www.gingerhelp.com/knowledgebase-epicor-erp/an-overview-of-kinetic-for-developers)**:
  a readable orientation for developers coming to Kinetic.

## Development and troubleshooting

- **[Kinetic Trace Helper Utility](https://www.epiusers.help/t/kinetic-trace-helper-utility-1-0-kinetic-web-chrome-extension/108390)**
  (Kinetic): a browser extension that captures and presents the business object calls a Kinetic
  screen makes, which is the quickest way to find the method a BPM should hook. See
  [Find the method a screen calls](/platform/bpm/finding-the-right-method/).
- **[Trace Helper Utility for Epicor 10](https://www.epiusers.help/t/trace-helper-utility-for-epicor-erp-10/58018)**
  (Classic): the same idea for trace logs from the smart client.
- **[Epicor Test Automation Platform](https://chromewebstore.google.com/detail/epicor-test-automation-pl/enljieokdddhaghlhnidgmnodgihibna)**
  (Kinetic): the Chrome extension for Epicor's Test Automation Platform, used to build automated tests of
  Kinetic screens.
- **[dotPeek](https://www.jetbrains.com/decompiler/)**: a free .NET decompiler. Open Epicor's server
  assemblies to see what a business object method actually does and which parameters it expects.
- **SQL Server Management Studio (SSMS)**: Microsoft's free SQL Server client, for on-premises sites
  that can query the Epicor database directly. Use it to read and to test queries, never to update
  Epicor tables.

## Labels and barcodes

- **[Seagull Scientific support](https://support.seagullscientific.com/)**: BarTender documentation,
  licensing help and [downloads](https://www.seagullscientific.com/support/downloads/). See
  [BarTender and labels](/platform/bartender/overview/).
- **[Zebra 123Scan](https://www.zebra.com/us/en/support-downloads/software/scanner-software/123scan-utility.html)**:
  configures Zebra barcode scanners, for example adding the Enter or Tab suffix that MES and handheld
  screens expect after a scan.
- **[QuickChart](https://quickchart.io/)**: returns a QR code image from a URL, such as
  `https://quickchart.io/chart?cht=qr&chs=300x300&chl=PART-1001`. Handy for dashboards and reports,
  but the value is sent to a third party, so don't encode anything sensitive.
- **[Epicor Kinetic Warehouse installation guide](https://biscit.atlassian.net/wiki/spaces/BP/pages/2527756289/EKW+Installation+Guide)**
  (Kinetic): the partner's install guide for the Kinetic Warehouse handheld app.

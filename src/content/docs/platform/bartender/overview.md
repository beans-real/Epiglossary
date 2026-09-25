---
title: BarTender and labels overview
description: How Epicor hands label data to Seagull Scientific's BarTender through .bt trigger files, who supports which half, and where to start when setting up or fixing label printing.
env: both
sidebar:
  order: 1
sources:
  - title: "Seagull Scientific support portal"
    url: https://support.seagullscientific.com/
  - title: "Seagull Scientific downloads"
    url: https://www.seagullscientific.com/support/downloads/
---

BarTender, from Seagull Scientific, is the label design and printing product most Epicor sites use for
shipping labels, material tags, part labels and anything else with a barcode on it. Epicor doesn't
print the label itself. It writes a small data file, and BarTender picks that file up, merges it into a
label template and sends it to a printer.

Once you understand that hand-off, most setup questions and most "the label didn't print" problems
become a matter of working out which side of it has gone wrong.

## How the integration works

1. A user (or a BPM) runs a report whose **report style** has the report type **Bartender Labels**.
2. Epicor's task agent gathers the report data and writes a **`.bt` file** to the style's output folder.
3. A **BarTender integration** running on a Windows server watches that folder. When a new `.bt` file
   appears, it reads the file and prints the label.
4. The integration moves or renames the file so it isn't printed twice.

The `.bt` file is plain text with two parts:

| Part | What it holds |
|---|---|
| Command header | A line wrapped in `%BTW% … %END%` that tells BarTender which template to open (`/AF=`), which printer to use (`/PRN=`) and how to read the data that follows |
| Data | A header row of field names, then one row per label record, taken from the report's data definition |

Because the template path and the printer name travel *inside* the file, both must make sense from the
BarTender server's point of view, not from the Epicor server's or the user's PC.

## Which reports can print labels

Epicor ships generic label reports that already have a BarTender style, each with its own report data
definition:

| Report ID | Typical label |
|---|---|
| `GenShip` | Shipping and carton labels from a customer shipment |
| `GenInv` | Inventory and bin labels |
| `GenJob` | Job and material tags |
| `GenRcpt` | Receiving labels |
| `GenSO` | Sales order labels |
| `GenQA` | Inspection and quality labels |

<!-- TODO verify: the "typical label" column is inferred from the report IDs; confirm each report's intended use in Report Style Maintenance -->

Start from one of these rather than building from scratch. You can copy the style, point it at your own
template, and extend a copy of its data definition if the label needs more fields.

## Who supports what

- **Epicor** supports the Epicor half: producing a correct `.bt` file in the right place.
- **Seagull Scientific** supports BarTender itself: installation, the integration service, templates,
  printer drivers and BarTender errors. Their support portal has guides, version history and
  licensing troubleshooting.
- If you bought BarTender through Epicor, Epicor manages the license file. Moving BarTender to a new
  server makes it fall back to a trial license, so request a new license file *before* you migrate.

:::caution[BarTender Cloud is a different thing]
Seagull's own "BarTender Cloud" product is not the same as running BarTender alongside Epicor's cloud
ERP. Cloud ERP sites still normally run BarTender on a Windows machine they manage, reading files from
the cloud file share. See [BarTender with Kinetic cloud and Linux](/platform/bartender/cloud-and-linux/).
:::

## Pages in this section

**Setting up**

- [Integration Builder setup](/platform/bartender/integration-setup/): the BarTender side, watching a
  folder for `.bt` files
- [Report styles for BarTender](/platform/bartender/report-styles/): the Epicor side, where the file
  is written and which template it names
- [Label templates and data fields](/platform/bartender/label-templates/): where to keep `.btw`
  files, designing against real Epicor fields, multi-page labels

**Automating**

- [Auto-print labels from a BPM](/platform/bartender/auto-print/): print on an event, and stage extra
  label data

**Environments and fixes**

- [BarTender with Kinetic cloud and Linux](/platform/bartender/cloud-and-linux/): file share paths
  after the move to Linux containers
- [Troubleshooting BarTender labels](/platform/bartender/troubleshooting/)

## Further reading

- [EpiUsers: How to print from Epicor using BarTender](https://www.epiusers.help/t/how-to-print-from-epicor-using-bartender/89143)
- [EpiUsers: Insights 2024 REST API and BarTender](https://www.epiusers.help/t/insights-2024-rest-api-bartender/115692),
  an alternative where BarTender pulls data from Epicor's REST API instead of reading trigger files

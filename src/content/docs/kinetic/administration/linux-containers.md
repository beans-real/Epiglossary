---
title: Linux containers in Epicor Cloud
description: What Epicor's move of cloud environments from Windows to Linux containers changes for customers, how to tell which one you're on, and what to check before and after your environment migrates.
env: kinetic
sidebar:
  order: 6
sources:
  - title: "EpiUsers: Linux containers"
    url: https://www.epiusers.help/t/linux-containers/124345
  - title: "EpiUsers: Linux containers for Cloud"
    url: https://www.epiusers.help/t/linux-containers-for-cloud/132581
  - title: "EpiUsers: Can't edit Functions, BPMs, or Configurators"
    url: https://www.epiusers.help/t/cant-edit-functions-bpms-or-configurators/132787
  - title: "EpiUsers: MES shortcut and accessing MES and Kinetic on same system"
    url: https://www.epiusers.help/t/mes-shortcut-and-accessing-mes-and-kinetic-on-same-system/132783
  - title: "EpiUsers: SaaS URLs"
    url: https://www.epiusers.help/t/saas-urls/132438
  - title: "EpiUsers: Bartender labels"
    url: https://www.epiusers.help/t/bartender-labels/132604
  - title: "EpiUsers: Cloud SSRS reports failing since the upgrade"
    url: https://www.epiusers.help/t/cloud-ssrs-reports-failing-since-the-upgrade-on-monday/128812
  - title: "EpiUsers: NGINX update breaking BAQ APIs"
    url: https://www.epiusers.help/t/nginx-update-breaking-baq-apis/133064
  - title: "EpiUsers: Did API v1 of Erp.BO.PartSvc Parts change over the weekend?"
    url: https://www.epiusers.help/t/did-api-v1-of-erp-bo-partsvc-parts-change-over-the-weekend/132886/55
  - title: "GitHub Gist: Kinetic on Linux known issues"
    url: https://gist.github.com/Epic-Santiago/c82c06989fec4d3a6d9fc2b59e7da2a3
---

Starting with the 2025.2 release, Epicor began moving Epicor Cloud environments from Windows containers
to **Linux containers**. Pilot environments moved first, from early 2026, with production environments
following region by region. Kinetic itself looks the same to users, but anything that depended on the
server being Windows can break: file paths, some custom code, report styles and a few URLs.

This page is for cloud administrators preparing for, or cleaning up after, the move. On-premises
installations are not affected.

## Which one am I on?

Open the environment's tenant instance in the
[Cloud Management Portal](/kinetic/administration/cloud-management-portal/). The **Host OS** field on
the **Summary** tab shows **Windows** or **Linux**. Check Pilot and Live separately: during the
migration they are often on different platforms, which is why something can work in Live and fail in
Pilot.

## What changes

| Area | What to expect |
|---|---|
| **File paths** | Windows UNC paths don't work. File shares are mounted at `/epi/fs` and `/epi/ftp`, and code should use `FilePath` and `ServerFolder`. See [File shares and Linux paths](/kinetic/administration/cloud-file-paths/). |
| **Custom code** | BPMs and functions that use Windows-only .NET features, or that fail compilation checks, may be disabled or stop working. |
| **SSRS report styles** | Long report style names can push the internal report path over its length limit. Copying styles and previewing reports have had permission and data source errors. |
| **URLs and proxies** | Environment URLs and the proxies in front of them changed for some tenants. Hard-coded URLs in integrations, REST clients and shortcuts may need updating. |
| **MES** | The data collection mode URL didn't route to MES on some Linux Pilots. |

## Before your environment moves

1. **Inventory file-based integrations** (EDI, BarTender, carrier software, imports and exports) and
   update their paths. This is the biggest source of breakage.
2. **Review custom code.** Epicor provides a Linux compatibility report that flags problem code, but it
   has missed real problems, including function libraries with compile errors. Open and compile your
   function libraries and BPMs yourself in Pilot after it moves; don't rely on the report alone.
3. **Shorten long SSRS report style names.**
4. **Record the URLs your integrations use**, and retest them after the move.
5. **Test in Pilot** once it's on Linux, with the same checklist you'd use for an upgrade, before Live is
   scheduled.
6. **Watch the known issues list** Epicor staff maintain (linked in the sources below), and the EpiUsers
   threads, which often find problems first.

## After the move

If something breaks, check [Kinetic administration troubleshooting](/kinetic/administration/troubleshooting/#after-the-linux-migration)
for the known symptoms. For file share access problems there's no self-service fix beyond correcting
your own paths: open a case.

---
title: Kinetic administration overview
description: A map of administration topics that only apply to Kinetic and Epicor Cloud, including the browser client, Edge Agent, Cloud Management Portal and the move to Linux containers.
env: kinetic
sidebar:
  order: 1
---

Kinetic moved Epicor into the browser and, for many customers, into Epicor's cloud. That brings its own
administration jobs: getting the browser client to talk to local printers, managing cloud environments
without access to the server, and adapting integrations as Epicor changes the platform underneath them.

This section covers those Kinetic- and cloud-specific topics. Administration that works the same in both
clients (scheduled tasks, email, identity, UD fields, Solution Workbench, sites, data fixes) is in
[System admin](/platform/system-admin/overview/).

## Pages in this section

- [Browser client, Power Tools and user settings](/kinetic/administration/clients/): browser client and MES URLs, installing Power Tools for a cloud environment, preview features, and loading more than 5000 search results.
- [Edge Agent](/kinetic/administration/edge-agent/): what the local agent does for printing, files and Classic forms, and how to install, test and deploy it silently.
- [Cloud Management Portal](/kinetic/administration/cloud-management-portal/): self-service for Epicor Cloud, including site and task agent restarts, database refreshes, data model regeneration and updates.
- [File shares and Linux paths in Epicor Cloud](/kinetic/administration/cloud-file-paths/): how to move files in and out of the cloud, and the `/epi/fs` and `/epi/ftp` paths integrations must use on Linux.
- [Linux containers in Epicor Cloud](/kinetic/administration/linux-containers/): what the Windows-to-Linux move changes and what to check before and after it.
- [Troubleshooting](/kinetic/administration/troubleshooting/): post-migration errors, Edge Agent problems and menu items that won't open in the browser.

## Where to start

- **New to Epicor Cloud administration?** Get [Cloud Management Portal](/kinetic/administration/cloud-management-portal/) access first. Most routine fixes start there.
- **Rolling out the browser client?** Plan the [Edge Agent](/kinetic/administration/edge-agent/) deployment before users need to print.
- **Your cloud environment is moving to Linux?** Read [Linux containers](/kinetic/administration/linux-containers/) and fix your [file paths](/kinetic/administration/cloud-file-paths/) before Pilot moves.

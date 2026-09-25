---
title: System admin overview
description: A map of Epicor system administration topics that apply to both Kinetic and Classic, from scheduled tasks and email to identity, UD fields, solutions, sites and data fixes.
env: both
sidebar:
  order: 1
---

System administration in Epicor is the work that keeps the environment running for everyone else:
background tasks that run on time, email that arrives, users who can sign in, custom fields that exist
where developers expect them, and changes that move safely from test to production.

The pages in this section apply to both the Kinetic and Classic clients, and mostly to both on-premises
and Epicor Cloud installations. Where the two differ, each page says so. Topics that only exist in Kinetic
or Epicor Cloud (the Edge Agent, the Cloud Management Portal, the move to Linux containers) are under
[Kinetic administration](/kinetic/administration/overview/).

## On-premises vs Epicor Cloud

Much of the difference comes down to who has access to the server:

| Task | On-premises | Epicor Cloud |
|---|---|---|
| Restart the task agent | Task Agent Service Configuration on the server | Cloud Management Portal |
| Regenerate the data model | Administration Console, then recycle the app pool | Cloud Management Portal |
| Import and run a data fix | Administration Console, then Data Fix Workbench | Epicor Support runs it |
| Get log files | Browse the server, or Server File Download | Server File Download |
| Enable country functionality | Administration Console licensing | EpicCare case |

## Pages in this section

**Keeping things running**

- [Scheduled tasks, the System Agent and the task agent](/platform/system-admin/scheduled-tasks/): schedule reports so they repeat, find and remove scheduled tasks, restart the task agent.
- [Email delivery and SPF](/platform/system-admin/email-delivery/): trace a missing email step by step, and what SPF records have to do with it.
- [Server files and logs](/platform/system-admin/server-files/): where Epicor writes files, and how to download them with Server File Download.

**Users and security**

- [Epicor Identity Provider and single sign-on](/platform/system-admin/identity-and-sso/): link users to IdP, export and invite them, and manage them afterwards.
- [Menu Maintenance and Classic/Kinetic paths](/platform/system-admin/menus/): how menu items choose between Classic and Kinetic, and how to add BAQ reports and custom processes.

**Extending the data model**

- [UD fields and data model regeneration](/platform/system-admin/ud-fields/): add a user-defined column and make it usable.
- [User codes](/platform/system-admin/user-codes/): company-specific lookup lists for drop-downs, filters and distribution lists.

**Moving and fixing things**

- [Solution Workbench](/platform/system-admin/solution-workbench/): package custom work and move it between environments, and the traps to avoid.
- [Data fixes](/platform/system-admin/data-fixes/): how Epicor's data fix scripts are delivered and run.

**Company and site setup**

- [Company settings, branding and country functionality](/platform/system-admin/company-setup/): company color and logo, and enabling a CSF.
- [Add a new site](/platform/system-admin/new-site/): site or company, the setup checklist, and replacing MfgSys.

**When something breaks**

- [Troubleshooting](/platform/system-admin/troubleshooting/): symptoms, causes and fixes for common administration problems.

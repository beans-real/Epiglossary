---
title: Cloud Management Portal
description: What Epicor Cloud customers can do themselves in the Cloud Management Portal, from restarting the site and task agent to refreshing Pilot from Live, regenerating the data model and managing updates, and how to get access.
env: kinetic
sidebar:
  order: 4
---

The **Cloud Management Portal (CMP)** is the self-service console for Epicor Cloud (SaaS) tenants.
Jobs that used to need a support case, such as restarting the application server, copying Live into
Pilot or regenerating the data model after adding a UD field, you can do yourself in a few minutes.

## Get access

CMP sign-in goes through [Epicor Identity Provider (IdP)](/platform/system-admin/identity-and-sso/), and
your Epicor user has to be linked to it.

1. Ask Epicor's cloud operations team for an IdP account, giving the email address you want to use.
2. Log in to your **Live** environment. Access is set up from Live even if you mainly want to manage
   Pilot.
3. In **User Account Security Maintenance**, open your user and:
   - set **Email** to the same address as the IdP account,
   - set **External Identity** to that same address,
   - tick **Security Manager**, and
   - add the `ECMP_SelfSignUp` security group.
4. Save, then open **System Management > Cloud Management Portal** (or search the menu for "cloud m").
   Sign in to IdP if prompted and accept the terms the first time.

The first users become **tenant administrators**, who can add other portal users and assign them roles.

## Tenant dashboard and instances

The **Tenant Dashboard** lists every environment you have: Live (production), Pilot and any additional
ones such as Third or Education. Epicor calls each one a **tenant instance**: an application server, its
database and the services attached to it, such as Enterprise Search and Data Discovery.

Choose **More Details** on an instance (or pick it from **Tenant Instance**) to manage it. Administrators
can give instances friendly names with **Change Instance Name**, which helps when several people manage
several environments.

<!-- TODO screenshot: Tenant Instance Summary tab with the site and task agent buttons (no tenant names or URLs visible) -->

## Summary tab: links and site actions

The **Summary** tab gathers the details you otherwise hunt for:

- the **web client**, **server**, **web MES**, **REST API** and **System Agent** links for the
  environment, and a desktop client download link,
- the Kinetic version and build, and
- the **Host OS**, which tells you whether the environment runs on Windows or Linux (see
  [Linux containers in Epicor Cloud](/kinetic/administration/linux-containers/)).

It also has the actions you'll use most:

| Action | Use it when |
|---|---|
| **Start / Stop / Restart Site** | The environment is unresponsive, BPM or function editors hang, or Support asks for a restart. Restarting disconnects every user of that instance. |
| **Start / Stop Task Agent** | Scheduled tasks aren't starting or are stuck. See [Scheduled tasks](/platform/system-admin/scheduled-tasks/#restart-the-task-agent). |

## Database tab

**Refresh DB** copies a database backup from one instance into another, most often Live into Pilot so
you can test against current data. Pick the source instance and backup date, type `confirm` and run it.

- You can't refresh *into* Live.
- Source and target must be on the same Kinetic version, so refresh before one of them is upgraded, or
  after both are.
- Everything in the target is overwritten, including customizations, BPMs and layers built there that
  aren't in Live yet. Export them with [Solution Workbench](/platform/system-admin/solution-workbench/)
  first.

**Data Model Regen** regenerates the data model after you add UD columns or tables. You don't need to stop
anything first: the pipeline stops the instance, regenerates and restarts it. Users are disconnected, so
run it out of hours. See [UD fields](/platform/system-admin/ud-fields/).

## Upgrade tab

The **Update Policy** is either **Epicor Managed** (Epicor applies updates on its schedule) or **Self
Managed** (you choose when). Changing the policy on Live changes it for every instance in the tenant.

With self-managed updates, choose **Update**, pick the target version, type `confirm` and run it. If you
don't update before Epicor's deadline, Epicor updates the instance for you.

## Check what happened

**Deployment Status Detail** shows every action run against an instance: who ran it, when, its status
(pending, complete or cancelled), each step, and a log for steps that have one. Check it after any
refresh, regeneration or update, and before telling users the environment is ready.

## Good habits

- Tell users before restarting a site or regenerating the data model; both drop active sessions.
- After refreshing Pilot from Live, change Pilot's
  [company color](/platform/system-admin/company-setup/#company-color-and-logo) back, and disable
  anything in Pilot that sends email or talks to live external systems.
- Keep at least two tenant administrators so you're never locked out.

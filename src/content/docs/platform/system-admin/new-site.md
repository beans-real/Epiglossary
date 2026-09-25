---
title: Add a new site
description: Decide between a new site and a new company, work through the setup checklist for a new site (plant), and replace the default MfgSys site in a new company.
env: both
sidebar:
  order: 9
---

A **site** (called a *plant* in older releases and in table names such as `PartPlant`) is a physical
location inside a company, with its own warehouses, resources, planning parameters and often its own
costs. Adding one touches far more than **Site Maintenance**, so work through the whole checklist below
before anyone transacts in it. You need the Multi-Site module licensed to have more than one site in a
company.

## New site or new company?

Decide this first, because it's very hard to undo.

| One company, several sites | Separate companies |
|---|---|
| Sites share parts, customers and suppliers | Locations share little master data |
| Same legal entity and tax ID | Different legal entities or tax IDs |
| Finance is run centrally (one AP, one AR, one set of books) | Each location runs its own AP, AR and books |
| Frequent transfers between locations | Occasional inter-company trade |

If the locations share most of their data and one set of books, use sites. If they run as independent
businesses that happen to share an owner, separate companies keep the data and finance cleaner, at the
cost of multi-company setup for anything they share.

## Checklist for a new site

1. **Create the site** in **Site Maintenance**, with its production calendar and planning parameters,
   then set it up in **Site Configuration Control**. Define site-to-site transfer rules if goods will
   move between sites.
2. **Create warehouses and bins** for the site. Then update the site's defaults for receiving, RMA,
   inspection and similar locations to point at them.
3. **Define a cost ID** if the site should be costed separately, and assign it.
4. **Give users access** to the new site in **User Account Security Maintenance**.
5. **Review part class and product group** settings that have site-specific values.
6. **Create part-site (`PartPlant`) records** for every part the new site will stock, make or buy.
7. **Share methods if needed.** If a manufactured part's revision will be used in more than one site,
   create an alternate method for the new site for each manufactured part and its manufactured
   components, and mark it as the primary alternate method on the part's site planning settings.
8. **Split the GL by site if needed.** To post the site's activity to its own GL division, use the GL
   controls on **Site Maintenance** (not the ones in Site Configuration), and on **Warehouse
   Maintenance** where relevant.
9. **Point demand at the site.** If orders for certain products should be made or shipped from the new
   site, set it as the sales site on those product groups, so users don't have to change the site on
   every release.
10. **Resource groups**: create or move resource groups for the new site.
11. **Manifest / quick ship**: set up a manifest warehouse for the site if you use those features.
12. **Configurators**: configurators are tied to revisions, and revisions to sites. Check that
    configured parts work in the new site.
13. **Custom logic**: search BPMs, functions, BAQs and reports for hard-coded site IDs and update them.

## Replace MfgSys in a new company

Every new company is created with a default site called `MfgSys`. Nothing requires you to keep it.
Once you have more than one site, a site ID that doesn't match a place is confusing on every
transaction, report and transfer ("transferred from LAX to MFGSYS"), and report writers end up adding
calculated fields just to show a sensible name.

Replace it **before anything else is entered in the company.** As soon as a part, warehouse or
transaction uses `MfgSys`, it can't be deleted.

1. Log in to the new company.
2. In **Production Calendar Maintenance**, create the calendar the new site will use.
3. In **Site Maintenance**, create the properly named site and assign the calendar.
4. Switch your session to the new site, so you are no longer logged in to `MfgSys`.
5. In **Company Configuration**, change the **default site** to the new site. A site can't be deleted
   while it is the company's default.
6. In **Site Maintenance**, delete `MfgSys`.

Shortcuts such as removing everyone's access to `MfgSys` and then deleting it don't reliably work: the
site can reappear after the next login. Follow the steps above in order, with the new site as both your
current site and the company default before you delete.

:::tip
If your company already uses `MfgSys` and it's too late to remove, change its **name** (not its ID) in
Site Maintenance to the real location, so at least screens and reports that show the name read
correctly.
:::

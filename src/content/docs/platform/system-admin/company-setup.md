---
title: Company settings, branding and country functionality
description: Set a company's color and logo in Company Maintenance, and turn on Country Specific Functionality (CSF) for a company.
env: both
sidebar:
  order: 8
---

A few company-level settings come up again and again for administrators: making companies look
different so users know which one they are in, and switching on country-specific features. All of them
are set per company, so repeat them in each company that needs them.

For adding a site within a company, see [Add a new site](/platform/system-admin/new-site/).

## Company color and logo

:::note[Kinetic only]
These are Kinetic UI settings. They change the browser and Kinetic desktop client, not Classic forms.
:::

Open **Company Maintenance** (**System Setup > Company/Site Maintenance > Company Maintenance**). On
**General Settings**, under **UI Options**:

- **Company Color** sets the accent color for the company. Giving each company, and each non-production
  environment, its own color is a cheap way to stop people entering live transactions in Pilot or in the
  wrong company.
- **Logo Image** (just below it) sets the company logo shown in the application.

![Company Maintenance General Settings with the Company Color drop-down under UI Options](/images/pasted-image-20260802201018.png)

Save, then have users log out and back in to see the change.

:::tip
A test environment copied from Live also copies Live's company color. After every database refresh into
Pilot, change the color back so the two look different.
:::

## Country Specific Functionality (CSF)

**Country Specific Functionality** adds the localized features (tax reporting, statutory formats,
e-invoicing and so on) that a particular country requires. A CSF has to be licensed and enabled for the
environment, and then assigned to the company that needs it.

**Epicor Cloud:** open an EpicCare case and ask Epicor to enable the CSF for your tenant and company.

**On-premises:**

1. On the Epicor server, open the **Epicor Administration Console**.
2. Expand **Server Management**, your server, and the environment you need.
3. Open **Licensing** and double-click your license.
4. On the **CSF** tab, enable the country and click **OK**.
5. Go to **Companies** and double-click the company.
6. In the **Country** field, select the country you just enabled, then **Select** and **OK**.

After enabling a CSF, users need to log out and back in. Some CSFs have their own setup steps and
conversion programs. Check the installation notes for the country on EpicWeb before you start.

<!-- TODO verify: exact node and tab names in the Administration Console (Licensing > CSF tab) against a current release -->

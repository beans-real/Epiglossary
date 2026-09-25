---
title: Epicor Identity Provider and single sign-on
description: What Epicor Identity Provider (IdP) is, how to link Epicor user accounts to it and invite users, and how accounts are managed once they sign in through IdP.
env: both
sidebar:
  order: 4
---

**Epicor Identity Provider (IdP)** is Epicor's central sign-in service. Instead of each Epicor product
keeping its own user names and passwords, users sign in once with an IdP account and are passed through
to Kinetic, EpicCare, the Epicor Learning Center and other Epicor services. IdP can itself trust your
company directory (Active Directory or Microsoft Entra ID, formerly Azure AD), which gives you true
single sign-on with the users' normal work accounts.

IdP adds features the built-in Epicor login doesn't have: multi-factor authentication, password
policies, user self-service (password resets without calling IT) and automated provisioning.

:::note
IdP is aimed at Epicor Cloud tenants. Epicor's on-premises administration guide describes it as not
available for on-prem installations, which use Epicor, Windows or Azure AD authentication instead.
Check the current position with Epicor if you are on-prem.
:::

## How it fits together

1. Epicor enables IdP for your tenant (you request this through EpicCare) and registers one or more
   **application administrators**. Have at least two, so you are never locked out of administration.
2. In Epicor, each user account is linked to an identity in IdP through its email address.
3. The accounts are exported to IdP, and IdP invites each user by email to set up their sign-in.
4. From then on, the user signs in through IdP, and IdP tells Kinetic who they are.

## Link and export users

1. Open **User Account Security Maintenance**.
2. Open or create the user.
3. Set the user's **Email Address**, and set **External Identity** (on the authentication settings) to
   the identity the user will have in IdP. This is normally the same email address.
4. From **Actions**, choose **Export to Identity Provider**.
5. The user receives an invitation email and follows it to finish setting up their account.

To export many users at once, use the search to select several users (Shift+click), bring them into
the list view, select them all there, and run **Actions > Export to Identity Provider** once.

:::caution
Once a user is exported to an external identity provider, you can no longer manage their password from
User Account Security Maintenance. Password resets, MFA and lockouts are handled in IdP.
:::

## Manage users in IdP

Application administrators manage IdP accounts from the IdP portal at `login.epicor.com`: sign in, open
the user menu, choose **Admin**, then **Manage Users**. From there you can re-send invitations, reset
MFA, disable users and configure settings such as password policy, MFA and allowed external identity
providers.

## Practical advice

- **Leavers**: disable the user in IdP *and* in Epicor. Disabling only one side leaves either a sign-in
  with no access or an Epicor account that another sign-in method could still reach.
- **Integration and service accounts** (the task agent, REST integrations, label printing services)
  generally shouldn't go through interactive IdP sign-in. Use a dedicated integration user with only the
  rights it needs and a password that doesn't expire, so the integration doesn't stop when a policy
  forces a reset.
- **Cloud Management Portal access** requires an IdP account whose email matches the Epicor user. See
  [Cloud Management Portal](/kinetic/administration/cloud-management-portal/).

---
title: Troubleshooting functions
description: Fix the Epicor Function problems that come up most, read-only libraries, 404s from REST, updates that don't save, libraries disabled after the cloud Linux migration, and how to log what a function is doing.
env: both
sidebar:
  order: 11
sources:
  - title: "EpiUsers: Function and function library become read-only"
    url: https://www.epiusers.help/t/function-and-function-library-become-read-only/75379/21?page=3
  - title: "EpiUsers: Function libraries sporadically return as disabled since Linux migration"
    url: https://www.epiusers.help/t/function-libraries-sporadically-return-as-disabled-since-linux-migration/136147/42
---

Symptoms, causes and fixes for the function problems people hit most, followed by ways to see what a
function is doing when it runs.

## The library or function is read-only

**Symptom:** you open a library in Epicor Functions Maintenance and can't edit anything, or you can
see a function but not open its code.

**Cause:** one of these:

- The library is **published**. Published libraries are read-only for everyone.
- You aren't the **owner** and aren't a member of its **Share With Group**.
- The library was created in a **different company** from the one you're logged into.
- You're a **Functions Developer** and the function contains custom code, or the library allows
  database access from code. Only Power Developers can edit those.
- You're a **Functions Administrator**. Administrators manage libraries but can't edit function logic.

**Fix:** have an administrator demote the library, switch to the owning company, or ask the owner (or
an administrator, while the library is unpublished) to share it with a security group you're in.

## REST or Application Studio gets 404 Not Found

**Cause, most likely first:**

1. The library is published but **not mapped to the company** in the URL. Mapping is needed even for
   the owning company once published.
2. The library or function is **disabled**. The response says the function or library is disabled.
3. The library is **unpublished** and the call didn't use the `staging` URL.
4. The function is **For Internal Use Only**.
5. A typo in the company, library or function ID. IDs in the URL must match exactly.

**Fix:** check each in the library's **Summary** and **Security** cards. The REST help page lists only
functions that can be called, so if yours isn't there, one of the first four is the reason. See
[Libraries, publishing and security](/platform/functions/libraries-and-security/#company-mapping).

## Libraries sporadically show as disabled or "can't be found" (Epicor cloud)

**Symptom:** after an Epicor-hosted environment moved to Linux servers, calls to functions fail at
random with `404` responses or errors such as `Can't find library: 'Library-Name'`, and libraries
sometimes appear disabled, then work again.

**Cause:** a platform defect in the Linux-hosted releases, tracked by Epicor as problem `PRB0320462`.

**Fix:** Epicor released a hotfix for public cloud customers on Kinetic 2026.100.7 and 2025.2.16.
Raise an EpicCare case asking for the hotfix to be deployed to the environments you name, and allow a
maintenance window of about an hour. Later releases should include the fix.

## Updates in code don't save

**Symptom:** the function runs without error, but database changes made through `Db` aren't there
afterwards.

**Cause:** the library's **DB Access from Code** is `Read Only`, or the table isn't ticked
**Updatable** on **References > Tables**. Updates to non-updatable tables are silently ignored.

**Fix:** set **DB Access from Code** to `Read Write` (Power Developers only) and mark the table
**Updatable**. Also check that the code calls `Db.SaveChanges()`. For standard tables, consider calling
the business object instead; see
[Call business objects from a function](/platform/functions/calling-business-objects/).

## Half the work was saved before an error

**Cause:** the function made several `Update` calls and **Requires Transaction** isn't ticked, so the
calls before the failure were committed.

**Fix:** tick **Requires Transaction** on the function and throw an `Ice.BLException` on failure so the
whole run rolls back.

## A type or service isn't recognised in the code

**Symptom:** compile errors such as a missing contract, tableset or table type.

**Fix:** add the reference: the service under **References > Services**, its contract assembly under
**Assemblies** (for tableset types), or the table under **Tables**. See
[Build a function](/platform/functions/building-functions/#references-what-your-code-can-see).

## You can't save because the code doesn't compile yet

Tick **Disabled** on the function. A disabled function can be saved with compile errors, so you can
park work in progress and come back to it.

## The scheduled function "did nothing"

A scheduled run can't show messages and nobody reads its response parameters. Check **System Monitor**
for the **Run Epicor Function** task's status first, then add logging (below) or have the function
email a summary. See [Schedule a function](/platform/functions/scheduling-functions/).

## Logging

### Quick debugging with info messages

While testing interactively, a small helper that prefixes every message makes it easy to follow a run:

```csharp
bool debug = true;   // switch off before promoting

Action<string> Log = text =>
{
    if (!debug) return;
    this.PublishInfoMessage($"XX_ReportQty: {text}",
        Ice.Common.BusinessObjectMessageType.Information,
        Ice.Bpm.InfoMessageDisplayMode.Individual, "", "");
};

Log($"Start: job {jobNum}, qty {qty}");
// ...
Log("Labor detail created");
```

These messages only appear when a person triggered the call.

### Server-side application logs

For scheduled functions, integrations and anything in production, write to an application log on the
server instead:

```csharp
using var logger = Ice.Logging.ApplicationLoggerBuilder
    .CreateDefaultBuilder(this.Session, "XX_CreditReview")
    .Build();

logger.LogInformation("Run started for company {Company}", Session.CompanyID);
// ...
logger.LogInformation("{Count} customers updated", changed);
```

The log ID becomes the file name (`XX_CreditReview.log`), written to the user's log folder on the
server. Epicor also provides a builder for fully customised logs and one for Azure Application
Insights. Remove or quieten logging once the problem is solved; several busy logs writing to the same
place slow the server and interleave their lines.
<!-- TODO verify: where application log files can be read on Epicor-hosted cloud environments -->

### Debug Mode and dumped sources

On-premises, ticking **Debug Mode** on the library compiles it with debugging symbols and dumps the
generated source, so you can attach a debugger to the application server. **Dump Sources** alone keeps
the generated C# (under the server's `Sources\#Efx` folder) for reading. Turn both off again when you're
done.

---
title: Call external APIs from Epicor
description: Sync data between Epicor and another system's web API from an Epicor Function, including sizing the job, making the HTTP call, logging, summary notifications and retries.
env: both
sidebar:
  order: 6
---

The other direction from the rest of this section: Epicor calling *out* to someone else's API. Typical
jobs are pulling web orders from a storefront, pushing stock levels to a marketplace, fetching tracking
status from a carrier, or syncing records with a CRM. In Kinetic, especially in Epicor's cloud, the
usual home for this is a C# Epicor Function run on a schedule.

## Size the job before you build it

The effort depends almost entirely on two numbers:

| | Small | Large |
|---|---|---|
| **Volume** | Tens or hundreds of records, a handful of fields | Thousands of records, many fields and related tables |
| **Frequency** | Nightly or hourly batch | Every few minutes, or "real time" |

A small nightly sync is a straightforward function: call the API, update Epicor, email a summary. A
large, frequent sync needs change tracking (so you only move what changed), conflict handling, careful
performance work and much more testing. Estimates for the two can differ by an order of magnitude.

Pin the requirements down before building: which fields, which direction, what happens on conflicts,
how quickly changes must appear. Integration projects that start with "we'll figure it out as we go"
tend to grow without end. If the full need is big, split it into phases with their own agreed scope.

## Where the code should live

- **A scheduled Epicor Function** is the default choice. The code lives inside Epicor, moves between
  environments with the library, runs under Epicor's security, and the System Agent schedules it. See
  [Schedule a function](/platform/functions/scheduling-functions/).
- **An external service** (a small Windows service, a cloud function, an integration platform) suits
  very frequent polling, such as every few seconds, where the overhead of a scheduled Epicor task is
  too high, or heavy processing you don't want on the application server. It then calls *into* Epicor
  over REST instead; see [Call Epicor from another application](/platform/rest-api/calling-epicor/).
- **A BPM directive** calling an external API during a save makes the user wait for the other system,
  and fails the save if that system is down. Prefer queuing the work (write a row to a UD table) and
  letting a scheduled function send it.

## Making the call from a function

.NET's `HttpClient` works from function code. This example fetches records changed since the last run
and returns how many it processed.

```csharp
string baseUrl = "https://api.example.com/v1";
string apiToken = GetSetting("XX_ShopToken");   // your helper; see "Secrets" below
DateTime lastRun = GetLastRunTime();           // stored after each successful run
int processed = 0;

using (var http = new System.Net.Http.HttpClient())
{
    http.Timeout = TimeSpan.FromSeconds(30);
    http.DefaultRequestHeaders.Add("Authorization", "Bearer " + apiToken);

    string url = $"{baseUrl}/orders?updated_since={lastRun:yyyy-MM-ddTHH:mm:ssZ}";
    var response = http.GetAsync(url).GetAwaiter().GetResult();
    string body = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

    if (!response.IsSuccessStatusCode)
        throw new Ice.BLException($"Shop API returned {(int)response.StatusCode}: {body}");

    var orders = Newtonsoft.Json.Linq.JArray.Parse(body);
    foreach (var order in orders)
    {
        string externalId = (string)order["id"];
        // ... create or update the Epicor record through a business object ...
        processed++;
    }
}

message = $"{processed} orders processed.";
```

Notes on the code:

- Function code isn't `async`, so wait for results with `.GetAwaiter().GetResult()`.
- Always set a timeout. The default is long enough to hold a scheduled task for minutes if the other
  system hangs.
- `Newtonsoft.Json` is available for reading and writing JSON.
- Create or update Epicor records through business objects, as in
  [Call business objects from a function](/platform/functions/calling-business-objects/), so the data
  is validated like a user's entry.

<!-- TODO verify: whether System.Net.Http must be added under the library's References > Assemblies, and any outbound-call restrictions on Epicor-hosted environments -->

### Secrets

Don't type API tokens or passwords into the function. The code is visible to every Power Developer,
ends up in exported library files and in dumped sources. Store the value somewhere with restricted
access that an administrator can change without editing code, and read it at run time. A `GetSetting`
helper like the one above can read it from a UD table or a user code that only administrators can
maintain.

## Error handling

This is the part that decides whether an integration is trusted.

**Log detail to the server.** Write informational and exception messages to an application log so
you can reconstruct what happened; see
[Troubleshooting functions](/platform/functions/troubleshooting/#logging). A UD table used as an error
log also works and can be shown on a dashboard, but it then needs a clean-up job so it doesn't grow
forever, and a way to reprocess failed rows.

**Notify with summaries, not floods.**

- On success, one short daily email: the job ran, and how many records it processed. Silence is
  ambiguous; a missing "all good" email tells you the job didn't run.
- On failure, one consolidated email after retries are exhausted, with a subject that stands out, such
  as `[FAILURE] Web order import`, and the list of failed records in the body. Never one email per
  failed record.

**Retry what's temporary.** Record locks, "row modified by another user" errors, timeouts and HTTP
`429`/`503` responses often succeed a moment later. Retry those a few times with a short pause. Don't
retry validation errors; they'll fail the same way every time.

**Keep going past one bad record.** Catch errors per record, collect them, carry on, and report them
together at the end. One bad order shouldn't stop the other 200 importing.

**Remember what you've done.** Store the external ID on the Epicor record (a UD field is ideal) and the
time of the last successful run. That makes re-runs safe and lets the next run ask only for changes.

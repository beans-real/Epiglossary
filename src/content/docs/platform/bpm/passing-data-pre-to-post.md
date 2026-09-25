---
title: Pass data from pre- to post-processing
description: Link a pre-processing and a post-processing directive, and carry values between them with callContextBpmData.
env: both
sidebar:
  order: 7
sources:
  - title: "EpiUsers: Pass variable from PreProcessing to PostProcessing"
    url: https://www.epiusers.help/t/pass-variable-from-preprocessing-to-postprocessing/69847
---

Many requirements need both stages of a method. Pre-processing is where you can still see what a record
looked like *before* the save; post-processing is where it's safe to act on other records because the
save succeeded. The two directives are separate, though, and variables you declare in one don't exist in
the other. This page shows how to connect them.

## Two tools

**Enable Post Directive** (widget, pre-processing) and **This directive has been enabled from the
specified directive** (condition, post-processing) link a specific pre directive to a specific post
directive. The post directive's condition is only true when the pre directive reached its Enable Post
Directive widget during the same call. Use this when the post-processing work should happen only if
pre-processing decided it should.

**`callContextBpmData`** is a small set of spare fields that travels with the call from start to finish.
It has generic fields such as `Character01`, `ShortChar01`, `Number01`, `Checkbox01` and `Date01`.
Anything you write to them in pre-processing is still there in post-processing. Use the **Set BPM Data
Field** widget, or assign them in code.

You'll often use both: the link to decide *whether* post-processing runs, and a BPM data field to
carry *what* it needs.

## Example: act after a job is released

Goal: when a job's **Released** box is ticked, do some follow-up work on that job's other records.

The release has to be detected in pre-processing, where the before-image is still available. The
follow-up belongs in post-processing, so it only happens if the release really saved.

**Pre-processing on `Erp.BO.JobEntry.Update`**, Custom Code widget:

```csharp
var justReleased = ds.JobHead.FirstOrDefault(j =>
    j.RowMod == IceRow.ROWSTATE_UPDATED &&
    j.JobReleased &&
    ds.JobHead.Any(o =>
        o.RowMod == "" &&
        o.JobNum == j.JobNum &&
        !o.JobReleased));

if (justReleased != null)
{
    callContextBpmData.Character01 = justReleased.JobNum;
}
```

Follow it with a Condition on "`callContextBpmData.Character01` is not empty" and, on its True exit,
an **Enable Post Directive** widget.

**Post-processing on `Erp.BO.JobEntry.Update`**: start with the condition "this directive has been
enabled from" the pre directive above, then a Custom Code widget:

```csharp
string jobNum = callContextBpmData.Character01;
callContextBpmData.Character01 = "";   // clear it so nothing else picks it up

// follow-up work for jobNum goes here
```

[Update other records from a BPM](/platform/bpm/updating-other-records/) shows what that follow-up
work can look like.

:::tip
You can do the same with widgets alone: a Condition using "field has been changed from false to true",
then **Set BPM Data Field** and **Enable Post Directive**.
:::

## Things to know about callContextBpmData

- **It's shared by everything in the call.** If your post-processing calls another business object,
  directives on that object see the same fields. Other BPMs in your system may already use some of
  them. Keep a list of which directive uses which field.
- **Clear what you set** once you've used it, so a later directive in the same call doesn't act on a
  stale value.
- **It can stop loops.** If post-processing calls a method that triggers your pre-processing directive
  again, set a marker field first and have the pre directive's condition skip when the marker is set.
- **The client can see it.** Values travel back to the client with the call, so Kinetic events and
  Classic customizations can read them. Don't put anything sensitive there.

## Epicor uses these fields too

Some Epicor methods pass their own values through `callContextBpmData`. For example, when a quote is
closed through `Erp.BO.Quote.PreOpenCloseQuote`, the win/loss reason code and reason type are in
`Character01` and `Character02`. If you set a reason code from a BPM, it has to be one that exists
under the matching CRM win or CRM lose reason type.

Before using a field for your own purposes on a given method, check a trace to make sure Epicor isn't
already using it there.

---
title: Epicor Functions overview
description: What Epicor Functions are, how libraries group them, the three kinds of function, and when to write a function instead of a BPM or an Application Studio event.
env: both
sidebar:
  order: 1
sources:
  - title: "EpiUsers: Let's Get Func-y: Epicor Functions"
    url: https://www.epiusers.help/t/lets-get-funcy-epicor-functions/59714
---

An Epicor Function is a piece of server-side logic that you design once and then call from wherever
you need it: a BPM directive, another function, an Application Studio event, an external program over
REST, or a schedule. It uses the same designer and the same C# environment as BPM, but instead of
hooking an existing business object method, it has its own inputs and outputs that you define.

Functions arrived in Epicor 10.2.500 and work the same way in Kinetic. They run on the application
server, so the client (Kinetic or Classic) doesn't matter.

## Why functions exist

BPM directives are good at *intercepting* what Epicor already does. They're less good at:

- **Reuse.** The same logic needed on three methods ends up copied into three directives.
- **Your own shape of data.** A directive gets the method's tableset and parameters, nothing else.
- **Being called on demand.** There's no clean way to run a directive from a button, a schedule or
  another application.
- **Cloud-friendly shared code.** External DLLs were the old answer for shared C#, and they aren't an
  option in Epicor-hosted environments.

A function solves all four. You decide its signature, it can call business objects, BAQs and other
functions, and every caller gets the same behavior.

## Libraries

Functions live in **libraries**. A library is the unit you secure, publish, export and import, much
like a DLL is the unit of deployment for ordinary code. Settings that matter to every function in it
are made at library level:

- whether its functions may contain custom C# code
- whether that code may read or write database tables
- which tables, services, assemblies and other libraries its functions may use (the references)
- which companies may call it
- whether it's available over REST or only to BPMs

Callers address a function by library and function ID, so two teams can both have a function called
`SendAlert` as long as their libraries have different names. Give libraries a clear, unique ID, for
example `XX_SalesUtils`.

See [Libraries, publishing and security](/platform/functions/libraries-and-security/) for the settings
in detail.

## The three kinds of function

| Kind | Built with | Who can create it |
|---|---|---|
| **Widget Function** | Drag-and-drop widgets only (conditions, setters, BO calls, queries, email) | Functions Developer or Power Developer |
| **Widget Function with Code** | Widgets plus **Execute Custom Code** and custom-code conditions | Functions Power Developer, in a library that allows custom code widgets |
| **Custom Code Function** | A single C# code body, edited in the Function Editor | Functions Power Developer, in a library that allows custom code functions |

Most real-world functions end up as Custom Code Functions, because a function is usually written to do
something the widgets can't express neatly. Widget Functions are still worth using for simple
orchestration that non-developers need to read.

## Where you manage them

Functions are maintained in **Epicor Functions Maintenance**. In older releases and in the Classic
client it's at **System Management > Business Process Management > Epicor Functions Maintenance**. In
recent Kinetic releases, Epicor documents it as part of the **Kinetic Power Tools** client.
<!-- TODO verify: which Kinetic release moved Epicor Functions Maintenance into Kinetic Power Tools, and whether it is still reachable from the browser menu -->

Your user account needs one of the Functions security groups before the program is usable. See
[Libraries, publishing and security](/platform/functions/libraries-and-security/#security-groups).

## Function, BPM or Application Studio event?

| You want to… | Use |
|---|---|
| Enforce a rule every time a record is saved, however it's saved | A **BPM** directive |
| Share the same server logic between several directives, screens or integrations | A **function**, called from each place |
| Run server logic when a user clicks a button | A **function**, called from an Application Studio event |
| Give an outside system one tidy endpoint instead of a chain of BO calls | A **function**, called over REST |
| Run something every night or every hour | A **function**, scheduled through the System Agent |
| Change what a screen shows or does before the user saves | An **Application Studio event** (Kinetic) or a customization (Classic) |

The tools combine well. A common shape is a thin BPM directive that decides *when* something should
happen and a function that does the work. The [BPM overview](/platform/bpm/overview/) covers the same
decision from the directive side.

:::tip
A function runs in its own context. If a directive fails to compile because two services it calls share
tableset types, moving that work into a function is a clean fix.
:::

## Pages in this section

**Setting up**

- [Libraries, publishing and security](/platform/functions/libraries-and-security/)
- [Build a function](/platform/functions/building-functions/): signatures, references and the code environment

**Inside a function**

- [Call business objects from a function](/platform/functions/calling-business-objects/)
- [Run a BAQ from a function](/platform/functions/running-baqs/)
- [Function recipes](/platform/functions/function-recipes/): small, reusable patterns

**Using a function**

- [Call a function from BPMs, screens, REST and other functions](/platform/functions/calling-functions/)
- [Schedule a function](/platform/functions/scheduling-functions/)

**Email**

- [Send email from a function](/platform/functions/sending-email/)
- [Email a report as a PDF attachment](/platform/functions/emailing-report-pdfs/)

**Troubleshooting**

- [Troubleshooting functions](/platform/functions/troubleshooting/)

Related: calling Epicor from outside and calling other systems from Epicor are covered in the
[REST API section](/platform/rest-api/overview/).

---
title: Per-employee language in MES
description: Why Kinetic MES can't switch its display language for each employee who clocks in, what was tried with the LangTran Translate method, and a BPM mistake that locks everyone out.
env: kinetic
sidebar:
  order: 5
---

A common request on multilingual shop floors: several employees share one MES station and one Epicor user account, and each should see MES in their own language when they clock in. This page records why that doesn't work with Epicor's translation framework, so you can skip the dead ends, and one warning that applies to any experiment in this area.

## How Kinetic picks the language

The display language belongs to the **user account**, not the employee. When a Kinetic screen or menu loads, the client asks the server for translated strings by calling `Ice.BO.LangTran`'s `Translate` method, based on the session's language. The language is fixed for the session when the user signs in.

Relevant pieces:

| Piece | What it holds |
|---|---|
| `LangOrg` table | The original (untranslated) strings |
| `LangTran` table | Translations, including custom ones you add |
| `LangTran.Translate` method | Returns translations for the client, called on load and whenever a menu refreshes |
| `LangName.LangNameCombo` reusable combo | A drop-down of installed languages, handy for a UD language field |

## The idea that doesn't work

The plan was:

1. Add a UD language field to `EmpBasic`, filled from the `LangName.LangNameCombo` list.
2. When an employee clocks in (`EmpBasic.ClockIn`), call `Translate` for their language and have MES use the result; on clock-out, go back to the default.

In testing it failed on how `Translate` behaves when called this way:

- It returns only a **fixed-size subset** of strings (a couple of thousand, the same count in every environment tried), even though a language has tens of thousands. Browser developer-tool limits weren't the cause; the limit is in the method.
- Rows added to the method's dataset in a **pre-processing** directive, or to the result in **post-processing**, are ignored: the base method rebuilds its output and they never reach the screen.
- Changing a returned row's original text does get it translated, but only within that same fixed subset.

When the session language itself is set, Epicor loads the full translation set by a different route, which is why switching the **user's** language works and overriding `Translate` doesn't.

## What does work

- **One user account per language** at shared stations, with the station signed in as the right one. Simple, supported, but it means separate accounts to manage.
- **Per-user language on individual sign-ins**, if employees sign in to Kinetic as themselves rather than sharing a station account.
- **Translate your own customizations** (labels, button text, messages in your layers) through the normal translation tools, so whatever language the account uses shows your additions correctly.

Workarounds that swap the signed-in account behind the scenes (holding passwords for several accounts, fetching new tokens on clock-in) were considered and rejected: they need stored credentials, break when tokens expire, and are a security and maintenance burden.

## Warning: don't put a message BPM on session methods

While experimenting, don't add a directive that shows a message (or throws) on the session methods used at sign-in, such as `Ice.Lib.SessionMod` methods like `GetLanguage`. They run for **every** sign-in, including administrators'. A directive that interrupts them can stop anyone from logging in, and the only way back is to disable the directive directly in the database.

If you must trace session behaviour, use server logs or write to a UD table from a post-processing directive, test in a non-production environment, and keep a second, already-signed-in admin session open so you can disable the directive if it misbehaves. General BPM debugging advice is in [Common BPM problems](/platform/bpm/troubleshooting/).

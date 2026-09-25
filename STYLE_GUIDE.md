# Epiglossary Style Guide

Rules for every page on the site. They exist so the wiki reads as one voice, stays accurate, and never
republishes material we don't have the right to publish.

## 1. Originality and sourcing

- **Every page is written in our own words.** Private notes, forum posts, Stack Overflow answers, Epicor
  help and user guides are *research material*, never text to paste. Paraphrasing sentence-by-sentence
  doesn't count as rewriting; restructure and explain from understanding.
- **Credit external sources** in the `sources` frontmatter (title + URL). They render as a "Sources" list
  at the bottom of the page. Only list URLs you actually have; never invent one.
- **Code is always newly written for teaching.** Source code (internal BPMs, customizations, client work)
  may inform an example, but published code must be a fresh, minimal, generic version that shows the
  technique, not a cleaned-up copy of the original. Keep examples as short as the idea allows.
- Facts (field names, table relationships, transaction codes, menu paths) are fine to state, but in our
  own structure and phrasing.

## 2. Nothing identifying

Never publish, in prose, code, comments, BAQ IDs or example data:

- company, customer, vendor, partner or product-internal names (and their abbreviations/prefixes)
- people's names, initials or email addresses
- company IDs, site IDs, tenant/host names, server names, IPs, file shares, URLs to private systems
- ticket numbers, internal project codes, real order/part/serial numbers

Use neutral placeholders instead:

| Kind | Placeholder |
|---|---|
| Company ID | `EPIC06` |
| Custom prefix (BAQs, BPMs, functions) | `XX_` (e.g. `XX_OpenOrders`) |
| Email | `user@example.com`, `erp@example.com` |
| Customer / supplier | `Acme Manufacturing`, `Example Supply Co.` |
| Part / job / order | `PART-1001`, `JOB-000123`, `Order 10001` |
| Server / share | `epicor-app01`, `\\fileserver\share` |

## 3. Environment

Every article has `env` in frontmatter:

- `kinetic`: Kinetic web/browser UI, Application Studio, Kinetic dashboards, Edge Agent, cloud/Linux-era behavior
- `classic`: Epicor 10 smart client: customizations, `oTrans`, `EpiDataView`, Event Wizard, classic dashboards
- `both`: server-side and functional topics: BPMs, Functions, BAQs, SSRS, REST, DMT, processes

If a `both` page has a part that only applies to one client, call it out with an aside
(`:::note[Kinetic only]`). Don't pin pages to exact versions unless a behavior genuinely changed in one;
then say so inline ("From 2023.1, BPM code uses EF Core…").

## 4. Page shape

```md
---
title: Short, specific, sentence-case title
description: One sentence saying what the reader will learn or fix (used in search and link previews).
env: kinetic | classic | both
sources:
  - title: "EpiUsers: thread title"
    url: https://www.epiusers.help/t/...
---

Opening paragraph: what this is and when you'd need it. No heading above it.

## Sections that fit the page type
```

Page types and their usual sections:

- **How-to**: Before you start (optional) → Steps (numbered) → Notes / gotchas
- **Troubleshooting**: Symptom (quote the error text exactly) → Cause → Fix → Prevention (optional)
- **Concept**: explanation in prose, then a table or diagram if it helps, then "When to use it"
- **Reference**: short intro, then tables
- **Code pattern**: What it does → Where it runs (directive/method/event) → Example → How it works → Variations

## 5. Voice and formatting

- Plain, direct, second person ("Open **Application Studio**…"). Short paragraphs.
- UI labels in **bold**; tables, fields, methods, BAQ IDs and code in `code`.
- Use the menu-path arrow for navigation: **System Management > Business Process Management > Method Directives**.
- Specify the language on every code block (`csharp`, `sql`, `js`, `json`).
- Use Starlight asides for warnings and tips: `:::caution`, `:::tip`, `:::note`, `:::danger`.
- Link between wiki pages with root-relative links: `/platform/bpm/method-vs-data-directives/`.
- Screenshots are welcome where they show something words can't (App Studio property panels, BPM
  designer canvases, menu locations). Store them in `public/images/` with lowercase, hyphenated names
  and reference them root-relative: `![Provider Model with a BAQ where clause](/images/where-clause.png)`.
  Alt text says what the image shows. Before adding one, check it doesn't show personal data (names,
  emails) or anything identifying a company.
- Where a screenshot would help but none exists, leave `<!-- TODO screenshot: what it should show -->`.
- Don't pad. If a topic is one tip, fold it into a related page instead of making a stub page.

## 6. Accuracy

- Don't state anything you can't back up from the source material or well-established Epicor behavior.
- Don't invent business-object methods, table fields or menu paths. If the source doesn't make it clear,
  leave it out or mark it `<!-- TODO verify: ... -->`.
- Fix errors found in source material rather than carrying them over.

---
title: Serial number masks and prefixes
description: Define the format of generated and manually entered serial numbers with masks, keep serials unique across sites with prefixes, store a CAGE code, and fix prefixes in bulk with DMT.
env: both
sidebar:
  order: 3
---

A serial number format is a business decision before it's a setting. Customers, service engineers and
auditors will read these numbers for years, so decide what a serial should tell you (site, product,
date, sequence) and then build a mask that produces it.

## How the pieces fit

1. **Company Configuration** defines the *mask characters*, the symbols that stand for "any letter",
   "any digit", "month" and so on. Most sites keep the defaults.
2. **Serial Mask Maintenance** defines each *mask*: a pattern built from those characters, plus a
   prefix length, suffix length and starting sequence.
3. **Part Maintenance** links a serialized part to a mask (or a simple prefix) through its serial
   number format.

## Mask characters

The default characters, as set in Company Configuration:

| Character | Stands for | Allowed in |
|---|---|---|
| `&` | Any alphanumeric character | Both mask types |
| `@` | A letter | Both mask types |
| `#` | A digit | Both mask types |
| `^` | A mandatory character of any kind | Validation masks only |
| `!` | An optional alphanumeric character, only at the end | Validation masks only |
| `~` | A character stripped off when the internal serial is stored, only at the start or end | Validation masks only |
| `<D>` | Day | Generation masks only |
| `<M>` | Month, as two characters | Generation masks only |
| `<YY>` / `<YYYY>` | Two- or four-digit year | Generation masks only |
| `<Px>` | The first *x* characters of the part number | Generation masks only |

For example, `@@@######<M><YYYY>` produces three letters, a six-digit sequence, then the month and
four-digit year the serial was created.

<!-- TODO verify: whether plain literal characters (for example a fixed site code) can be typed directly into a generation mask -->

## Two kinds of mask

- **Generation** masks decide the format of serial numbers Epicor creates for you. The sequence part
  counts up from the mask's starting sequence.
- **Validation** masks check serial numbers people *type in*, for example supplier serials at
  receipt. They aren't applied to generated numbers.

If you let users type serials for a part, a validation mask is the cheapest way to stop typos and
made-up formats getting into the system.

## Prefixes and multiple sites

A mask and its sequence can be shared by the same part in several sites, which means two sites can
generate the same number. Give each site its own **prefix** (or suffix) so serials stay unique across
the company.

The prefix used for a part's generated serials is held per part and site, on the part's site record
(`PartPlant.SNPrefix`).

### Fixing prefixes in bulk with DMT

If parts carry the wrong prefix, often an old one inherited from an earlier setup or revision, fix
them with a **Part Plant** DMT update rather than editing each part. The file needs only the key and
the prefix:

```text
Company,PartNum,Plant,SNPrefix
EPIC06,PART-1001,MfgSys,SNA
EPIC06,PART-1002,MfgSys,SNA
```

New serials use the corrected prefix. Serials already created keep the number they were given. See
the [DMT overview](/platform/dmt/overview/) for how to run and check a load.

## Storing a CAGE code

Suppliers to the US government are identified by a **CAGE code** (Commercial and Government Entity
code), a short identifier that is often required in part marking and serial identification on
government contracts. A company's CAGE code rarely changes.

Epicor has no dedicated field for it, so store it once and reuse it:

- **Company level** is usually right: a UD column added to the company configuration table (`XaSyst`),
  shown on **Company Configuration** near the serial mask settings.
- **Site level** makes sense when sites hold different codes: a UD column on the site configuration
  table (`PlantConfCtrl`).

Then bring it into serial numbers or labels where needed, for example through the serial prefix, a
BPM when serials are assigned (see [Setting serial numbers in code](/processes/serial-numbers/setting-serials-in-code/)),
or the label data.

## Related

- [How serial tracking works](/processes/serial-numbers/serial-number-logic/)
- [Troubleshooting serial numbers](/processes/serial-numbers/troubleshooting/): masks overridden by
  users, and broken sequences

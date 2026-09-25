---
title: Excel and data gotchas
description: Stop Excel and DMT from quietly changing your data, including stripped leading spaces, lost leading zeros and line breaks that come back as record separator characters.
env: both
sidebar:
  order: 4
---

Most DMT files pass through Excel on the way in, and often came out of Epicor through Excel as well.
Excel is helpful in ways that damage data: it trims, converts and reformats values without telling you.
These are the traps that come up most, and how to spot them before a load.

## Leading spaces are stripped

**What happens:** a value that starts with a space, such as a part number or code entered with a
leading space years ago, loses that space when DMT reads the file. An update then can't find the
record, or an add creates a near-duplicate.

**Fix:**

- Format the column as **Text** in Excel before pasting or typing values, so the space is kept as part
  of the value.
- Better still, fix the data. A key with a leading space causes problems everywhere else too
  (searches, BAQ joins, integrations), so treat the DMT failure as a prompt to clean it up.

**Checking what the first character really is.** A value can *look* like it starts with a space when
it's actually a tab or a non-breaking space pasted from a web page. To see the character code:

1. Format an empty cell as **Text**.
2. Select it, press **F2** to edit, and paste the value in.
3. In the cell below, enter:

   ```text
   =CODE(LEFT(A2,1))
   ```

   replacing `A2` with the cell you pasted into.

`32` is an ordinary space, `9` a tab and `160` a non-breaking space. Each needs a different fix, and
only the ordinary space is what DMT strips.

## Line breaks come back as a strange character

**What happens:** when you export multi-line text (comments, descriptions) from Epicor to Excel, the
line breaks are replaced with the **record separator** control character, `U+001E` (decimal 30, hex
`0x1E`). It is invisible or shows as a small box. Load that file back with DMT and the text arrives as
one line with junk characters in it.

**Fix:** before loading, turn the separator back into a line break, for example with a helper column:

```text
=SUBSTITUTE(A2,CHAR(30),CHAR(10))
```

Copy the helper column and paste it back over the original as values.

## Leading zeros and long numbers

**What happens:** Excel treats anything that looks like a number as a number. `00123` becomes `123`,
and a long numeric code turns into scientific notation (`1.23E+15`) and loses its last digits.

**Fix:** format ID and code columns as **Text** before the data goes in, or import CSV files with the
Text import wizard and mark those columns as text. Once Excel has converted a value, the original
digits are gone; re-export rather than trying to repair it.

## A checklist before loading

- Key columns formatted as **Text**.
- No leading or trailing spaces unless you mean them (`=LEN(A2)<>LEN(TRIM(A2))` finds them).
- No `CHAR(30)` left in text columns.
- Header row matches the template's field names exactly.
- A small test batch loaded and checked on screen.

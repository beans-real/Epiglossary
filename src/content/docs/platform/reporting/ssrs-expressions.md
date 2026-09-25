---
title: SSRS expressions and custom code
description: A cookbook of SSRS expressions and report custom code for Epicor reports, covering nested IIF, blank values, line breaks, check boxes, date ranges, counting distinct records, page footer totals and CSV column names.
env: both
sidebar:
  order: 5
sources:
  - title: "Stack Overflow: Nested IIF with multiple conditions SSRS"
    url: https://stackoverflow.com/questions/15166452/nested-iif-with-multiple-conditions-ssrs
  - title: "Stack Overflow: Empty or null value display in SSRS text boxes"
    url: https://stackoverflow.com/questions/3442296/empty-or-null-value-display-in-ssrs-text-boxes
  - title: "Stack Overflow: SSRS default date previous year first day and last day"
    url: https://stackoverflow.com/questions/73748145/ssrs-default-date-previous-year-first-day-and-last-day
---

SSRS expressions are written in Visual Basic. Almost every property in Report Builder that has an
**fx** button (a text box value, visibility, color, a tablix filter) can take one. For anything longer
than a line, put a function in the report's custom code and call it from the expression. These are the
patterns that come up again and again on Epicor forms.

## Where the code goes

- **Expressions**: right-click a text box and choose **Expression**, or click **fx** next to any
  property. Expressions start with `=`.
- **Custom code**: right-click outside the page, choose **Report Properties > Code**, and paste VB
  functions. Call them as `=Code.FunctionName(...)`.

Epicor reports have several datasets, so outside a table you must name the dataset in an aggregate,
e.g. `=First(Fields!CustID.Value, "OrderHed")`. See
[Troubleshooting](/platform/reporting/troubleshooting/#the-value-expression-refers-directly-to-the-field-without-specifying-a-dataset-aggregate).

## Choose between several values: nested IIF

`IIF(condition, valueIfTrue, valueIfFalse)` takes commas where other languages use *then* and *else*.
For more than two outcomes, put another `IIF` in the false branch, and combine tests with `And` / `Or`:

```vb
=IIF(Fields!VoidOrder.Value = True, "Void",
   IIF(Fields!OpenOrder.Value = True And Fields!OrderHeld.Value = True, "Open - on hold",
     IIF(Fields!OpenOrder.Value = True, "Open", "Closed")))
```

For long lists, `Switch` reads better. It returns the value paired with the first true condition:

```vb
=Switch(Fields!VoidOrder.Value = True, "Void",
        Fields!OpenOrder.Value = True And Fields!OrderHeld.Value = True, "Open - on hold",
        Fields!OpenOrder.Value = True, "Open",
        True, "Closed")
```

:::caution
`IIF` evaluates *both* branches before choosing one, so `=IIF(Fields!Qty.Value = 0, 0,
Fields!Amount.Value / Fields!Qty.Value)` can still error on the division. Guard the divisor inside the
branch too, or move the calculation into custom code.
:::

## Show something when a value is blank

A field can be `Nothing` (null) or an empty string, and they need different tests. Converting to a
string first covers both:

```vb
=IIF(IsNothing(Fields!ShipToName.Value) Or CStr(Fields!ShipToName.Value) = "",
     "(none)", Fields!ShipToName.Value)
```

To hide a row when several fields are all blank, join them and test the result in the row's
**Hidden** property:

```vb
=Trim(Fields!Address1.Value & Fields!Address2.Value & Fields!Address3.Value) = ""
```

## Keep line breaks in comments

Epicor comment fields often come through with carriage returns that SSRS doesn't render as new lines.
Swap them for a full line break:

```vb
=Replace(Fields!OrderComment.Value, Chr(13), vbCrLf)
```

If the output becomes double-spaced, the field already had full line breaks and doesn't need this.

## Show a boolean as a check box

Set the text box font to **Wingdings** and return the character for a ticked or empty box:

```vb
=IIF(Fields!Inspected_c.Value, Chr(254), "o")
```

In Wingdings, `Chr(254)` is a ticked box and `o` is an empty one.

## Date defaults and ranges

Epicor fills the report's SSRS parameters itself and never shows SSRS's own parameter prompt, so on
Epicor reports date expressions are most useful in tablix filters, text boxes and calculated fields.

First and last day of last year:

```vb
=DateSerial(Year(Today()) - 1, 1, 1)
=DateSerial(Year(Today()) - 1, 12, 31)
```

`DateSerial(year, month, day)` builds a date from three numbers, so the same idea gives the first day
of this month (`=DateSerial(Year(Today()), Month(Today()), 1)`) and so on.

### Start and end of the current week, month and year

Put these in **Report Properties > Code**:

```vb
' Weeks run Monday to Sunday
Public Function StartOfWeek(ByVal d As Date) As Date
    Return d.Date.AddDays(-(Weekday(d, FirstDayOfWeek.Monday) - 1))
End Function

Public Function EndOfWeek(ByVal d As Date) As Date
    Return StartOfWeek(d).AddDays(6)
End Function

Public Function StartOfMonth(ByVal d As Date) As Date
    Return New Date(d.Year, d.Month, 1)
End Function

Public Function EndOfMonth(ByVal d As Date) As Date
    Return StartOfMonth(d).AddMonths(1).AddDays(-1)
End Function

Public Function StartOfYear(ByVal d As Date) As Date
    Return New Date(d.Year, 1, 1)
End Function

Public Function EndOfYear(ByVal d As Date) As Date
    Return New Date(d.Year, 12, 31)
End Function
```

Then filter a tablix on its date field with the operator **Between** and the values
`=Code.StartOfMonth(Today())` and `=Code.EndOfMonth(Today())`. Put three tables side by side with week,
month and year filters to get a "this week / this month / this year" report from one dataset.

The end dates are at midnight. That's fine for Epicor's date-only fields; if you filter a date-time
column, compare with *less than* the next day's start instead.

## Count each record once

When a dataset has several rows per order (one per line or release), `Count` counts rows, not orders.
Use `CountDistinct`, and wrap the key in an `IIF` to count only the ones that meet a condition:

```vb
=CountDistinct(Fields!OrderNum.Value)
=CountDistinct(IIF(Fields!DaysLate.Value > 30, Fields!OrderNum.Value, Nothing))
```

If you need a per-row flag instead (to sum a header value only on the first row of each order), use a
small piece of custom code that remembers which keys it has seen:

```vb
Private seen As New System.Collections.Generic.HashSet(Of String)

' Returns 1 the first time a key is seen in a bucket, 0 after that
Public Function FirstTime(ByVal bucket As String, ByVal key As Object) As Integer
    Dim k As String = bucket & "|" & CStr(key)
    If seen.Contains(k) Then Return 0
    seen.Add(k)
    Return 1
End Function
```

Call it once per row, for example in a hidden column: `=Code.FirstTime("late30", Fields!OrderNum.Value)`.
The bucket name lets one function track several independent counts.

:::caution
Custom code that remembers state depends on SSRS evaluating each row once, in order. Page breaks,
re-rendering and calling it from several text boxes can all upset it, so test with multi-page output.
Don't declare the collection `Shared`: shared variables live across every run of the report on the
server, so one user's run would affect another's.
:::

## Totals in the page header or footer

The page header and footer can't read dataset fields directly; they only take aggregates or references
to text boxes in the body. To show a running total at the bottom of each page:

1. In the body, add a (possibly hidden) text box named `RunVolume` with a running total, for example
   the shipped volume per order:

   ```vb
   =RunningValue(Fields!Cartons.Value * Fields!CartonVolume.Value, Sum, "OrderNum")
   ```

   The last argument is the scope (a group name or dataset) the total resets on.

2. In the footer, refer to that text box:

   ```vb
   =ReportItems!RunVolume.Value
   ```

`ReportItems` in a header or footer only sees items rendered on the current page, so the footer shows
the value as of the last row on that page.

## Column names in CSV exports

When a report is exported to CSV, each column's header is the text box's **DataElementName**, which
defaults to its **Name**. The table wizard names text boxes after their fields, but columns you add by
hand get names like `Textbox12`, which then appear as CSV headers. Rename those text boxes (or set
**DataElementName**) to something meaningful.

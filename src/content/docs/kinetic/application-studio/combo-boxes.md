---
title: Combo boxes
description: Set up erp-combo-box drop-downs with a static list, a BAQ or UD codes, let users type their own value, and hide specific options with a row filter.
env: kinetic
sidebar:
  order: 12
sources:
  - title: "EpiUsers: Kinetic static list combo box"
    url: https://www.epiusers.help/t/kinetic-static-list-combo-box/80604/3
---

The Kinetic drop-down is the `erp-combo-box` component. Where its options come from is set under **Advanced**. The same component handles a fixed list, the results of a BAQ and user-defined codes. Whichever you use, the combo box always needs an **EpBinding**. The selected value is written to that column, so without it the selection goes nowhere.

![erp-combo-box Properties panel showing Drop Down Style, Append List, Selected Value, Data Mode, BAQ Query, TextField and Value Field (set to display and value) and Where Clause](/images/8094c2aaa9a8669a6fb94f598c9b317fe467701b.png)

## Static list

There are two ways to type in a fixed list.

### Option 1: a plain array (simplest)

When the stored value and the displayed text are the same:

1. Add the combo box and set **Data > EpBinding**, e.g. `TransView.XX_Status`.
2. Under **Advanced**, find **data** and click the pencil to open the JSON editor.
3. Enter a JSON array of strings:

   ```json
   ["Open", "On Hold", "Closed"]
   ```

   ![JSON editor holding a plain array of job-title strings, opened from the pencil on the combo box's data property under List](/images/pasted-image-20251009140845.png)

4. Make sure **Filterable** and **Personalizable** are ticked, then save and preview.

### Option 2: display and value pairs

When users should see one thing and the database should store another (for example, show "Vertical bar" but store `bvs`):

1. Under **Advanced > List**, add a row per option with a **display** and a **value**.
2. Set **TextField** to `display` and **Value Field** to `value`.

:::caution
For static lists, **TextField** and **Value Field** must be exactly `display` and `value`, in lower case. Anything else and the drop-down shows `[object Object]` or nothing at all.
:::

## Let users type a value that isn't in the list

1. At the bottom of **Advanced**, tick **Allow Custom**.
2. Set **Drop Down Style** to `DropDown`.

`DropDown` lets users type in the combo's text area. `DropDownList` restricts them to the listed options.

## Options from a BAQ

A BAQ-driven list stays current without anyone maintaining it. Build and share a BAQ that returns one row per option, with a key column and a description column.

1. **Data > EpBinding**: the column to store the selection in, e.g. `TransView.XX_PartClass`.
2. **Advanced > Data Mode**: `rows`.
3. **Advanced > BAQ Query**: the BAQ ID, e.g. `XX_PartClassList`.
4. **Advanced > TextField**: the column users see, e.g. `PartClass_Description`.
5. **Advanced > Value Field**: the key column stored in the binding, e.g. `PartClass_ClassID`.

:::note
**TextField** and **Value Field** take the BAQ's column **aliases**, which use an underscore (`PartClass_ClassID`), not the `Table.Field` form you'd write in SQL.
:::

The combo shows every row the BAQ returns, duplicates included. If you see the same option twice, fix the BAQ (group it or make it distinct) rather than the combo. The **Where Clause** property can filter the BAQ further.

## Options from UD codes

For lists maintained in **User Codes Maintenance**, use the reusable combo instead of writing a BAQ:

1. Set **Data > EpBinding** to the field that stores the code.
2. In the **Reusable Combo** group, set **Type** to `UserCodes.UserCodesCombo` and **Sub Type** to `default`. The filter properties fill in automatically, with a filter on the code type parameter.
3. In **Filters Params**, set the code type: `CodeTypeParam = XX_SOAP` (your code type ID, with no quotes or other syntax around it).
4. Under **Advanced**, set **Drop Down Style** to `DropDownList` if users must pick from the list.

## Hide specific options

To keep some options out of the list without changing the source, use **Advanced > Row Filter**. It filters on the list's own columns, so for a static list with display/value pairs you filter on `display` (or `value`):

```sql
display <> "Job" AND display <> "Return Shipment"
```

For a BAQ-driven combo, use the BAQ column aliases in the filter instead.

![Combo box Advanced properties with TextField display, Value Field value and a Row Filter on display that excludes the Job and Return Shipment options](/images/b8f073f03515d091d8e347aa087437d4adf0262e.png)


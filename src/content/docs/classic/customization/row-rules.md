---
title: Row rules
description: Style, disable or highlight Classic form controls from data with the Rule Wizard or coded row rules, and get around a base rule that locks a field you still need to edit.
env: classic
sidebar:
  order: 7
sources:
  - title: "EpiUsers: Customer shipment textbox enable after shipped checkbox"
    url: https://www.epiusers.help/t/customer-shipment-textbox-enable-after-shipped-checkbox/43986
---

A **row rule** watches a data view column and applies a setting to controls whenever a condition is true: highlight a field, show it as a warning or error, make it read-only, hide it. Because rules are evaluated from the data every time it changes, they're more reliable than setting control properties in event handlers. Base Epicor forms use row rules heavily, which is also why a control sometimes refuses to stay enabled.

## Creating a rule with the Rule Wizard

1. In the Customization Tools Dialog, open **Wizards > Rule Wizard**.
2. Pick the **data view** and click **New Rule**.
3. Set the condition: a column, an operator, and either a value or another column to compare with.
4. Add one or more **actions**: a **SettingStyle** (such as `OK`, `Warning`, `Error`, `Highlight` or `ReadOnly`) and the column or controls it applies to.
5. Save the customization. The rule appears under **Custom Row Rules** in the tree view, where you can edit it later.

Example: on sales order lines, show the part number as a warning whenever the discount is over five percent.

For conditions a single comparison can't express, the wizard can generate a **custom condition** or **custom action**: stubs in the Script Editor where you return true/false or apply settings in code.


## Coded row rules

The wizard writes ordinary C#, and you can write the same yourself, for example to add rules to a custom data view you created in code:

```csharp
private void AddStockRules()
{
    // Error style on QtyNeeded when more is needed than is on hand
    RuleAction showError = RuleAction.AddControlSettings(this.oTrans, "XX_Stock.QtyNeeded", SettingStyle.Error);
    RowRule shortRule = new RowRule("XX_Stock.QtyNeeded", RuleCondition.GreaterThan, "XX_Stock.OnHandQty",
                                    new RuleAction[] { showError });

    ((EpiDataView)oTrans.EpiDataViews["XX_Stock"]).AddRowRule(shortRule);
}
```

- The third constructor argument can be a literal value or, as here, another `View.Column` to compare against.
- Call the method from `InitializeCustomCode()` after the view exists.
- For a traffic-light effect, add one rule per band (for example OK when needed is at or below on-hand, Error when above).

## When a base rule locks a field you need

A classic example: you add a UD field to the **Summary** tab of **Customer Shipment Entry** so users can record something after the pack has shipped. As soon as **Shipped** (`ReadyToInvoice`) is ticked, your field goes grey, while the base **Tracking Number** field stays editable.

The cause is a base row rule on `ShipHead`: when `ReadyToInvoice` is true it disables the entire row except for a short list of columns, and your UD column isn't on that list. Setting `ReadOnly = false` in code won't help, because the rule re-applies every time the data changes.

You have three ways out, from least to most invasive:

| Option | How | Trade-off |
|---|---|---|
| Update it from somewhere else | An updatable BAQ (in a dashboard or an embedded grid on the form) that writes the UD field | No change to base behaviour; a separate place to type |
| Route it through a BPM | Bind your text box to a `CallContextBpmData` field instead of the UD column, and have a BPM on `CustShip.Update` copy it to `ShipHead` | Works on the same screen; you own a small BPM |
| Replace the base rule | Remove the base rule in the customization and add your own copy with your column in the exception list | Most direct, but you're now maintaining a copy of Epicor's rule through every upgrade |

The first two are generally preferred: they don't override core logic and they keep working if Epicor changes the base rule. For the updatable BAQ route in Kinetic, see [Updatable BAQ grids](/kinetic/application-studio/updatable-baq-grids/); the BAQ itself is the same in both clients.

:::caution
A disabled field is often disabled for a reason. Before working around a base rule, check the field isn't something downstream processes rely on staying fixed once the record reaches that status.
:::

## Related

- [Data rules](/kinetic/application-studio/data-rules/): the Kinetic equivalent of row rules.
- [Controls and styling](/classic/customization/controls-and-styling/): colouring controls in code when a rule isn't enough.

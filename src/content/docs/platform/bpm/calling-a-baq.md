---
title: Run a BAQ from BPM code
description: Execute an existing Business Activity Query from a directive's custom code with the DynamicQuery service and read its results.
env: both
sidebar:
  order: 13
---

Sometimes the data a directive needs is already defined in a BAQ, perhaps one that also feeds a
dashboard, or one whose rules business users maintain themselves. Instead of rewriting it as LINQ, the
directive can run the BAQ and read the rows.

## When to use it

Run a BAQ when:

- The logic already lives in a BAQ and you want one definition, not two.
- Non-developers should be able to adjust the criteria (for example which parts count as restricted)
  without touching the directive.

Prefer LINQ against `Db` when the query is simple or performance matters: it's faster, and it doesn't
break if someone renames or edits the BAQ. For no-code options, a Condition's designed query or a
**Fill Table by Query** widget may be enough.

## Example

This custom code runs a BAQ called `XX_RestrictedParts` and collects the part numbers it returns:

```csharp
var partNums = new List<string>();

using (var dq = Ice.Assemblies.ServiceRenderer.GetService<Ice.Contracts.DynamicQuerySvcContract>(Db))
{
    var query = dq.GetByID("XX_RestrictedParts");
    var execParams = dq.GetQueryExecutionParameters(query);

    System.Data.DataSet results = dq.Execute(query, execParams);

    foreach (System.Data.DataRow row in results.Tables["Results"].Rows)
    {
        partNums.Add(row["Part_PartNum"].ToString());
    }
}

restrictedParts = string.Join(", ", partNums);   // a directive variable, used later in a message
```

## How it works

1. `ServiceRenderer.GetService<…>(Db)` gets an instance of the DynamicQuery service that shares the
   directive's database context. Wrapping it in `using` disposes it when you're done.
2. `GetByID` loads the BAQ definition by its ID.
3. `GetQueryExecutionParameters` builds the execution settings for that query, including any BAQ
   parameters.
4. `Execute` runs it and returns an ADO.NET `DataSet`. The rows are in the `Results` table.
5. Result columns are named `Table_Field`, such as `Part_PartNum` or `OrderHed_OrderNum`. Calculated
   fields are `Calculated_FieldName`. Check the column names in the BAQ designer's test results.

The directive needs a reference to the DynamicQuery contract assembly in its usings and references
settings if it isn't already available.
<!-- TODO verify: whether the DynamicQuery contract reference must be added manually on current versions -->

## Passing BAQ parameters

If the BAQ has parameters, set them on the execution parameters before calling `Execute`:

```csharp
execParams.ExecutionParameter.Add(new Ice.Tablesets.ExecutionParameterRow
{
    ParameterID = "PartNum",
    ParameterValue = "PART-1001",
    ValueType = "nvarchar",
    IsEmpty = false
});
```

<!-- TODO verify: ExecutionParameterRow property names and ValueType values on a current version -->

## Things to know

- **The BAQ ID is a dependency.** Note in the BAQ's description that a directive uses it, so nobody
  deletes or renames it without checking.
- **Security.** The BAQ runs within the session of the call that triggered the directive. Test with a
  user who has restricted access to make sure it still returns what the directive expects.
  <!-- TODO verify: how BAQ security settings apply when a BAQ is executed from BPM code -->
- **Company.** If the BAQ isn't shared or isn't flagged for all companies, it may not be found when the
  directive runs in another company.
- **Cost.** Running a BAQ has more overhead than a direct query. Don't run one on every save if a
  cheaper condition can rule the save out first; see
  [BPM conditions](/platform/bpm/conditions/#keep-conditions-cheap).

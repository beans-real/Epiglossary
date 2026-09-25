---
title: Run a BAQ from a function
description: Execute a BAQ from function code with the DynamicQuery service, pass BAQ parameters, read the results safely, drive batch updates from a query, and adjust a query definition at run time.
env: both
sidebar:
  order: 5
sources:
  - title: "EpiUsers: BAQ on the fly"
    url: https://www.epiusers.help/t/baq-on-the-fly/121248/7
---

A function can run any BAQ through the `DynamicQuery` service and work with the rows it returns. This
is a good fit when the selection rules already live in a BAQ that business users maintain, or when the
same query also feeds a dashboard. The technique is the same one used in
[Run a BAQ from BPM code](/platform/bpm/calling-a-baq/); this page covers the function-specific setup
and the patterns that tend to follow.

## Setup

Add the **DynamicQuery** service (`Ice.BO.DynamicQuery`) under the library's **References > Services**.
Add any tables you'll update afterwards under **References > Tables**.

## Run a BAQ without parameters

```csharp
this.CallService<Ice.Contracts.DynamicQuerySvcContract>(dq =>
{
    var execParams = new Ice.Tablesets.QueryExecutionTableset();
    System.Data.DataSet results = dq.ExecuteByID("XX_OpenOrders", execParams);

    foreach (System.Data.DataRow row in results.Tables[0].Rows)
    {
        int orderNum = Convert.ToInt32(row["OrderHed_OrderNum"]);
        // ...
    }
});
```

`ExecuteByID` loads the BAQ by ID and runs it in one call. An empty `QueryExecutionTableset` is enough
when the BAQ has no parameters.

## Run a BAQ with parameters

Ask the service for the BAQ's parameter list, fill in the values, then execute:

```csharp
this.CallService<Ice.Contracts.DynamicQuerySvcContract>(dq =>
{
    var execParams = dq.GetQueryExecutionParametersByID("XX_JobOperations");

    var jobParam = execParams.ExecutionParameter.FirstOrDefault(p => p.ParameterID == "JobNum");
    if (jobParam != null)
        jobParam.ParameterValue = jobNum;

    var results = dq.ExecuteByID("XX_JobOperations", execParams);
    // ...
});
```

Parameter values are strings; convert numbers and dates with `ToString()` (use ISO format for dates).

## Reading the results

- Columns are named `Table_Field`, for example `Customer_CustID`, and calculated fields are
  `Calculated_FieldName`. Copy the names from the BAQ designer's test grid.
- Check for `DBNull` before converting. A left join or an empty calculated field returns `DBNull`, and
  `Convert.ToInt32(DBNull.Value)` throws.
- Check the row count before you rely on a row existing.

```csharp
var table = results.Tables[0];
if (table.Rows.Count == 0)
{
    message = "The query returned no rows.";
    return;
}

foreach (System.Data.DataRow row in table.Rows)
{
    string custID = row["Customer_CustID"] as string ?? "";
    decimal newLimit = row["Calculated_NewLimit"] == DBNull.Value
        ? 0m
        : Convert.ToDecimal(row["Calculated_NewLimit"]);
    // ...
}
```

LINQ works on the rows too, which helps when a BAQ returns several rows per key and you only want one:

```csharp
var bestPerCustomer = table.AsEnumerable()
    .GroupBy(r => r.Field<int>("Customer_CustNum"))
    .Select(g => g.OrderByDescending(r => r.Field<decimal>("Calculated_Balance")).First())
    .ToList();
```

## Pattern: a BAQ-driven maintenance job

A common use is a scheduled job where a BAQ decides *which* records need changing and the function
makes the change. For example, a nightly credit review:

1. A BAQ `XX_CreditReview` returns active customers with a calculated new credit limit, applying all
   the business rules (sales in the last 12 months, open order value, age of the account).
2. A function runs the BAQ and updates each customer whose limit differs.
3. The function is [scheduled](/platform/functions/scheduling-functions/) to run overnight.

```csharp
int changed = 0;

this.CallService<Ice.Contracts.DynamicQuerySvcContract>(dq =>
{
    var rows = dq.ExecuteByID("XX_CreditReview", new Ice.Tablesets.QueryExecutionTableset())
                 .Tables[0].Rows;

    this.CallService<Erp.Contracts.CustomerSvcContract>(custSvc =>
    {
        foreach (System.Data.DataRow row in rows)
        {
            int custNum = Convert.ToInt32(row["Customer_CustNum"]);
            decimal newLimit = Convert.ToDecimal(row["Calculated_NewLimit"]);

            var ds = custSvc.GetByID(custNum);
            var cust = ds.Customer[0];
            if (cust.CreditLimit == newLimit) continue;

            cust.CreditLimit = newLimit;
            cust.RowMod = "U";
            custSvc.Update(ref ds);
            changed++;
        }
    });
});

message = $"{changed} customer credit limits updated.";
```

Why this split works well:

- The rules are visible and testable in the BAQ designer. Anyone can run the BAQ to see which
  customers tomorrow's job will touch.
- Going through the Customer BO keeps validation and change logging. Updating `Db.Customer` directly
  would be faster but skips both.
- Because the function only changes rows that differ, running it twice does no harm.

The same shape handles "set customers inactive when they've had no sales for six months", "flag parts
with no usage" and similar housekeeping.

:::tip
Have the BAQ return only the rows that need changing. Filtering in the query is cheaper than looping
over every customer in C#, and the BAQ then doubles as a preview of the job.
:::

## Variation: change a BAQ's definition before running it

Occasionally you need the *shape* of a query to vary, for example a user picks which UD column a
recursive query should follow. `DynamicQuery` can load a BAQ definition, and you can alter it before
executing. One community approach serializes the definition to JSON, swaps a placeholder field name
for the real one, and runs the result:

```csharp
this.CallService<Ice.Contracts.DynamicQuerySvcContract>(dq =>
{
    var definition = dq.GetByID("XX_TemplateQuery");

    string json = Newtonsoft.Json.JsonConvert.SerializeObject(definition);
    json = json.Replace("XX_PlaceholderField", fieldName);   // must be a unique string

    var modified = Newtonsoft.Json.JsonConvert
        .DeserializeObject<Ice.Tablesets.DynamicQueryTableset>(json);

    output = dq.Execute(modified, new Ice.Tablesets.QueryExecutionTableset());
});
```

This is blunt: the replacement hits every occurrence of the text, so the placeholder must be a name that
appears nowhere else in the definition. Validate `fieldName` against a list of allowed columns before
using it, and consider whether a few fixed BAQs, or a query built with LINQ, would be simpler.

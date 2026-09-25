---
title: Run a report through REST
description: Run an Epicor SSRS report from an external program by getting its default parameters, calling RunDirect, and reading the rendered file back from the report list as Base64 data.
env: both
sidebar:
  order: 5
---

Running a report over REST isn't like calling a normal business object method. A report method doesn't
hand the report back in its response. Epicor sends the job to SSRS, SSRS renders it, and Epicor stores
the result in the report list table (`SysRptLst`), which is what the System Monitor's **Reports**
list shows. Your program then has to fetch it from there.

## The flow

1. **Get the report's parameters** from its report service (`Erp.RPT.<Report>Svc`), starting from
   the defaults.
2. **Change the parameters you need**, including two that make the report render to the report list:
   `AutoAction` and `SSRSRenderFormat`.
3. **Call `RunDirect`** with the parameters. A `200` response means the report has been generated.
4. **Read the newest matching row** from `SysRptLst` through a BAQ, take its `RptData` field, and
   Base64-decode it.
5. **Save or parse** the bytes: write a PDF to disk, or read a CSV straight into your program.

## Before you start

Create a BAQ, for example `XX_ReportOutput`, on `Ice.SysRptLst`:

- Display fields: `SysRptLst.RptData`, plus whatever identifies the row (its key, description and
  creation date and time)
- Criteria: limit to the API user's own rows, and if you can, to the marker described below
- Sort: newest first

## Example (Python)

This runs the WIP report for a date range and reads it as CSV. It reuses the `session` and `odata()`
helpers from [Call Epicor from another application](/platform/rest-api/calling-epicor/#a-reusable-client-python).

```python
import base64, csv

REPORT = "Erp.RPT.WIPReportSvc"

# 1. Default parameters
defaults = session.post(odata(f"{REPORT}/GetDefaults"), json={"ds": None})
defaults.raise_for_status()
ds = defaults.json()["parameters"]["ds"]

# 2. Adjust them
param = ds["WIPParam"][0]
param["AutoAction"] = "SSRSPreview"      # render into the report list
param["SSRSRenderFormat"] = "CSV"        # or "PDF"
param["InclJobsNotClosed"] = True
param["JobClosedStartDate"] = "2025-01-01T00:00:00Z"
param["JobClosedEndDate"] = "2025-01-31T00:00:00Z"

# 3. Run it
run = session.post(odata(f"{REPORT}/RunDirect"), json={"ds": ds})
run.raise_for_status()

# 4. Fetch the newest output
out = session.get(odata("BaqSvc/XX_ReportOutput/Data"), params={"$top": 1})
out.raise_for_status()
encoded = out.json()["value"][0]["SysRptLst_RptData"]
report_bytes = base64.b64decode(encoded, validate=True)

# 5a. Parse a CSV
for row in csv.DictReader(report_bytes.decode("utf-8").splitlines()):
    print(row)

# 5b. Or save a PDF
# if report_bytes[:4] == b"%PDF":
#     open("wip.pdf", "wb").write(report_bytes)
```

Parameter names differ for every report. Open the report service in the REST help page, call
`GetDefaults` there, and look at the parameter table it returns (here `WIPParam`) to see what you can
set.

## Finding the right output reliably

"The newest row" is only safe if nothing else runs the same report under the same user at the same
time. For anything busier, tag the run:

- Put a unique value (a GUID) in the parameter row's `TaskNote` before calling `RunDirect`.
- Filter the BAQ on the report list's `RptNote` for that value (make it a BAQ parameter).

That should find exactly your run's output, however many other reports are being printed.

## Things to know

- **`RunDirect` waits for the report.** A large report can take longer than your HTTP client's
  default timeout; raise the timeout for this call. For very large reports, submitting the task to the
  System Agent and polling for the output is kinder to the server.
- **Clean up.** Report list rows are kept until they're purged. A frequently run integration can fill
  the list; make sure your system's report cleanup covers the API user.
- **Access.** The API user needs security access to the report service and the BAQ, and to any data
  the report reads.
- **Inside Epicor**, the same idea works from an Epicor Function, which can also email the result:
  see [Email a report as a PDF attachment](/platform/functions/emailing-report-pdfs/).

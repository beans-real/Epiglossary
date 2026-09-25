---
title: Inventory transaction types
description: What each PartTran.TranType code means (PUR-STK, STK-MTL, MFG-CUS, ADJ-QTY and the rest), which process creates it, and how to query and trace it to the GL.
env: both
---

Every time Epicor moves a part quantity or changes its cost, it writes a row to the `PartTran` table. The `PartTran.TranType` column holds a short code that classifies what happened: a PO receipt to stock, an issue to a job, a shipment from a job, a cost adjustment. You'll run into these codes in the **Material Transaction Detail** report, the **Inventory/WIP Reconciliation** report, part and job trackers, and any BAQ built on `PartTran`.

The code also decides the accounting. Each inventory transaction type has its own posting rules inside the **COS and WIP** GL transaction type, so the code on the row determines which accounts get debited and credited when the costs are captured.

:::note
Inventory transaction types (the `TranType` codes on this page) are not the same thing as GL transaction types (the posting-rule sets in **GL Transaction Type Maintenance**). All the inventory codes are handled by one GL transaction type, **COS and WIP**.
:::

## Reading a code

Most codes follow a **FROM-TO** pattern: the left half says where the quantity or cost came from, the right half says where it went.

- `STK-MTL`: from **stock** to a job **material**, i.e. a material issue.
- `PUR-STK`: from a **purchase** receipt to **stock**.
- `MFG-CUS`: from a **manufacturing** job straight to a **customer**.
- `INS-DMR`: from **inspection** to a **DMR** (failed inspection).

Codes starting with `ADJ` break the pattern: the right half names *what* was adjusted (`ADJ-QTY` is a quantity adjustment, `ADJ-CST` a cost adjustment). A few codes, such as `LABOR` and `INVOICE`, aren't pairs at all.

A handy rule of thumb: a code with `STK` on either side changes on-hand inventory. `ADJ-QTY` and `ADJ-CST` also change the inventory quantity or value without saying `STK`.

### Prefix vocabulary

| Part | Meaning |
|---|---|
| `STK` | Stock: a warehouse and bin in inventory |
| `MTL` | A job material line |
| `ASM` | A job assembly |
| `SUB` | A subcontract operation on a job |
| `MFG` | The output of a manufacturing job (its WIP) |
| `WIP` | Job work in process (seen in `WIP-MFG`) |
| `PUR` | A purchase receipt, either against a PO or a miscellaneous receipt |
| `INS` | Inspection (the Quality Assurance module) |
| `DMR` | Discrepant Material Report |
| `REJ` | Rejected and written off |
| `CUS` | A customer shipment |
| `VEN` | A supplier (vendor), used for subcontract shipments |
| `PLT` | Another site (historically "plant"), via in-transit |
| `DRP` | A drop shipment |
| `KIT` | A sales kit parent part |
| `UKN` | "Unknown": outside tracked inventory, such as a miscellaneous issue or a non-inventory receipt |
| `RMA` | A customer return (Return Material Authorization) |
| `VAR` | Manufacturing variance |
| `CMI` / `SMI` | Customer-managed / supplier-managed inventory |
| `SVG` | Salvage from a job |
| `AST` / `FAM` | An asset in Asset Management / fixed assets (older code) |
| `SVR` / `SRV` | Service call (older codes) |
| `RAU` / `RMN` / `RMG` | Replenishment moves: automatic, manual, managed |
| `ADJ` | Adjustment; the suffix (`QTY`, `CST`, `MTL`, `SUB`, `PUR`, `DRP`, `CUS`) says what was adjusted |

## How to use the tables

Many codes cover several near-identical cases: the same movement against a manufacturing job or a service job (for a service call, service contract or warranty), or for an ordinary customer versus an inter-company customer. The tables summarise those variants instead of listing each one.

The **GL** notes describe the default (Standard) posting rules in broad terms. If your company uses Extended posting rules or has revised the COS and WIP rules, check **GL Transaction Type Maintenance** for the real behavior.

## Purchasing receipts

All of these come from **Receipt Entry** (PO receipts and miscellaneous receipts) unless noted.

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `PUR-STK` | Receipt into a warehouse and bin | PO or miscellaneous receipt to stock | Raises on-hand. Posts inventory against AP clearing. |
| `PUR-MTL` | Receipt straight to a job material | PO or miscellaneous receipt to a job (manufacturing or service) | No on-hand change; cost lands in the job's WIP. |
| `PUR-SUB` | Receipt against a subcontract operation | PO receipt of subcontract work | Cost goes to the job's WIP. |
| `PUR-INS` | Receipt sent to inspection instead of stock | PO or miscellaneous receipt that requires inspection | Quantity waits in inspection until **Inspection Processing** passes or fails it. |
| `PUR-UKN` | Receipt of a non-inventory ("other") item | PO or miscellaneous receipt of a line that isn't a stocked part | Posts to an expense account against AP clearing. |
| `PUR-CUS` | Buy-to-order receipt that is passed on to the customer | Receipt of a PO line linked to a buy-to-order sales order release | Covers ordinary and inter-company customers. |
| `PUR-DRP` | Receiving side of a drop shipment | **Drop Shipment Entry** | Always paired with a `DRP-CUS` row. The goods never enter your inventory. |
| `PUR-CMI` | Receipt into customer-managed inventory | PO or miscellaneous receipt to a CMI location | No GL entry. |
| `PUR-SMI` | Receipt into supplier-managed inventory | PO or miscellaneous receipt to an SMI location | No GL entry. |

## Stock movements and job issues

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `STK-STK` | Move between warehouses or bins | Inventory transfer within a site (or between sites whose GL division is the same) | On-hand moves; the total doesn't change. |
| `STK-UKN` | Miscellaneous issue out of, or return into, stock | **Issue Miscellaneous Material**, **Return Miscellaneous Material** | Posts inventory against the reason code or inventory adjustment account. |
| `STK-MTL` | Material issued to a job, or returned from one | **Issue Material**, **Mass Issue to Mfg**, backflushing, **Return Material** | Lowers on-hand (returns raise it); cost moves between inventory and the job's WIP. Covers manufacturing and service jobs. |
| `STK-ASM` | A stocked subassembly issued to, or returned from, a job assembly | **Issue Assembly**, **Return Assembly** | Same accounting as `STK-MTL`. |
| `RAU-STK` | Replenishment move, automatic | Moves generated in the background from part-warehouse replenishment settings | Completed in the material queue apps. Source to target inventory. |
| `RMN-STK` | Replenishment move, manual | **Replenishment Workbench**, Manual card | As above. |
| `RMG-STK` | Replenishment move, managed | **Replenishment Workbench**, Managed card | As above. |
| `MTL-STK` | | | |
| `ASM-STK` | | | |


## Transfers between sites

A cross-site transfer is recorded in two halves with an in-transit account in between. The sending site writes the first half and the receiving site writes the second.

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `STK-PLT` | First half: stock leaves the sending site | Shipping a transfer to another site | Inventory to in-transit. If both sites share a GL division, `STK-STK` is used instead of the `STK-PLT`/`PLT-STK` pair. |
| `MFG-PLT` | First half: a job's output leaves for another site | Job receipt where the demand is in another site | WIP to in-transit. |
| `PLT-STK` | Second half: arrives in stock at the receiving site | Receiving the transfer into a warehouse | In-transit to inventory. When the sites' GL divisions differ, inter-site AP/AR and sales/COS transfer accounts are posted as well. |
| `PLT-MTL` | Second half: arrives on a job material at the receiving site | Receiving the transfer to a job | In-transit to the job's WIP. |
| `PLT-ASM` | Second half: arrives on a job assembly at the receiving site | Receiving the transfer to a job assembly | In-transit to the job's WIP. First half is `STK-PLT` or `MFG-PLT`. |


## Manufacturing receipts and variances

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `MFG-STK` | Finished or partly finished parts received from a job to stock | Receipt from manufacturing, or **Auto Receive** on the last operation | Raises on-hand; WIP to inventory. |
| `MFG-WIP` | Make-direct part received from the job that built it into the job that needs it, same site | Job-to-job receipt | Source job's WIP to target job's WIP material. This row carries the GL entry. |
| `WIP-MFG` | The matching issue side of `MFG-WIP` | Written at the same moment as `MFG-WIP` | **No GL entry**; it exists so the target job shows the material issue. |
| `SVG-STK` | Salvaged material returned to stock from a job | Salvage receipt from a manufacturing job | WIP to inventory. Service jobs can't use salvage. |
| `MFG-VEN` | Parts shipped from a job to a subcontractor | Subcontract shipment | No GL entry; the cost stays on the job. |
| `MFG-VAR` | Leftover WIP difference when a job's relieved cost and actual cost don't match | **Capture COS/WIP Activity** (with cost of sales and variances posted), typically on closed jobs | Make-to-stock variances go to variance accounts; make-to-order variances go to cost of sales. See the tip below. |

:::tip[Why MFG-VAR seems to appear late]
Monetary amounts aren't posted when a transaction happens. They're calculated and optionally posted when **Capture COS/WIP Activity** runs. `MFG-VAR` rows only exist after that process has purged a closed job's remaining WIP. The **Inventory/WIP Reconciliation** report shows a preview of these as "Phantom Purge of WIP to COS" lines, but those are temporary and aren't `PartTran` rows.
:::

## Shipping and customers

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `STK-CUS` | Shipment to a customer from stock | **Customer Shipment Entry** | Lowers on-hand. Inventory to COS, or to AR clearing if **Use AR Clearing Account** is on. Covers inter-company customers too. |
| `MFG-CUS` | Shipment to a customer straight from a job (make to order) | **Customer Shipment Entry** | WIP to COS. The same code moves WIP to COS when a service call is closed and invoiced, and when certain project jobs close. For standard-costed parts the shipment is valued at standard and any difference becomes `MFG-VAR`. |
| `KIT-CUS` | Shipment of a sales kit from stock | **Customer Shipment Entry** | Follows the kit parent part; kit parent's inventory to COS. |
| `STK-KIT` | Component cost moved onto the kit parent when a kit ships | Shipping a sales kit | Component inventory to kit parent inventory. |
| `DRP-CUS` | Shipping side of a drop shipment | **Drop Shipment Entry** | Pairs with `PUR-DRP`. |
| `UKN-CUS` | Buy-to-order shipment of a part that doesn't carry an inventory quantity | Shipping a buy-to-order line for a non-quantity-bearing part | Posts to COS. |


## Inspection and DMR

Quantities that go into inspection come out one of three ways: they pass (back to where they belong), they fail to a DMR, or, for customer returns without the Quality Assurance module, they're rejected directly. DMR quantities are then accepted back or rejected.

**Into inspection**

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `STK-INS` | Stocked quantity flagged as nonconforming | **Nonconformance** entry for an inventory item | Inventory to the inspection account; lowers on-hand. |
| `MTL-INS` | Job material flagged as nonconforming | **Nonconformance** entry for a job material | Job WIP (including material burden) to inspection. |
| `ASM-INS` | Assembly quantity sent to inspection | Discrepant quantity in labor entry, a first article, or a nonconformance of type Assembly | No GL entry. |
| `SUB-INS` | Subcontract quantity sent to inspection | **Nonconformance** for a subcontract operation | No GL entry. The inspector can choose **Move Costs to DMR**. |
| `RMA-INS` | Customer return received for inspection | RMA receipt in **RMA Processing** | No GL entry. With Quality Assurance it goes to inspection; without it, the return is handled in **RMA Disposition**. |

**Out of inspection**

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `INS-STK` | Passed quantity received to stock | **Inspection Processing**; also RMA returns put back to stock | Raises on-hand. Credits inspection, or cost of returns for an RMA. |
| `INS-MTL` | Passed quantity delivered to a job material | **Inspection Processing**, or disposing an RMA to a job | Inspection or cost of returns to WIP. |
| `INS-SUB` | Passed subcontract quantity returned to the job | **Inspection Processing** | Inspection to WIP. |
| `INS-ASM` | Passed assembly quantity returned to the job | **Inspection Processing** (labor discrepancy, first article, assembly or subcontract nonconformance) | No GL entry. |
| `INS-DMR` | Failed quantity moved to a DMR | **Inspection Processing** failure; failing an RMA in **RMA Disposition** | For job-sourced nonconformances a GL entry is only made if **Move Cost to DMR** was selected. |
| `INS-REJ` | Failed customer return, rejected outright | **RMA Disposition** when Quality Assurance isn't licensed | Cost of returns to DMR write-off. |

**Out of DMR** (all from **DMR Processing**)

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `DMR-STK` | DMR quantity accepted into stock | Accepting to inventory | DMR account to inventory; raises on-hand. |
| `DMR-MTL` | DMR quantity accepted onto a job material | Accepting to a job | DMR account to WIP. |
| `DMR-ASM` | DMR quantity accepted back to a job assembly | Accepting to a job assembly | DMR to WIP, but only if the cost was moved to DMR during inspection. |
| `DMR-SUB` | DMR quantity accepted back to a subcontract operation | Accepting to a subcontract operation | Shares posting rules with `DMR-ASM`. See the legacy section. |
| `DMR-REJ` | DMR quantity rejected | Rejecting on the DMR | DMR account to the DMR write-off or reason code account (again only if the cost was moved to DMR for job-sourced items). |
| `DMR-CUS` | DMR quantity shipped out | **Return Shipment** in **DMR Processing** | DMR account to COS. |

## Adjustments

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `ADJ-QTY` | On-hand quantity increased or decreased | **Quantity Adjustment**; posting a count | Inventory against the reason code or inventory adjustment account. |
| `ADJ-CST` | Unit cost of a part changed, revaluing what's on hand | Manual cost adjustment, **Costing Workbench** or cost rollup posting | Also written automatically: at PO receipt of a standard-costed part when the PO price differs from standard (the difference goes to purchase price variance), and for some non-standard-cost transactions to keep the stock status value in step with the GL. |
| `ADJ-MTL` | Material cost on a job raised or lowered | **Job Adjustment**, Material card | WIP material against the adjustment account. Manufacturing and service jobs. |
| `ADJ-SUB` | Subcontract cost on a job raised or lowered | **Job Adjustment**, Subcontract card | Manufacturing and service jobs. |
| `ADJ-PUR` | Difference between the PO cost at receipt and the supplier's invoice cost | **AP Invoice Entry** (and AP debit memos) | AP clearing against a variance account. Also records job miscellaneous lines added to service jobs in AP. |
| `ADJ-DRP` | Invoice-versus-PO cost difference on a drop shipment | AP invoice matching of a drop-ship PO | Purchase variance against the drop ship account. |
| `ADJ-CUS` | Late cost on a FIFO-costed purchased part that has already shipped | Invoice or receipt cost arriving after the shipment | Only created when **Update Issue to Job/Shipment Costs** is selected in **Site Cost Maintenance**. |


:::caution
The order of cost and quantity events matters. If a standard-costed part is received while its standard cost is zero, the whole PO price becomes an `ADJ-CST` variance. Issue that stock to a job before you set the real standard and the job is charged nothing for it. Then when you do set the standard, a second `ADJ-CST` revalues whatever is still on hand.
:::

## Assets

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `STK-AST` | Stock turned into an asset | **Asset Addition** of type Transfer | Inventory to the asset clearing account; lowers on-hand. |
| `AST-STK` | An asset put back into stock | **Asset Disposal** of type Transfer | Asset clearing to inventory; raises on-hand. |
| `STK-FAM` | Stock transferred to fixed assets | Fixed asset transfer | |
| `FAM-STK` | Fixed asset transferred to stock | Fixed asset transfer | |


## Labor, invoicing and service

These show up next to inventory codes in COS/WIP reports and transaction-type filters, but they aren't stock movements.

| Code | What it records | Typical trigger | Notes |
|---|---|---|---|
| `LABOR` | Labor and burden charged to a job, plus labor job adjustments | Time and expense / labor entry; **Job Adjustment** labor card | Comes from labor detail records, not `PartTran`. WIP labor/burden against applied labor/burden. |
| `INVOICE` | Moves shipment cost from AR clearing to COS when the shipment is invoiced | AR invoicing, only when **Use AR Clearing Account** is on | Not used for field service call, contract or warranty invoices (those use `MFG-CUS`). |
| `MFG-SRV` | Cost of repairing a previously sold item that came back | | Job WIP to the cost of repairs account. |


## Legacy codes

You may find these in databases that have been upgraded from old versions. Don't build new logic around them, but don't be surprised to see them in history.

| Code | Was used for | Replaced by / status |
|---|---|---|
| `STK-DMR` | Rejecting stock directly to a DMR | `STK-INS`. Still recognised for older data. |
| `MTL-DMR` | Rejecting job material directly to a DMR | `MTL-INS`. Still recognised for older data. |
| `MFG-DMR` | Receiving job output directly to a DMR | Retired in the 3.x era. |
| `RMA-STK` | RMA receipt straight to stock | `RMA-INS` followed by inspection or RMA disposition. Retired in the 3.x era. |
| `SUB-DMR` | Subcontract nonconformance straight to a DMR | `SUB-INS`. Retired around 5.10. |
| `STK-SVR` | Material issued to a service call | `STK-MTL` against a service job. Retired around 5.10. |
| `DMR-SUB` | DMR quantity back to a subcontract operation | Older help says retired after 5.20, but the current posting rules still include it. |


:::note
Serial number history (`SNTran`) has its own `TranType` values that aren't inventory transaction types. For example, `MAINT` marks a serial number edited in **Serial Number Maintenance**.
:::

## Querying transactions

`PartTran` is keyed by `Company`, `SysDate`, `SysTime` and `TranNum`. `TranDate` is the date the transaction applies to; `SysDate` and `SysTime` are when it was actually entered. The two can differ, so pick the right one when a report has to line up with the GL.

A minimal query for everything issued to or received for one job:

```sql
SELECT pt.TranDate,
       pt.TranType,
       pt.PartNum,
       pt.TranQty,
       pt.ExtCost
FROM   Erp.PartTran pt
WHERE  pt.Company = 'EPIC06'
  AND  pt.JobNum  = 'JOB-000123'
  AND  pt.TranType IN ('STK-MTL', 'PUR-MTL', 'MFG-STK', 'MFG-CUS')
ORDER BY pt.SysDate, pt.SysTime, pt.TranNum;
```

In a BAQ, add `PartTran` as the only table and put the same conditions on the **Table Criteria** tab. For "anything that touched on-hand", filter on `TranType LIKE 'STK-%' OR TranType LIKE '%-STK' OR TranType IN ('ADJ-QTY', 'ADJ-CST')`.

### Linking a transaction to its GL lines

Once **Capture COS/WIP Activity** has run, the GL lines for a part transaction sit in `TranGLC`. The link is generic: `RelatedToFile` names the source table, and `Key1` to `Key3` hold that table's key values as text.

| `TranGLC` column | Matches |
|---|---|
| `RelatedToFile` | `'PartTran'` |
| `Key1` | `PartTran.SysDate` |
| `Key2` | `PartTran.SysTime` |
| `Key3` | `PartTran.TranNum` |

```sql
SELECT pt.TranNum,
       pt.TranType,
       pt.PartNum,
       g.GLAccount,
       g.BookDebitAmount,
       g.BookCreditAmount
FROM   Erp.PartTran pt
JOIN   Erp.TranGLC g
       ON  g.Company       = pt.Company
       AND g.RelatedToFile = 'PartTran'
       AND g.Key1 = CONVERT(varchar(20), pt.SysDate, 101)  -- match the date format your Key1 values use
       AND g.Key2 = CAST(pt.SysTime AS varchar(20))
       AND g.Key3 = CAST(pt.TranNum AS varchar(20))
WHERE  pt.Company  = 'EPIC06'
  AND  pt.TranType = 'STK-MTL';
```

Rows with no `TranGLC` match are either not captured yet, or a type with no GL entry under the standard rules: `WIP-MFG`, `MFG-VEN`, `PUR-CMI`, `PUR-SMI`, `ASM-INS`, `SUB-INS`, `INS-ASM` and `RMA-INS`. `INS-DMR`, `DMR-ASM` and `DMR-REJ` also skip the GL for job-sourced quantities when **Move Cost to DMR** wasn't selected.

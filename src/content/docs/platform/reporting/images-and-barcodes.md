---
title: Images, logos and barcodes
description: Put company and site logos, part pictures and Code 39 barcodes on Epicor SSRS forms, using replaceable images, UD fields holding a path or image data, external images and a barcode font.
env: both
sidebar:
  order: 6
sources:
  - title: "EpiUsers: Report style retrieve image list issues"
    url: https://www.epiusers.help/t/report-style-retrieve-image-list-issues/71421
  - title: "EpiUsers: Global company logo"
    url: https://www.epiusers.help/t/global-company-logo/114450
  - title: "EpiUsers: Printing site logo on forms"
    url: https://www.epiusers.help/t/printing-site-logo-on-forms/70652
  - title: "EpiUsers: Is there a way to print a part image on a SSRS report?"
    url: https://www.epiusers.help/t/is-there-a-way-to-print-a-part-image-on-a-ssrs-report/53167
---

Logos are the first thing people want changed on Epicor forms, and there's no single "company logo"
setting that every report picks up. You set images per report style, or you design your reports to
fetch the logo from data. This page covers both, plus part pictures and barcodes.

## Replaceable images on a report style

Several standard forms are built with a *replaceable image* slot, among them the AR invoice, customer
statement, debit memo, packing slip, purchase order, reminder letter, sales order acknowledgment and
supplier statement. For those, no RDL editing is needed:

1. Open **Report Style Maintenance** and select the report and style.
2. Go to **Styles > Style Detail > Companies/Images** and click **Retrieve** above the image list.
   The list starts empty even when the report has image slots; **Retrieve** reads them from the RDL.
3. Double-click the image's row, choose the image, and click **OK**.
4. Save.

The image is stored with the style, per company, so a multi-company system can use one style with a
different logo in each company.

### Retrieve finds nothing

**Retrieve** looks for a dataset called `ReportImages` in the RDL. Forms without one, such as the quote
form (`QuotForm`), return an empty list. You can add the slot yourself by copying it from a form that
has it, such as `OrderAck`:

![Report Data panes side by side: QuotForm has no ReportImages dataset, OrderAck has ReportImages with Logo and LogoMimeType fields](/images/321883d9fda3a8620465d3fe9e9f590f862c5365.png)

1. Download both reports and open the `OrderAck` RDL.
2. Recreate its `ReportImages` dataset in your copied `QuotForm` RDL with the same data source type,
   query expression and fields. The query only returns rows if Epicor extracted an image for the run, and
   returns an empty result otherwise, so the report still runs without one.

   ![Expression dialog for the ReportImages dataset query, which selects from the ReportImages table only if it exists](/images/d1c6ef51cf356bc8fd580ccb5891e5383beabfec.png)

   ![Dataset Properties Fields page for ReportImages with Logo and LogoMimeType fields](/images/690d0afc08877990e4e6203650bc2254543c8971.png)

3. Copy the logo image item from the `OrderAck` layout and paste it into yours. It reads the picture
   from `ReportImages`, with its MIME type set by the expression
   `=First(Fields!LogoMimeType.Value, "ReportImages")`.
4. Upload, then **Retrieve** again in Report Style Maintenance and set up the image.

## One logo for many forms, companies or sites

Setting images style by style gets tedious when you have many custom forms, several companies or a
logo per site. Two approaches put the logo in data instead, where every RDD that includes the table can
reach it. Almost every Epicor RDD already includes the `Company` table.

### A UD field holding the logo's path

1. Add a UD field such as `LogoPath_c` to `Company` (or to `Plant` for a logo per site), and put it on
   **Company Configuration** (Company Maintenance in the Classic client) or the site screen so an
   administrator can fill it in. For a site logo, make sure your RDD includes the `Plant` table.

   ![A Logo Path field in a Reporting group on the company configuration screen](/images/faf6f92f93fb628d42835863095f8dda44fa66f7.png)

2. Store each logo on a file share and enter its UNC path, for example
   `\\fileserver\share\logos\main.png`. Give the account the report server uses read access to the
   share.
3. Include the field in your RDDs.
4. In the RDL, add an **Image** with **Select the image source** set to **External** and a value
   expression that builds a file URL:

   ```vb
   ="file:" & First(Fields!LogoPath_c.Value, "Company")
   ```

Because the same field is available anywhere the `Company` table is, BAQ reports and label software can
use it too.

:::tip[Keep every logo the same shape]
Size the image box once and make every company's or site's logo fit the same dimensions (for example
all 500 × 311 px). Otherwise one logo stretches or squashes when you switch companies.
:::

### A UD field holding the image itself

Instead of a path, store the image data in a large text UD field on `Company` as Base64, filled by a
BPM or function when an administrator uploads the logo. In the RDL, use an **Image** with the source
set to **Database**, convert the text back to bytes, and pick the matching MIME type:

```vb
=Convert.FromBase64String(First(Fields!LogoBase64_c.Value, "Company"))
```

This works in the cloud, where the report server can't reach your file shares.

### Images from Epicor's file store

When the picture comes straight from a binary column (Epicor's image store content, for example), use a
**Database** image with the column as the field and set **Use this MIME type** to the file's real
type (`image/png`, `image/jpeg`...). SSRS often renders it even with the wrong type, but setting the
right one avoids surprises.

![Image Properties with Database as the image source, a Content field and the MIME type drop-down open](/images/d5abfb734d7a934eb8e95363322b3e09969c159d.png)

## Part pictures

If your part images are stored as files rather than inside the database, a report can show them as
external images:

1. Make sure the part's image reference resolves to a file path the report server can read, written
   as a `file:` URL (for example `file://fileserver/share/parts/PART-1001.png`).
2. Bring that column into the report, through a BAQ in a BAQ-based RDD or a linked field.
3. Add an **Image** with the source **External** and **Use this image** set to the column.

![Image Properties with the image source External and the value set to the Part_ImageID field](/images/18068c5049b37a7cde8dbc5c63da0a753d819385.png)

If the images live in the database, use a **Database** image as in the previous section.

## Barcodes

The simplest barcode on an Epicor SSRS form is a Code 39 barcode made with a font:

1. Add a text box with the value you want to encode, wrapped in asterisks. Code 39 uses `*` as its start
   and stop characters, and scanners won't read the code without them:

   ```vb
   ="*" & First(Fields!PartNum.Value, "JobHead") & "*"
   ```

2. Set the text box font to **DataWorks Bar 39** and make it large enough for a scanner (around 24 pt
   is a good start).

![Text Box Properties Font page with DataWorks Bar 39 selected at 24pt](/images/barcode-39-ssrs.png)

The font has to be installed where the report is rendered, which is the report server, not the
user's PC.

:::note
Whether DataWorks Bar 39 is already on the report server can differ between on-premises and cloud
installs, and between releases. Check before you rely on it.
:::

Code 39 only covers upper-case letters, digits, space and `- . $ / + %`. Convert the value with
`UCase()` if it might contain lower-case letters, and use a different symbology if your data has other
characters.

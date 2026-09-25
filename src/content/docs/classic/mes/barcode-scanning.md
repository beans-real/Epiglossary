---
title: Barcode scanning in MES
description: Two ways to make barcode scanning work on MES screens, capturing a whole traveler barcode in a classic MES customization to start an activity in one scan, and programming the scanner so MES has time to validate each field.
env: classic
sidebar:
  order: 3
sources:
  - title: "EpiUsers: Using barcodes on the MES screens"
    url: https://www.epiusers.help/t/using-barcodes-on-the-mes-screens/88706
---

A barcode scanner is just a fast keyboard: it types the barcode's contents followed by whatever suffix it's programmed with. MES was designed for scanners, but two problems come up again and again: operators still have to click through several screens per scan, and scans that fill several fields at once outrun the screen. This page covers a fix for each.

## Option 1: one scan starts the activity (classic customization)

The idea: encode everything needed to start work on the traveler (job, assembly, operation) in one barcode per operation, with a start and an end marker. The MES menu listens for keystrokes; when it sees a complete barcode arrive quickly enough to be a scanner, it opens **Start Production Activity** with those values and submits it.

### The barcode

Pick markers that never appear in the data, and a separator. For example:

```text
$JOB-000123|0|20#
```

`$` starts the barcode, `|` separates job number, assembly sequence and operation sequence, and `#` ends it. Print one per operation on the job traveler. A 2D symbology such as PDF417 or QR holds this comfortably; with Code 39 keep the content short.

### Capture it on the MES menu

In the MES menu customization (start MES with `-MESC`), handle `KeyPress` on the form. Keystrokes that arrive within a few milliseconds of each other are treated as one scan; a longer gap starts over, so normal typing is ignored.

```csharp
private DateTime lastKey = DateTime.MinValue;
private System.Text.StringBuilder scanBuffer = new System.Text.StringBuilder();

public void InitializeCustomCode()
{
    MESMenu.KeyPreview = true;   // the form sees keys before the focused control
    MESMenu.KeyPress += new KeyPressEventHandler(this.MESMenu_KeyPress);
}

public void DestroyCustomCode()
{
    MESMenu.KeyPress -= new KeyPressEventHandler(this.MESMenu_KeyPress);
}

private void MESMenu_KeyPress(object sender, KeyPressEventArgs e)
{
    DateTime now = DateTime.Now;
    if ((now - lastKey).TotalMilliseconds > 150) scanBuffer.Clear();   // too slow: not a scanner
    lastKey = now;

    if (e.KeyChar == '$') { scanBuffer.Clear(); }                       // start marker
    scanBuffer.Append(e.KeyChar);

    if (e.KeyChar == '#' && scanBuffer.Length > 0 && scanBuffer[0] == '$')
    {
        string payload = scanBuffer.ToString().Trim('$', '#');          // "JOB-000123|0|20"
        scanBuffer.Clear();
        e.Handled = true;

        LaunchFormOptions opts = new LaunchFormOptions();
        opts.IsModal = true;
        opts.ContextValue = payload;
        ProcessCaller.LaunchForm(oTrans, "XX_STARTPROD", opts);   // menu item for your customized Start Production Activity

        oTrans.RefreshLaborData();   // show the new activity in the MES list
    }
}
```

Tune the 150 ms threshold to your scanners; most send characters much faster than anyone types.

### Fill and submit Start Production Activity

Give **Start Production Activity** a customization and a menu item (`XX_STARTPROD` above). In its `Load` event, read the context value as shown in [Custom buttons on the MES menu](/classic/mes/mes-menu-buttons/#passing-a-value-to-the-form-you-open), then:

1. Split the payload on `|` into job, assembly and operation.
2. Write each value into the form's data view columns, in the same order a user would enter them (job first, so the form can validate it and default the rest).
3. Trigger the form's **OK**/submit button (for example with `PerformClick()` on the button you get by EpiGuid).

<!-- TODO verify: data view and column names on the classic Start Production Activity form, and whether writing JobNum directly fires the same validation as typing it -->

If your process needs anything else at start (resource, setup vs production), either encode it too or stop short of submitting and let the operator finish.

:::caution
Test with the operators' actual scanners and PCs. If the barcode includes characters the keyboard layout maps differently, or the scanner adds a prefix, the markers won't match and nothing happens.
:::

## Option 2: program the scanner to pause

The simpler fix needs no customization. Suppose travelers carry a Code 39 barcode with the job, assembly and operation run together, and the scanner is programmed to split it with **Tab** keys:

1. Send the job number characters.
2. Send **Tab**.
3. Send the assembly character(s).
4. Send **Tab**.
5. Send the operation characters.
6. Send **Tab**.

Scanned into Notepad, this looks perfect. In **Start Setup Activity** or **Start Production Activity**, though, the job lands, the cursor moves to assembly, and everything after that is lost. **Time and Expense Entry** accepts the same scan without trouble.

The cause is timing. When the job number field loses focus, MES validates the job and loads its assemblies and operations from the server. The scanner keeps typing during that round trip, and the keystrokes arrive while the screen is busy.

The fix is to program a **pause** into the scanner's rules right after the job number's **Tab**, long enough for the lookup to finish (start with a few seconds and shorten it once it's reliable). Most scanner configuration tools, such as Zebra's rule-based formatting, have a pause action.

This applies whichever MES you use, Classic or Kinetic, because it's about the screen validating the job before accepting more input.

param(
  [Parameter(Mandatory = $true)][string]$PrinterName,
  [Parameter(Mandatory = $true)][string]$JobPath,
  [Parameter(Mandatory = $false)][string]$DocumentName = 'Alpha-Tech Print Job'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $JobPath)) {
  throw "Print job file not found: $JobPath"
}

Add-Type -AssemblyName System.Drawing

$job = Get-Content -LiteralPath $JobPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lines = [System.Collections.Generic.List[string]]::new()

$lines.Add('ALPHA-TECH')
$lines.Add("Document: $($job.documentType)")
$lines.Add("Job: $($job.jobId)")
$lines.Add('--------------------------------')

if ($null -ne $job.snapshot) {
  foreach ($property in $job.snapshot.PSObject.Properties) {
    $value = $property.Value
    if ($null -eq $value) { continue }

    if ($value -is [System.Array] -or $value -is [System.Collections.IEnumerable] -and $value -isnot [string]) {
      $value = $value | ConvertTo-Json -Compress -Depth 8
    } elseif ($value -isnot [string] -and $value.GetType().IsClass) {
      $value = $value | ConvertTo-Json -Compress -Depth 8
    }

    $lines.Add("$($property.Name): $value")
  }
}

$document = [System.Drawing.Printing.PrintDocument]::new()
$document.PrinterSettings.PrinterName = $PrinterName
$document.DocumentName = $DocumentName

if (-not $document.PrinterSettings.IsValid) {
  throw "Windows printer queue is invalid or unavailable: $PrinterName"
}

$font = [System.Drawing.Font]::new('Consolas', 9)
$brush = [System.Drawing.Brushes]::Black
$lineHeight = $font.GetHeight() + 2

$handler = [System.Drawing.Printing.PrintPageEventHandler]{
  param($sender, $eventArgs)

  $y = [float]$eventArgs.MarginBounds.Top
  foreach ($line in $lines) {
    $eventArgs.Graphics.DrawString([string]$line, $font, $brush, [float]$eventArgs.MarginBounds.Left, $y)
    $y += $lineHeight
  }

  $eventArgs.HasMorePages = $false
}

$document.add_PrintPage($handler)

try {
  $document.Print()

  @{
    ok = $true
    printerName = $PrinterName
    documentName = $DocumentName
    mode = 'WINDOWS_DRIVER'
    submitted = $true
  } | ConvertTo-Json -Compress
} finally {
  $document.remove_PrintPage($handler)
  $font.Dispose()
  $document.Dispose()
}

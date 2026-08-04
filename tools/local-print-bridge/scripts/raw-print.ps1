param(
  [Parameter(Mandatory = $true)][string]$PrinterName,
  [Parameter(Mandatory = $true)][string]$FilePath,
  [Parameter(Mandatory = $false)][string]$DocumentName = 'Alpha-Tech Print Job'
)

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Runtime.InteropServices;

public static class AlphaTechRawPrinter {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public class DOCINFOA {
    [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
    [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
    [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
  }

  [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
  public static extern bool OpenPrinter(string szPrinter, out IntPtr hPrinter, IntPtr pd);

  [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool ClosePrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
  public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In] DOCINFOA di);

  [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool EndDocPrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool StartPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool EndPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

  public static int SendFile(string printerName, string filePath, string documentName) {
    byte[] bytes = File.ReadAllBytes(filePath);
    IntPtr unmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
    Marshal.Copy(bytes, 0, unmanagedBytes, bytes.Length);
    IntPtr printer;

    try {
      if (!OpenPrinter(printerName, out printer, IntPtr.Zero)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
      try {
        DOCINFOA info = new DOCINFOA { pDocName = documentName, pDataType = "RAW" };
        if (!StartDocPrinter(printer, 1, info)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        try {
          if (!StartPagePrinter(printer)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
          try {
            int written;
            if (!WritePrinter(printer, unmanagedBytes, bytes.Length, out written)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
            return written;
          } finally { EndPagePrinter(printer); }
        } finally { EndDocPrinter(printer); }
      } finally { ClosePrinter(printer); }
    } finally { Marshal.FreeCoTaskMem(unmanagedBytes); }
  }
}
'@

$written = [AlphaTechRawPrinter]::SendFile($PrinterName, $FilePath, $DocumentName)
@{
  ok = $true
  printerName = $PrinterName
  documentName = $DocumentName
  bytesWritten = $written
} | ConvertTo-Json -Compress

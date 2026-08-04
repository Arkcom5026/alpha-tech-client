import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const normalizePrinter = (printer) => Object.freeze({
  id: `windows:${printer.Name}`,
  name: printer.Name,
  driverName: printer.DriverName || null,
  portName: printer.PortName || null,
  connection: 'WINDOWS_QUEUE',
  paperWidthMm: /80|T82|T88|receipt/i.test(`${printer.Name} ${printer.DriverName || ''}`) ? 80 : null,
  capabilities: {
    raw: true,
    cut: /EPSON|TM-T/i.test(`${printer.Name} ${printer.DriverName || ''}`),
    cashDrawer: /EPSON|TM-T/i.test(`${printer.Name} ${printer.DriverName || ''}`),
  },
  isDefault: Boolean(printer.Default),
  isOnline: !printer.WorkOffline,
  workOffline: Boolean(printer.WorkOffline),
})

const discoverWindowsPrinters = async ({ execFileImpl = execFileAsync } = {}) => {
  if (process.platform !== 'win32') return []

  const script = [
    '$ErrorActionPreference = "Stop"',
    'Get-CimInstance Win32_Printer | Select-Object Name,DriverName,PortName,Default,WorkOffline | ConvertTo-Json -Compress',
  ].join('; ')

  const { stdout } = await execFileImpl(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { windowsHide: true, maxBuffer: 1024 * 1024 }
  )

  const value = stdout.trim() ? JSON.parse(stdout.trim()) : []
  const printers = Array.isArray(value) ? value : [value]
  return printers.filter(Boolean).map(normalizePrinter)
}

export { discoverWindowsPrinters, normalizePrinter }
export default discoverWindowsPrinters

import process from 'node:process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const isReceiptPrinter = (printer) => /80|T82|T88|receipt/i.test(`${printer.Name} ${printer.DriverName || ''}`)
const isEscPosPrinter = (printer) => /EPSON|TM-T/i.test(`${printer.Name} ${printer.DriverName || ''}`)

const resolveQueueAuthority = (printer) => {
  const name = String(printer.Name || '')
  const isUncName = name.startsWith('\\\\')
  const isNetwork = Boolean(printer.Network) || isUncName
  const isLocal = Boolean(printer.Local) && !isNetwork

  if (isLocal) return 'LOCAL_QUEUE'
  if (isNetwork) return 'SHARED_CONNECTION'
  return 'UNKNOWN_QUEUE'
}

const normalizePrinter = (printer) => {
  const queueAuthority = resolveQueueAuthority(printer)
  const localRawEligible = queueAuthority === 'LOCAL_QUEUE'

  return Object.freeze({
    id: `windows:${printer.Name}`,
    name: printer.Name,
    driverName: printer.DriverName || null,
    portName: printer.PortName || null,
    serverName: printer.ServerName || null,
    shareName: printer.ShareName || null,
    connection: 'WINDOWS_QUEUE',
    queueAuthority,
    isLocalQueue: localRawEligible,
    isSharedConnection: queueAuthority === 'SHARED_CONNECTION',
    paperWidthMm: isReceiptPrinter(printer) ? 80 : null,
    capabilities: {
      driverManaged: queueAuthority === 'SHARED_CONNECTION',
      raw: localRawEligible,
      cut: localRawEligible && isEscPosPrinter(printer),
      cashDrawer: localRawEligible && isEscPosPrinter(printer),
    },
    isDefault: Boolean(printer.Default),
    isOnline: !printer.WorkOffline,
    workOffline: Boolean(printer.WorkOffline),
  })
}

const discoverWindowsPrinters = async ({ execFileImpl = execFileAsync } = {}) => {
  if (process.platform !== 'win32') return []

  const script = [
    '$ErrorActionPreference = "Stop"',
    'Get-CimInstance Win32_Printer | Select-Object Name,DriverName,PortName,Default,WorkOffline,Local,Network,ServerName,ShareName | ConvertTo-Json -Compress',
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

export { discoverWindowsPrinters, normalizePrinter, resolveQueueAuthority }
export default discoverWindowsPrinters

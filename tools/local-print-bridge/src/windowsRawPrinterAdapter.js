import { Buffer } from 'node:buffer'
import process from 'node:process'
import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { renderShortTaxInvoiceEscPos } from './escposRenderer.js'


const execFileAsync = promisify(execFile)
const moduleDir = fileURLToPath(new URL('.', import.meta.url))
const rawPrintScript = resolve(moduleDir, '../scripts/raw-print.ps1')

const createWindowsRawPrinterAdapter = ({
  enabled = process.env.ALPHA_PRINT_BRIDGE_ENABLE_RAW === '1',
  execFileImpl = execFileAsync,
} = {}) => Object.freeze({
  name: 'WINDOWS_RAW_ESC_POS',
  enabled,
  async print({ printer, printJob }) {
    if (!enabled) {
      const error = new Error('Physical raw printing is disabled. Set ALPHA_PRINT_BRIDGE_ENABLE_RAW=1 explicitly.')
      error.code = 'RAW_PRINTING_DISABLED'
      error.statusCode = 503
      throw error
    }
    if (process.platform !== 'win32') {
      const error = new Error('Windows raw printing is available only on Windows')
      error.code = 'WINDOWS_REQUIRED'
      error.statusCode = 503
      throw error
    }

    const printerName = printer.name || printer.driverName
    if (!printerName) throw new TypeError('printer name is required')

    const bytes = renderShortTaxInvoiceEscPos(printJob)
    const workDir = await mkdtemp(join(tmpdir(), 'alpha-print-'))
    const spoolPath = join(workDir, `${printJob.jobId}.bin`)

    try {
      await writeFile(spoolPath, bytes)
      const { stdout } = await execFileImpl(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', rawPrintScript, '-PrinterName', printerName, '-FilePath', spoolPath, '-DocumentName', printJob.jobId],
        { windowsHide: true, maxBuffer: 1024 * 1024 }
      )
      const response = stdout.trim() ? JSON.parse(stdout.trim()) : {}
      return Object.freeze({
        jobId: printJob.jobId,
        printerId: printer.id,
        status: 'PRINTED',
        printedAt: new Date().toISOString(),
        adapter: 'WINDOWS_RAW_ESC_POS',
        bytes: bytes.length,
        spool: response,
      })
    } finally {
      await rm(workDir, { recursive: true, force: true })
    }
  },
})

export { createWindowsRawPrinterAdapter }
export default createWindowsRawPrinterAdapter

import process from 'node:process'
import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const moduleDir = fileURLToPath(new URL('.', import.meta.url))
const driverPrintScript = resolve(moduleDir, '../scripts/driver-print.ps1')

const createWindowsDriverSpool = ({
  execFileImpl = execFileAsync,
  platform = process.platform,
} = {}) => async ({ printerName, documentName, printJob }) => {
  if (platform !== 'win32') {
    const error = new Error('Windows driver spool is available only on Windows')
    error.code = 'WINDOWS_REQUIRED'
    error.statusCode = 503
    throw error
  }

  const normalizedPrinterName = String(printerName || '').trim()
  const normalizedDocumentName = String(documentName || '').trim()

  if (!normalizedPrinterName) throw new TypeError('printerName is required')
  if (!normalizedDocumentName) throw new TypeError('documentName is required')
  if (!printJob || typeof printJob !== 'object') throw new TypeError('printJob is required')

  const workDir = await mkdtemp(join(tmpdir(), 'alpha-driver-print-'))
  const jobPath = join(workDir, `${normalizedDocumentName}.json`)

  try {
    await writeFile(jobPath, JSON.stringify(printJob), 'utf8')

    const { stdout } = await execFileImpl(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        driverPrintScript,
        '-PrinterName',
        normalizedPrinterName,
        '-JobPath',
        jobPath,
        '-DocumentName',
        normalizedDocumentName,
      ],
      { windowsHide: true, maxBuffer: 1024 * 1024 }
    )

    const response = stdout.trim() ? JSON.parse(stdout.trim()) : {}
    return Object.freeze({ ...response })
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

export { createWindowsDriverSpool }
export default createWindowsDriverSpool

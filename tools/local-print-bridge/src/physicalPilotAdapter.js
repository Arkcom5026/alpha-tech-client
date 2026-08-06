import process from 'node:process'
import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { renderPhysicalPilotEscPos } from './physicalPilotRenderer.js'

const execFileAsync = promisify(execFile)
const moduleDir = fileURLToPath(new URL('.', import.meta.url))
const rawPrintScript = resolve(moduleDir, '../scripts/raw-print.ps1')

const createPhysicalPilotAdapter = ({
  enabled = process.env.ALPHA_PRINT_BRIDGE_ENABLE_PHYSICAL_PILOT === '1',
  allowedPrinterId = process.env.ALPHA_PRINT_BRIDGE_PILOT_PRINTER_ID || '',
  confirmationToken = process.env.ALPHA_PRINT_BRIDGE_PILOT_CONFIRMATION || '',
  execFileImpl = execFileAsync,
} = {}) => Object.freeze({
  name: 'WINDOWS_RAW_PHYSICAL_PILOT',
  enabled,
  async print({ printer, request }) {
    if (!enabled) {
      const error = new Error('Physical pilot is disabled')
      error.code = 'PHYSICAL_PILOT_DISABLED'
      error.statusCode = 503
      throw error
    }
    if (process.platform !== 'win32') {
      const error = new Error('Physical pilot requires Windows')
      error.code = 'WINDOWS_REQUIRED'
      error.statusCode = 503
      throw error
    }
    if (!allowedPrinterId || printer.id !== allowedPrinterId) {
      const error = new Error('Printer is not authorized for the physical pilot')
      error.code = 'PILOT_PRINTER_NOT_AUTHORIZED'
      error.statusCode = 403
      throw error
    }
    if (printer.queueAuthority !== 'LOCAL_QUEUE') {
      const error = new Error('Physical ESC/POS pilot requires a local Windows queue on the USB host; shared printer connections are not accepted')
      error.code = 'LOCAL_QUEUE_AUTHORITY_REQUIRED'
      error.statusCode = 409
      throw error
    }
    if (!confirmationToken || request.confirmation !== confirmationToken) {
      const error = new Error('Physical pilot confirmation token is invalid')
      error.code = 'PILOT_CONFIRMATION_REQUIRED'
      error.statusCode = 403
      throw error
    }

    const bytes = renderPhysicalPilotEscPos({ feedLines: 3, partialCut: true })
    const pilotId = `physical-pilot-${Date.now()}`
    const workDir = await mkdtemp(join(tmpdir(), 'alpha-print-pilot-'))
    const spoolPath = join(workDir, `${pilotId}.bin`)

    try {
      await writeFile(spoolPath, bytes)
      const { stdout } = await execFileImpl(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', rawPrintScript, '-PrinterName', printer.name, '-FilePath', spoolPath, '-DocumentName', pilotId],
        { windowsHide: true, maxBuffer: 1024 * 1024 }
      )
      const spool = stdout.trim() ? JSON.parse(stdout.trim()) : {}
      return Object.freeze({
        pilotId,
        printerId: printer.id,
        status: 'PRINTED',
        adapter: 'WINDOWS_RAW_PHYSICAL_PILOT',
        bytes: bytes.length,
        printedAt: new Date().toISOString(),
        spool,
      })
    } finally {
      await rm(workDir, { recursive: true, force: true })
    }
  },
})

export { createPhysicalPilotAdapter }
export default createPhysicalPilotAdapter

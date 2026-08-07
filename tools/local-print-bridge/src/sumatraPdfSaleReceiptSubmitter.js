import crypto from 'node:crypto'
import process from 'node:process'
import { execFile as nodeExecFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(nodeExecFile)

const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const requiredText = (value, code, field) => {
  if (typeof value !== 'string' || !value.trim()) throw fail(code, `${field} is required`)
  return value.trim()
}

const positiveCopies = (value) => {
  const copies = Number(value)
  if (!Number.isInteger(copies) || copies <= 0 || copies > 20) {
    throw fail('DURABLE_SALE_RECEIPT_SUMATRA_COPIES_INVALID', 'copies must be an integer between 1 and 20')
  }
  return copies
}

const inspectSumatraReadiness = ({
  platform = process.platform,
  env = process.env,
  fileExists = existsSync,
} = {}) => {
  const configured = env.SUMATRA_PDF_PATH ? resolve(env.SUMATRA_PDF_PATH) : null
  const candidates = [
    configured,
    env.LOCALAPPDATA ? join(env.LOCALAPPDATA, 'SumatraPDF', 'SumatraPDF.exe') : null,
    env.PROGRAMFILES ? join(env.PROGRAMFILES, 'SumatraPDF', 'SumatraPDF.exe') : null,
    env['PROGRAMFILES(X86)'] ? join(env['PROGRAMFILES(X86)'], 'SumatraPDF', 'SumatraPDF.exe') : null,
  ].filter(Boolean)
  const executablePath = candidates.find((candidate) => fileExists(candidate)) || null
  const reasons = []
  if (platform !== 'win32') reasons.push('WINDOWS_PLATFORM_REQUIRED')
  if (!executablePath) reasons.push('SUMATRA_PDF_NOT_DISCOVERED')
  return Object.freeze({
    schemaVersion: 1,
    ready: reasons.length === 0,
    reasons: Object.freeze(reasons),
    selectedTransport: executablePath
      ? Object.freeze({ code: 'SUMATRA_PDF', strategy: 'EXPLICIT_PRINTER_CLI', executablePath })
      : null,
  })
}

const assertArtifactBytes = (artifact) => {
  if (
    artifact?.format !== 'PDF'
    || typeof artifact?.pdfBase64 !== 'string'
    || !artifact.pdfBase64
    || typeof artifact?.checksumSha256 !== 'string'
    || !/^[a-f0-9]{64}$/i.test(artifact.checksumSha256)
    || !Number.isInteger(Number(artifact?.byteLength))
    || Number(artifact.byteLength) <= 0
  ) {
    throw fail('DURABLE_SALE_RECEIPT_SUMATRA_ARTIFACT_INVALID', 'A checksum-bound PDF artifact is required', 409)
  }
  const bytes = Buffer.from(artifact.pdfBase64, 'base64')
  if (bytes.length !== Number(artifact.byteLength) || bytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw fail('DURABLE_SALE_RECEIPT_SUMATRA_ARTIFACT_INVALID', 'PDF artifact bytes do not match the certified artifact contract', 409)
  }
  const checksum = crypto.createHash('sha256').update(bytes).digest('hex')
  if (checksum.toLowerCase() !== artifact.checksumSha256.toLowerCase()) {
    throw fail('DURABLE_SALE_RECEIPT_SUMATRA_CHECKSUM_MISMATCH', 'PDF artifact checksum verification failed', 409)
  }
  return bytes
}

const createSumatraPdfSaleReceiptSubmitter = ({
  enabled = process.env.ALPHA_PRINT_BRIDGE_ENABLE_DURABLE_SALE_RECEIPT === '1',
  allowedPrinterId = process.env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_PRINTER_ID || '',
  resolvePrinter,
  readiness = () => inspectSumatraReadiness(),
  execFileImpl = execFileAsync,
  tempRoot = tmpdir(),
} = {}) => {
  if (typeof resolvePrinter !== 'function') {
    throw fail('DURABLE_SALE_RECEIPT_PRINTER_RESOLVER_REQUIRED', 'resolvePrinter is required', 500)
  }
  if (typeof readiness !== 'function') {
    throw fail('DURABLE_SALE_RECEIPT_SUMATRA_READINESS_REQUIRED', 'readiness must be a function', 500)
  }
  if (typeof execFileImpl !== 'function') {
    throw fail('DURABLE_SALE_RECEIPT_SUMATRA_EXECUTOR_REQUIRED', 'execFileImpl must be a function', 500)
  }

  return Object.freeze({
    name: 'SUMATRA_PDF_EXPLICIT_PRINTER',
    physicalSideEffects: true,

    async submit({ executionEnvelope, printerId, artifact }) {
      if (!enabled) {
        throw fail('DURABLE_SALE_RECEIPT_PHYSICAL_SUBMISSION_DISABLED', 'Durable Sale Receipt physical submission is disabled', 503)
      }
      const exactPrinterId = requiredText(printerId, 'DURABLE_SALE_RECEIPT_PRINTER_ID_REQUIRED', 'printerId')
      if (!allowedPrinterId || exactPrinterId !== allowedPrinterId) {
        throw fail('DURABLE_SALE_RECEIPT_PRINTER_NOT_AUTHORIZED', 'Printer is not authorized for durable Sale Receipt submission', 403)
      }
      if (executionEnvelope?.documentPurpose?.code !== 'SALE_RECEIPT') {
        throw fail('DURABLE_SALE_RECEIPT_PURPOSE_REQUIRED', 'Sumatra submitter accepts SALE_RECEIPT only', 409)
      }

      const printer = await resolvePrinter(exactPrinterId)
      if (!printer || printer.connection !== 'WINDOWS_QUEUE') {
        throw fail('DURABLE_SALE_RECEIPT_WINDOWS_PRINTER_REQUIRED', `Windows printer queue not found: ${exactPrinterId}`, 404)
      }
      if (!printer.isOnline || printer.workOffline) {
        throw fail('DURABLE_SALE_RECEIPT_PRINTER_OFFLINE', `Printer is offline: ${exactPrinterId}`, 503)
      }
      const printerName = requiredText(printer.name, 'DURABLE_SALE_RECEIPT_PRINTER_NAME_REQUIRED', 'printer.name')
      const copies = positiveCopies(executionEnvelope?.print?.copies)
      const bytes = assertArtifactBytes(artifact)

      const transport = readiness()
      if (
        transport?.ready !== true
        || transport?.selectedTransport?.code !== 'SUMATRA_PDF'
        || transport?.selectedTransport?.strategy !== 'EXPLICIT_PRINTER_CLI'
        || typeof transport?.selectedTransport?.executablePath !== 'string'
        || !transport.selectedTransport.executablePath.trim()
      ) {
        throw fail('DURABLE_SALE_RECEIPT_SUMATRA_NOT_READY', 'Certified SumatraPDF transport is not ready', 409, { reasons: transport?.reasons || [] })
      }

      const workDir = await mkdtemp(join(tempRoot, 'alpha-sale-receipt-pdf-'))
      const pdfPath = join(workDir, `${artifact.checksumSha256.toLowerCase()}.pdf`)
      try {
        await writeFile(pdfPath, bytes)
        const args = ['-silent', '-print-to', printerName]
        if (copies > 1) args.push('-print-settings', `${copies}x`)
        args.push(pdfPath)

        const { stdout = '', stderr = '' } = await execFileImpl(
          transport.selectedTransport.executablePath,
          args,
          { windowsHide: true, shell: false, timeout: 30000, encoding: 'utf8' },
        )

        return Object.freeze({
          schemaVersion: 1,
          submitted: true,
          printerId: exactPrinterId,
          artifactChecksumSha256: artifact.checksumSha256,
          transport: Object.freeze({
            code: 'SUMATRA_PDF',
            strategy: 'EXPLICIT_PRINTER_CLI',
            executablePath: transport.selectedTransport.executablePath,
            shell: false,
            meaning: 'PRINT_SUBMISSION_ACCEPTED',
            physicalOutputConfirmed: false,
            stdout: String(stdout),
            stderr: String(stderr),
          }),
        })
      } catch (error) {
        if (error?.code?.startsWith?.('DURABLE_')) throw error
        throw fail('DURABLE_SALE_RECEIPT_SUMATRA_EXECUTION_FAILED', 'SumatraPDF Sale Receipt submission failed', 502, {
          cause: error?.message || String(error),
        })
      } finally {
        await rm(workDir, { recursive: true, force: true })
      }
    },
  })
}

export {
  assertArtifactBytes,
  createSumatraPdfSaleReceiptSubmitter,
  inspectSumatraReadiness,
}

export default createSumatraPdfSaleReceiptSubmitter

import crypto from 'node:crypto'
import process from 'node:process'
import { execFile as nodeExecFile } from 'node:child_process'
import { existsSync as nodeExistsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { renderSaleReceipt80mmHtml } from './saleReceipt80mmHtmlRenderer.js'

const execFileAsync = promisify(nodeExecFile)

const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const BROWSER_CANDIDATES = Object.freeze([
  Object.freeze({
    browser: 'EDGE',
    locations: Object.freeze([
      Object.freeze({ env: 'PROGRAMFILES(X86)', parts: ['Microsoft', 'Edge', 'Application', 'msedge.exe'] }),
      Object.freeze({ env: 'PROGRAMFILES', parts: ['Microsoft', 'Edge', 'Application', 'msedge.exe'] }),
      Object.freeze({ env: 'LOCALAPPDATA', parts: ['Microsoft', 'Edge', 'Application', 'msedge.exe'] }),
    ]),
  }),
  Object.freeze({
    browser: 'CHROME',
    locations: Object.freeze([
      Object.freeze({ env: 'PROGRAMFILES', parts: ['Google', 'Chrome', 'Application', 'chrome.exe'] }),
      Object.freeze({ env: 'PROGRAMFILES(X86)', parts: ['Google', 'Chrome', 'Application', 'chrome.exe'] }),
      Object.freeze({ env: 'LOCALAPPDATA', parts: ['Google', 'Chrome', 'Application', 'chrome.exe'] }),
    ]),
  }),
])

const windowsJoin = (root, parts) => `${String(root).replace(/[\\/]+$/, '')}\\${parts.join('\\')}`

const inspectWindowsBrowserPdfReadiness = ({
  platform = process.platform,
  env = process.env,
  existsSync = nodeExistsSync,
} = {}) => {
  const candidates = BROWSER_CANDIDATES.map((candidate) => {
    const locations = candidate.locations
      .map((location) => {
        const root = env[location.env]
        if (!root) return null
        const executablePath = windowsJoin(root, location.parts)
        return Object.freeze({
          environmentVariable: location.env,
          executablePath,
          exists: Boolean(existsSync(executablePath)),
        })
      })
      .filter(Boolean)
    const available = locations.find((location) => location.exists) || null
    return Object.freeze({
      browser: candidate.browser,
      available: Boolean(available),
      executablePath: available?.executablePath || null,
      locations: Object.freeze(locations),
    })
  })

  const selected = candidates.find((candidate) => candidate.available) || null
  const reasons = []
  if (platform !== 'win32') reasons.push('WINDOWS_PLATFORM_REQUIRED')
  if (!selected) reasons.push('WINDOWS_BROWSER_PDF_RENDERER_NOT_DISCOVERED')

  return Object.freeze({
    schemaVersion: 1,
    strategy: 'LOCAL_GATEWAY_BROWSER_PDF',
    mode: 'DISCOVERY_ONLY',
    physicalSideEffects: false,
    ready: reasons.length === 0,
    reasons: Object.freeze(reasons),
    selectedRenderer: selected
      ? Object.freeze({ browser: selected.browser, executablePath: selected.executablePath })
      : null,
    candidates: Object.freeze(candidates),
  })
}

const createWindowsBrowserPdfTransport = ({
  execFileImpl = execFileAsync,
  existsSync = nodeExistsSync,
  mkdtempImpl = mkdtemp,
  writeFileImpl = writeFile,
  readFileImpl = readFile,
  rmImpl = rm,
  tempRoot = tmpdir(),
} = {}) => Object.freeze({
  code: 'WINDOWS_BROWSER_PDF',
  physicalSideEffects: false,
  localProcessSideEffects: true,
  filesystemSideEffects: true,

  async execute({ browserExecutablePath, html }) {
    const executable = String(browserExecutablePath || '').trim()
    const sourceHtml = typeof html === 'string' ? html.trim() : ''
    if (!executable) throw fail('PRINT_BRIDGE_BROWSER_EXECUTABLE_REQUIRED', 'browserExecutablePath is required')
    if (!sourceHtml) throw fail('PRINT_BRIDGE_BROWSER_HTML_REQUIRED', 'html is required')
    if (!existsSync(executable)) {
      throw fail('PRINT_BRIDGE_BROWSER_EXECUTABLE_NOT_FOUND', `Browser executable was not found: ${executable}`, 409)
    }

    const workDir = await mkdtempImpl(join(tempRoot, 'alpha-sale-receipt-pdf-'))
    const htmlPath = join(workDir, 'receipt.html')
    const pdfPath = join(workDir, 'receipt.pdf')

    try {
      await writeFileImpl(htmlPath, sourceHtml, 'utf8')
      await execFileImpl(
        executable,
        [
          '--headless=new',
          '--disable-gpu',
          '--no-pdf-header-footer',
          `--print-to-pdf=${pdfPath}`,
          `file:///${htmlPath.replace(/\\/g, '/')}`,
        ],
        { windowsHide: true, maxBuffer: 1024 * 1024 },
      )
      if (!existsSync(pdfPath)) {
        throw fail('PRINT_BRIDGE_BROWSER_PDF_NOT_CREATED', 'Browser did not create the expected PDF artifact', 502)
      }
      const pdfBytes = Buffer.from(await readFileImpl(pdfPath))
      if (pdfBytes.length < 5 || pdfBytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
        throw fail('PRINT_BRIDGE_BROWSER_PDF_INVALID', 'Browser output is not a valid PDF byte stream', 502)
      }
      return Object.freeze({ renderer: 'WINDOWS_BROWSER_PDF', pdfBytes })
    } finally {
      await rmImpl(workDir, { recursive: true, force: true })
    }
  },
})

const createSaleReceiptWindowsBrowserPdfRenderer = ({
  readiness = inspectWindowsBrowserPdfReadiness,
  transport = createWindowsBrowserPdfTransport(),
  htmlRenderer = renderSaleReceipt80mmHtml,
} = {}) => {
  if (typeof readiness !== 'function') throw fail('PRINT_BRIDGE_BROWSER_READINESS_REQUIRED', 'readiness must be a function', 500)
  if (!transport || typeof transport.execute !== 'function') throw fail('PRINT_BRIDGE_BROWSER_TRANSPORT_REQUIRED', 'browser PDF transport is required', 500)
  if (typeof htmlRenderer !== 'function') throw fail('PRINT_BRIDGE_SALE_RECEIPT_HTML_RENDERER_REQUIRED', 'Sale Receipt HTML renderer is required', 500)

  return Object.freeze({
    name: 'SALE_RECEIPT_80MM_WINDOWS_BROWSER_PDF',
    physicalSideEffects: false,
    localProcessSideEffects: true,
    filesystemSideEffects: true,

    async render({ executionEnvelope }) {
      if (executionEnvelope?.documentPurpose?.code !== 'SALE_RECEIPT' || !executionEnvelope?.projection) {
        throw fail('PRINT_BRIDGE_SALE_RECEIPT_RENDER_ENVELOPE_INVALID', 'SALE_RECEIPT execution envelope is required', 409)
      }

      const rendererReadiness = await readiness()
      if (rendererReadiness?.ready !== true || !rendererReadiness?.selectedRenderer?.executablePath) {
        throw fail(
          'PRINT_BRIDGE_BROWSER_PDF_NOT_READY',
          'Windows browser PDF renderer readiness must pass before rendering',
          409,
          { reasons: rendererReadiness?.reasons || [] },
        )
      }

      const html = htmlRenderer({ projection: executionEnvelope.projection })
      const rendered = await transport.execute({
        browserExecutablePath: rendererReadiness.selectedRenderer.executablePath,
        html,
      })
      const pdfBytes = Buffer.from(rendered?.pdfBytes || [])
      if (pdfBytes.length < 5 || pdfBytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
        throw fail('PRINT_BRIDGE_BROWSER_PDF_INVALID', 'Renderer returned an invalid PDF artifact', 502)
      }

      return Object.freeze({
        schemaVersion: 1,
        format: 'PDF',
        renderer: 'SALE_RECEIPT_80MM_WINDOWS_BROWSER_PDF',
        checksumSha256: crypto.createHash('sha256').update(pdfBytes).digest('hex'),
        byteLength: pdfBytes.length,
        pageCount: Number(rendered?.pageCount || 1),
        pdfBase64: pdfBytes.toString('base64'),
        physicalSideEffects: false,
      })
    },
  })
}

export {
  BROWSER_CANDIDATES,
  createSaleReceiptWindowsBrowserPdfRenderer,
  createWindowsBrowserPdfTransport,
  inspectWindowsBrowserPdfReadiness,
}

export default createSaleReceiptWindowsBrowserPdfRenderer

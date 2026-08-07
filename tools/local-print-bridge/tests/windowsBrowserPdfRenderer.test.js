import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import {
  createSaleReceiptWindowsBrowserPdfRenderer,
  createWindowsBrowserPdfTransport,
  inspectWindowsBrowserPdfReadiness,
} from '../src/windowsBrowserPdfRenderer.js'

const projection = {
  document: { type: 'SALE_RECEIPT', title: 'ใบเสร็จรับเงิน', number: 'PAY-638', issuedAt: '2026-08-08T03:00:00.000Z' },
  issuer: { name: 'บริษัท แอดวานซ์ เทค บรรพต จำกัด' },
  recipient: { name: 'ลูกค้าทดสอบ' },
  sale: { code: 'SALE-77', totalBeforeDiscount: 1300, totalDiscount: 65.44, vatAmount: 80.76, totalAmount: 1234.56 },
  payment: { receivedAt: '2026-08-08T03:00:00.000Z', amount: 1234.56, items: [{ paymentMethod: 'CASH', amount: 1234.56 }] },
  lines: [{ description: 'สินค้าไทย', quantity: 1, unitAmount: 1300, discountAmount: 65.44, lineAmount: 1234.56 }],
}

const envelope = {
  schemaVersion: 1,
  job: { jobId: 'sdj_1', jobType: 'PRINT_DOCUMENT' },
  documentPurpose: { code: 'SALE_RECEIPT' },
  source: { id: 77 },
  print: { copies: 1 },
  projection,
}

test('discovers Edge before Chrome using the server-authority candidate order', () => {
  const env = {
    'PROGRAMFILES(X86)': 'C:\\PF86',
    PROGRAMFILES: 'C:\\PF',
    LOCALAPPDATA: 'C:\\Users\\alpha\\AppData\\Local',
  }
  const readiness = inspectWindowsBrowserPdfReadiness({
    platform: 'win32',
    env,
    existsSync: (path) => path === 'C:\\PF86\\Microsoft\\Edge\\Application\\msedge.exe'
      || path === 'C:\\PF\\Google\\Chrome\\Application\\chrome.exe',
  })

  assert.equal(readiness.ready, true)
  assert.equal(readiness.selectedRenderer.browser, 'EDGE')
  assert.equal(readiness.selectedRenderer.executablePath, 'C:\\PF86\\Microsoft\\Edge\\Application\\msedge.exe')
  assert.deepEqual(readiness.reasons, [])
})

test('browser transport uses headless print-to-pdf and returns verified PDF bytes without printer side effects', async () => {
  const pdfBytes = Buffer.from('%PDF-1.7\ncertified-pdf')
  const calls = []
  let removed = false
  const transport = createWindowsBrowserPdfTransport({
    execFileImpl: async (...args) => { calls.push(args) },
    existsSync: (path) => path === 'C:\\Browser\\msedge.exe' || path.endsWith('receipt.pdf'),
    mkdtempImpl: async () => 'C:\\Temp\\alpha-sale-receipt-pdf-1',
    writeFileImpl: async () => {},
    readFileImpl: async () => pdfBytes,
    rmImpl: async () => { removed = true },
    tempRoot: 'C:\\Temp',
  })

  const result = await transport.execute({
    browserExecutablePath: 'C:\\Browser\\msedge.exe',
    html: '<!doctype html><html><body>receipt</body></html>',
  })

  assert.equal(result.renderer, 'WINDOWS_BROWSER_PDF')
  assert.deepEqual(result.pdfBytes, pdfBytes)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'C:\\Browser\\msedge.exe')
  assert.ok(calls[0][1].includes('--headless=new'))
  assert.ok(calls[0][1].some((arg) => arg.startsWith('--print-to-pdf=')))
  assert.equal(removed, true)
  assert.equal(transport.physicalSideEffects, false)
})

test('composes certified 80mm HTML into checksum-bound PDF artifact for the local executor', async () => {
  const pdfBytes = Buffer.from('%PDF-1.7\nlocal-sale-receipt')
  let receivedHtml = null
  const renderer = createSaleReceiptWindowsBrowserPdfRenderer({
    readiness: () => ({
      ready: true,
      reasons: [],
      selectedRenderer: { browser: 'EDGE', executablePath: 'C:\\Browser\\msedge.exe' },
    }),
    transport: {
      async execute({ browserExecutablePath, html }) {
        assert.equal(browserExecutablePath, 'C:\\Browser\\msedge.exe')
        receivedHtml = html
        return { pdfBytes, pageCount: 1 }
      },
    },
  })

  const artifact = await renderer.render({ executionEnvelope: envelope })
  assert.match(receivedHtml, /@page \{ size: 80mm auto;/)
  assert.match(receivedHtml, /PAY-638/)
  assert.equal(artifact.schemaVersion, 1)
  assert.equal(artifact.format, 'PDF')
  assert.equal(artifact.byteLength, pdfBytes.length)
  assert.equal(artifact.checksumSha256, crypto.createHash('sha256').update(pdfBytes).digest('hex'))
  assert.equal(artifact.pdfBase64, pdfBytes.toString('base64'))
  assert.equal(artifact.physicalSideEffects, false)
})

test('fails closed before browser execution when readiness or SALE_RECEIPT authority is missing', async () => {
  const renderer = createSaleReceiptWindowsBrowserPdfRenderer({
    readiness: () => ({ ready: false, reasons: ['WINDOWS_BROWSER_PDF_RENDERER_NOT_DISCOVERED'], selectedRenderer: null }),
    transport: { execute: async () => { throw new Error('must not execute') } },
  })

  await assert.rejects(
    () => renderer.render({ executionEnvelope: envelope }),
    (error) => error?.code === 'PRINT_BRIDGE_BROWSER_PDF_NOT_READY',
  )

  const readyRenderer = createSaleReceiptWindowsBrowserPdfRenderer({
    readiness: () => ({ ready: true, reasons: [], selectedRenderer: { executablePath: 'C:\\Browser\\msedge.exe' } }),
    transport: { execute: async () => ({ pdfBytes: Buffer.from('%PDF-1.7\nok') }) },
  })
  await assert.rejects(
    () => readyRenderer.render({ executionEnvelope: { ...envelope, documentPurpose: { code: 'DELIVERY_NOTE' } } }),
    (error) => error?.code === 'PRINT_BRIDGE_SALE_RECEIPT_RENDER_ENVELOPE_INVALID',
  )
})

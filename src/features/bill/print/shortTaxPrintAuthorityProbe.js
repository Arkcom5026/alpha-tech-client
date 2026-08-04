const PROBE_STYLE_ID = 'short-tax-print-authority-probe'

const pxToMm = (px) => (Number(px) || 0) * 25.4 / 96

const getReceiptRoot = () => {
  const element = document.querySelector('.bill-print-root')
  if (!element) {
    throw new Error('ไม่พบ .bill-print-root กรุณาเปิดหน้าใบกำกับภาษีอย่างย่อก่อน')
  }
  return element
}

const replaceProbeStyle = (cssText) => {
  document.getElementById(PROBE_STYLE_ID)?.remove()
  const style = document.createElement('style')
  style.id = PROBE_STYLE_ID
  style.textContent = cssText
  document.head.appendChild(style)
  return style
}

const buildEvidence = ({ mode, requestedHeightMm, source = 'main-document' }) => {
  const receipt = getReceiptRoot()
  const rect = receipt.getBoundingClientRect()
  const evidence = {
    mode,
    source,
    requestedWidthMm: 80,
    requestedHeightMm,
    measuredHeightPx: Math.ceil(rect.height),
    measuredHeightMm: Math.round(pxToMm(rect.height) * 100) / 100,
    timestamp: new Date().toISOString(),
  }

  window.__SHORT_TAX_AUTHORITY_PROBE__ = evidence
  console.table(evidence)
  return evidence
}

const runFixedHeightProbe = (heightMm) => {
  const requestedHeightMm = Number(heightMm)
  if (!Number.isFinite(requestedHeightMm) || requestedHeightMm <= 0) {
    throw new Error('heightMm ต้องเป็นตัวเลขมากกว่า 0')
  }

  replaceProbeStyle(`
    @page { size: 80mm ${requestedHeightMm}mm !important; margin: 0 !important; }
    @media print {
      html, body, #root {
        width: 80mm !important;
        height: ${requestedHeightMm}mm !important;
        min-height: ${requestedHeightMm}mm !important;
        max-height: ${requestedHeightMm}mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
    }
  `)

  const evidence = buildEvidence({
    mode: `fixed-${requestedHeightMm}mm`,
    requestedHeightMm,
  })

  window.print()
  return evidence
}

const runTestA = () => runFixedHeightProbe(120)
const runTestB = () => runFixedHeightProbe(400)

const runIframeProbe = ({ heightMm } = {}) => {
  const receipt = getReceiptRoot()
  const rect = receipt.getBoundingClientRect()
  const requestedHeightMm = Number.isFinite(Number(heightMm))
    ? Number(heightMm)
    : Math.ceil(pxToMm(rect.height) + 6)

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '1px',
    height: '1px',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
  })
  document.body.appendChild(iframe)

  const frameDocument = iframe.contentDocument
  if (!frameDocument) {
    iframe.remove()
    throw new Error('ไม่สามารถสร้าง iframe print document ได้')
  }

  const clonedReceipt = receipt.cloneNode(true)
  clonedReceipt.removeAttribute('style')

  const inheritedStyles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((node) => node.outerHTML)
    .join('\n')

  frameDocument.open()
  frameDocument.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  ${inheritedStyles}
  <style>
    @page { size: 80mm ${requestedHeightMm}mm; margin: 0; }
    html, body {
      width: 80mm;
      height: ${requestedHeightMm}mm;
      min-height: 0;
      margin: 0;
      padding: 0;
      overflow: visible;
      background: #fff;
    }
    .bill-print-root {
      position: static !important;
      display: block !important;
      width: 80mm !important;
      max-width: 80mm !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: #fff !important;
    }
  </style>
</head>
<body></body>
</html>`)
  frameDocument.close()
  frameDocument.body.appendChild(clonedReceipt)

  const evidence = buildEvidence({
    mode: 'iframe-isolated-document',
    requestedHeightMm,
    source: 'isolated-iframe',
  })

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 500)
  }

  iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true })
  window.setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
  }, 250)

  window.setTimeout(cleanup, 60_000)
  return evidence
}

const reset = () => {
  document.getElementById(PROBE_STYLE_ID)?.remove()
  delete window.__SHORT_TAX_AUTHORITY_PROBE__
  console.info('[ShortTaxPrintAuthorityProbe] reset complete')
}

export const shortTaxPrintAuthorityProbe = {
  runTestA,
  runTestB,
  runIframeProbe,
  runFixedHeightProbe,
  reset,
}

if (typeof window !== 'undefined') {
  window.ShortTaxPrintProbe = shortTaxPrintAuthorityProbe
  console.info(
    '[ShortTaxPrintAuthorityProbe] ready:',
    'ShortTaxPrintProbe.runTestA(), runTestB(), runIframeProbe(), reset()'
  )
}

export default shortTaxPrintAuthorityProbe

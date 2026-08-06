import { Buffer } from 'node:buffer'

const ESC = 0x1b
const GS = 0x1d

const COMMANDS = Object.freeze({
  initialize: Buffer.from([ESC, 0x40]),
  alignLeft: Buffer.from([ESC, 0x61, 0x00]),
  alignCenter: Buffer.from([ESC, 0x61, 0x01]),
  boldOn: Buffer.from([ESC, 0x45, 0x01]),
  boldOff: Buffer.from([ESC, 0x45, 0x00]),
  partialCut: Buffer.from([GS, 0x56, 0x01]),
})

const text = (value = '') => Buffer.from(String(value), 'utf8')
const line = (value = '') => Buffer.concat([text(value), Buffer.from('\n')])
const feed = (count = 3) => Buffer.from([ESC, 0x64, Math.max(0, Math.min(255, count))])

const formatMoney = (value) => Number(value || 0).toFixed(2)

const renderShortTaxInvoiceEscPos = (printJob, { feedLines = 4, cut = true } = {}) => {
  const snapshot = printJob.snapshot || {}
  const totals = snapshot.totals || {}
  const chunks = [COMMANDS.initialize, COMMANDS.alignCenter, COMMANDS.boldOn]

  chunks.push(line(snapshot.branchName || snapshot.companyName || 'Alpha-Tech'))
  if (snapshot.branchDesignation) chunks.push(line(snapshot.branchDesignation))
  chunks.push(COMMANDS.boldOff)
  if (snapshot.address) chunks.push(line(snapshot.address))
  if (snapshot.taxId) chunks.push(line(`เลขผู้เสียภาษี ${snapshot.taxId}`))
  chunks.push(line('ใบกำกับภาษีอย่างย่อ'))
  chunks.push(COMMANDS.alignLeft)
  chunks.push(line(`เลขที่ ${snapshot.documentNumber || snapshot.documentId || '-'}`))
  if (snapshot.printedAt) chunks.push(line(`วันที่ ${snapshot.printedAt}`))
  chunks.push(line('-'.repeat(42)))

  for (const item of snapshot.lines || []) {
    chunks.push(line(item.description || item.name || '-'))
    chunks.push(line(`${Number(item.quantity || 0)} x ${formatMoney(item.unitPrice)}    ${formatMoney(item.total ?? Number(item.quantity || 0) * Number(item.unitPrice || 0))}`))
  }

  chunks.push(line('-'.repeat(42)))
  chunks.push(line(`ก่อนภาษี ${formatMoney(totals.subtotal)}`))
  chunks.push(line(`ภาษีมูลค่าเพิ่ม ${formatMoney(totals.vat)}`))
  chunks.push(COMMANDS.boldOn)
  chunks.push(line(`รวมทั้งสิ้น ${formatMoney(totals.total)}`))
  chunks.push(COMMANDS.boldOff, COMMANDS.alignCenter)
  chunks.push(line(snapshot.footer || 'ขอบคุณที่ใช้บริการ'))
  chunks.push(feed(feedLines))
  if (cut) chunks.push(COMMANDS.partialCut)

  return Buffer.concat(chunks)
}

export { COMMANDS, feed, renderShortTaxInvoiceEscPos }
export default renderShortTaxInvoiceEscPos

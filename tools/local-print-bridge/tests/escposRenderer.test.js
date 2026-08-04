import assert from 'node:assert/strict'
import test from 'node:test'
import { COMMANDS, renderShortTaxInvoiceEscPos } from '../src/escposRenderer.js'

test('renders short tax invoice with initialize feed and partial cut', () => {
  const bytes = renderShortTaxInvoiceEscPos({
    jobId: 'JOB-1',
    snapshot: {
      branchName: 'บริษัท แอดวานซ์ เทค บรรพต จำกัด',
      branchDesignation: '(สำนักงานใหญ่)',
      documentNumber: 'SL-001',
      lines: [{ description: 'MOUSE', quantity: 1, unitPrice: 250 }],
      totals: { subtotal: 233.64, vat: 16.36, total: 250 },
    },
  })

  assert.ok(Buffer.isBuffer(bytes))
  assert.deepEqual(bytes.subarray(0, COMMANDS.initialize.length), COMMANDS.initialize)
  assert.equal(bytes.includes(Buffer.from('SL-001')), true)
  assert.equal(bytes.includes(Buffer.from('250.00')), true)
  assert.deepEqual(bytes.subarray(-COMMANDS.partialCut.length), COMMANDS.partialCut)
})

test('can render without cutter command', () => {
  const bytes = renderShortTaxInvoiceEscPos({ snapshot: { lines: [], totals: {} } }, { cut: false })
  assert.equal(bytes.subarray(-COMMANDS.partialCut.length).equals(COMMANDS.partialCut), false)
})

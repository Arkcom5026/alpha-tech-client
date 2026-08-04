import assert from 'node:assert/strict'
import test from 'node:test'
import { createMockPrinterAdapter } from '../src/mockPrinterAdapter.js'

const printer = {
  id: 'mock-epson-tm-t82x',
  isOnline: true,
}

const printJob = {
  jobId: 'job-1',
  snapshot: { total: 250 },
}

test('records successful mock print jobs', async () => {
  const adapter = createMockPrinterAdapter({
    latencyMs: 0,
    now: () => new Date('2026-08-04T10:00:00.000Z'),
  })

  const result = await adapter.print({ printer, printJob })

  assert.deepEqual(result, {
    jobId: 'job-1',
    printerId: 'mock-epson-tm-t82x',
    status: 'PRINTED',
    printedAt: '2026-08-04T10:00:00.000Z',
    adapter: 'MOCK',
  })
  assert.equal(adapter.listJobs().length, 1)
})

test('rejects offline printers', async () => {
  const adapter = createMockPrinterAdapter({ latencyMs: 0 })

  await assert.rejects(
    adapter.print({ printer: { ...printer, isOnline: false }, printJob }),
    /Printer is offline/
  )
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { createWindowsDriverSpool } from '../src/windowsDriverSpool.js'

const printJob = Object.freeze({
  jobId: 'shared-driver-job-1',
  branchId: '2',
  workstationId: 'counter-1',
  printerProfileId: 'windows:\\\\advice01\\EPSON TM-T82X Receipt',
  documentType: 'RECEIPT',
  snapshot: Object.freeze({ receiptNumber: 'RC-1', total: 100 }),
  options: Object.freeze({}),
})

test('submits a serialized print job to the Windows driver script', async () => {
  const calls = []
  const spool = createWindowsDriverSpool({
    platform: 'win32',
    execFileImpl: async (command, args, options) => {
      calls.push({ command, args, options })

      const jobPath = args[args.indexOf('-JobPath') + 1]
      const serialized = JSON.parse(await readFile(jobPath, 'utf8'))
      assert.deepEqual(serialized, printJob)

      return {
        stdout: JSON.stringify({
          ok: true,
          submitted: true,
          mode: 'WINDOWS_DRIVER',
        }),
      }
    },
  })

  const result = await spool({
    printerName: '\\\\advice01\\EPSON TM-T82X Receipt',
    documentName: printJob.jobId,
    printJob,
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].command, 'powershell.exe')
  assert.equal(calls[0].args.includes('-File'), true)
  assert.equal(calls[0].args.includes('-PrinterName'), true)
  assert.equal(calls[0].args.includes('-JobPath'), true)
  assert.equal(calls[0].options.windowsHide, true)
  assert.equal(result.ok, true)
  assert.equal(result.submitted, true)
  assert.equal(result.mode, 'WINDOWS_DRIVER')
})

test('rejects non-Windows execution before invoking PowerShell', async () => {
  let called = false
  const spool = createWindowsDriverSpool({
    platform: 'linux',
    execFileImpl: async () => {
      called = true
      return { stdout: '{}' }
    },
  })

  await assert.rejects(
    () => spool({
      printerName: '\\\\advice01\\EPSON TM-T82X Receipt',
      documentName: printJob.jobId,
      printJob,
    }),
    (error) => error.code === 'WINDOWS_REQUIRED'
  )

  assert.equal(called, false)
})

test('requires printer document and print job inputs', async () => {
  const spool = createWindowsDriverSpool({
    platform: 'win32',
    execFileImpl: async () => ({ stdout: '{}' }),
  })

  await assert.rejects(
    () => spool({ printerName: '', documentName: printJob.jobId, printJob }),
    /printerName is required/
  )

  await assert.rejects(
    () => spool({ printerName: 'queue', documentName: '', printJob }),
    /documentName is required/
  )

  await assert.rejects(
    () => spool({ printerName: 'queue', documentName: 'job', printJob: null }),
    /printJob is required/
  )
})

import process from 'node:process'
import {
  REQUIRED_CONFIRMATION,
  runSharedQueueSmoke,
} from '../src/sharedQueueSmokeHarness.js'

const printerProfileId = process.env.ALPHA_PRINT_BRIDGE_SMOKE_PRINTER_ID || ''
const confirmation = process.env.ALPHA_PRINT_BRIDGE_SMOKE_CONFIRMATION || ''
const bridgeUrl = process.env.ALPHA_PRINT_BRIDGE_URL || 'http://127.0.0.1:17451'

try {
  const result = await runSharedQueueSmoke({
    bridgeUrl,
    printerProfileId,
    confirmation,
  })

  console.log(JSON.stringify({
    ok: true,
    message: 'Shared queue physical smoke submitted successfully',
    requiredConfirmation: REQUIRED_CONFIRMATION,
    printerId: result.result.printerId,
    jobId: result.result.jobId,
    adapter: result.result.adapter,
    status: result.result.status,
    spool: result.result.spool,
  }, null, 2))
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    code: error.code || 'SHARED_QUEUE_SMOKE_FAILED',
    message: error.message,
  }, null, 2))
  process.exitCode = 1
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const commandPath = new URL('../tools/local-print-bridge/scripts/certify-local-printer-host.mjs', import.meta.url)

test('certification command is discovery-only and requires exact pilot identities', async () => {
  const source = await readFile(commandPath, 'utf8')

  assert.match(source, /discoverWindowsPrinters/)
  assert.match(source, /certifyLocalPrinterQueue/)
  assert.match(source, /ALPHA_PRINT_BRIDGE_PILOT_PRINTER_ID/)
  assert.match(source, /ALPHA_PRINT_BRIDGE_PILOT_DEVICE_ID/)
  assert.match(source, /ALPHA_PRINT_BRIDGE_PILOT_GATEWAY_ID/)
  assert.match(source, /physicalExecution:\s*false/)

  assert.doesNotMatch(source, /physicalPilotAdapter/)
  assert.doesNotMatch(source, /raw-print\.ps1/)
  assert.doesNotMatch(source, /execFile/)
  assert.doesNotMatch(source, /\/v1\/physical-pilot/)
})

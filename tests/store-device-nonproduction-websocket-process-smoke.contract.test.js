import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createNonProductionWebSocketHarness } from '../tools/local-print-bridge/test-harness/nonProductionWebSocketHarness.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitFor = async (probe, { timeoutMs = 6_000, intervalMs = 50 } = {}) => {
  const deadline = Date.now() + timeoutMs
  let lastError = null
  while (Date.now() < deadline) {
    try {
      const value = await probe()
      if (value) return value
    } catch (error) {
      lastError = error
    }
    await sleep(intervalMs)
  }
  throw lastError || new Error('timed out waiting for runtime condition')
}

const stopChild = (child) => new Promise((resolve) => {
  if (child.exitCode !== null) return resolve()
  child.once('exit', resolve)
  child.kill('SIGTERM')
  setTimeout(() => child.kill('SIGKILL'), 1_000).unref()
})

test('connects bridge process to non-production websocket harness and reconnects safely', async () => {
  const harnessPort = 18452
  const bridgePort = 17461
  const harness = createNonProductionWebSocketHarness({ port: harnessPort, forceCloseAfterHeartbeats: 1 })
  await harness.start()

  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: new URL('../tools/local-print-bridge/', import.meta.url),
    env: {
      ...process.env,
      ALPHA_PRINT_BRIDGE_PORT: String(bridgePort),
      ALPHA_DEVICE_GATEWAY_ENABLED: '1',
      ALPHA_DEVICE_GATEWAY_ENDPOINT: `ws://127.0.0.1:${harnessPort}/gateway`,
      ALPHA_DEVICE_GATEWAY_ID: 'gateway-smoke-01',
      ALPHA_DEVICE_GATEWAY_BRANCH_ID: '2',
      ALPHA_DEVICE_GATEWAY_HEARTBEAT_MS: '50',
      ALPHA_DEVICE_GATEWAY_RECONNECT_INITIAL_MS: '25',
      ALPHA_DEVICE_GATEWAY_RECONNECT_MAX_MS: '100',
      ALPHA_DEVICE_GATEWAY_PHYSICAL_EXECUTION: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let stderr = ''
  child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8') })

  try {
    const initialHealth = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${bridgePort}/health`)
      if (!response.ok) return null
      return response.json()
    })

    assert.equal(initialHealth.version, '0.4.0')
    assert.equal(initialHealth.gateway.enabled, true)
    assert.equal(initialHealth.gateway.physicalExecutionEnabled, false)
    assert.equal(initialHealth.rawPrintingEnabled, false)
    assert.equal(initialHealth.physicalPilotEnabled, false)

    await waitFor(() => harness.stats.heartbeats >= 2 && harness.stats.connections >= 2)

    const finalHealth = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${bridgePort}/health`)
      const health = await response.json()
      return health.gateway.reconnectCursor ? health : null
    })

    assert.equal(harness.stats.lastGatewayId, 'gateway-smoke-01')
    assert.equal(harness.stats.lastBranchId, 2)
    assert.ok(harness.stats.disconnects >= 1)
    assert.equal(finalHealth.gateway.enabled, true)
    assert.equal(finalHealth.gateway.physicalExecutionEnabled, false)
    assert.match(finalHealth.gateway.reconnectCursor, /^cursor-/)
  } finally {
    await stopChild(child)
    await harness.stop()
  }

  assert.equal(stderr, '')
})

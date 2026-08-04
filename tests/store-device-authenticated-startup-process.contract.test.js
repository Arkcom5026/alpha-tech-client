import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createAuthenticatedWebSocketHarness } from '../tools/local-print-bridge/test-harness/authenticatedWebSocketHarness.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const waitFor = async (probe, timeoutMs = 6_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const value = await probe()
      if (value) return value
    } catch {}
    await sleep(50)
  }
  throw new Error('timed out waiting for authenticated gateway runtime')
}
const stopChild = (child) => new Promise((resolve) => {
  if (child.exitCode !== null) return resolve()
  child.once('exit', resolve)
  child.kill('SIGTERM')
  setTimeout(() => child.kill('SIGKILL'), 1_000).unref()
})

test('exposes authenticated gateway session diagnostics through bridge health', async () => {
  const harnessPort = 18454
  const bridgePort = 17462
  const proofKey = 'non-production-proof-key-2026'
  const harness = createAuthenticatedWebSocketHarness({ port: harnessPort, gatewayId: 'gateway-startup-process-01', branchId: 2, credentialVersion: 1, proofKey })
  await harness.start()

  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: new URL('../tools/local-print-bridge/', import.meta.url),
    env: {
      ...process.env,
      ALPHA_PRINT_BRIDGE_PORT: String(bridgePort),
      ALPHA_DEVICE_GATEWAY_ENABLED: '1',
      ALPHA_DEVICE_GATEWAY_ENDPOINT: `ws://127.0.0.1:${harnessPort}/gateway`,
      ALPHA_DEVICE_GATEWAY_ID: 'gateway-startup-process-01',
      ALPHA_DEVICE_GATEWAY_BRANCH_ID: '2',
      ALPHA_DEVICE_GATEWAY_CREDENTIAL_VERSION: '1',
      ALPHA_DEVICE_GATEWAY_PROOF_KEY: proofKey,
      ALPHA_DEVICE_GATEWAY_HEARTBEAT_MS: '50',
      ALPHA_DEVICE_GATEWAY_PHYSICAL_EXECUTION: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stderr = ''
  child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8') })

  try {
    const health = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${bridgePort}/health`)
      if (!response.ok) return null
      const value = await response.json()
      return value.gateway?.authenticated && value.gateway?.lastHeartbeatAt ? value : null
    })

    assert.equal(harness.stats.authenticated, 1)
    assert.ok(harness.stats.heartbeats >= 1)
    assert.equal(health.gateway.state, 'AUTHENTICATED')
    assert.equal(health.gateway.authenticated, true)
    assert.match(health.gateway.sessionId, /^session-/)
    assert.equal(health.gateway.credentialVersion, 1)
    assert.ok(health.gateway.lastAuthenticatedAt)
    assert.ok(health.gateway.lastHeartbeatAt)
    assert.equal(health.gateway.physicalExecutionEnabled, false)
    assert.equal('proofKey' in health.gateway, false)
  } finally {
    await stopChild(child)
    await harness.stop()
  }
  assert.equal(stderr, '')
})

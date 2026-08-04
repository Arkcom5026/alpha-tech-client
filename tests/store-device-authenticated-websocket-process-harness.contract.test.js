import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createAuthenticatedWebSocketHarness } from '../tools/local-print-bridge/test-harness/authenticatedWebSocketHarness.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const waitFor = async (probe, timeoutMs = 6_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = await probe()
    if (value) return value
    await sleep(40)
  }
  throw new Error('timed out waiting for authenticated websocket process')
}
const stopChild = (child) => new Promise((resolve) => {
  if (child.exitCode !== null) return resolve()
  child.once('exit', resolve)
  child.kill('SIGTERM')
  setTimeout(() => child.kill('SIGKILL'), 1_000).unref()
})

test('authenticates signed gateway proof before process heartbeat', async () => {
  const port = 18453
  const proofKey = 'non-production-proof-key-2026'
  const harness = createAuthenticatedWebSocketHarness({ port, proofKey })
  await harness.start()
  const child = spawn(process.execPath, ['test-harness/authenticatedGatewayProcess.js'], {
    cwd: new URL('../tools/local-print-bridge/', import.meta.url),
    env: {
      ...process.env,
      ALPHA_AUTH_HARNESS_ENDPOINT: `ws://127.0.0.1:${port}/gateway`,
      ALPHA_DEVICE_GATEWAY_ID: 'gateway-auth-smoke-01',
      ALPHA_DEVICE_GATEWAY_BRANCH_ID: '2',
      ALPHA_DEVICE_GATEWAY_PROOF_KEY: proofKey,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stderr = ''
  child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8') })
  try {
    await waitFor(() => harness.stats.authenticated === 1 && harness.stats.heartbeats >= 1)
    assert.equal(harness.stats.connections, 1)
    assert.equal(harness.stats.challenges, 1)
    assert.equal(harness.stats.authenticated, 1)
    assert.equal(harness.stats.rejected, 0)
    assert.match(harness.stats.lastSessionId, /^session-/)
  } finally {
    await stopChild(child)
    await harness.stop()
  }
  assert.equal(stderr, '')
})

test('rejects gateway process using invalid proof key before heartbeat', async () => {
  const port = 18454
  const harness = createAuthenticatedWebSocketHarness({ port, proofKey: 'non-production-proof-key-2026' })
  await harness.start()
  const child = spawn(process.execPath, ['test-harness/authenticatedGatewayProcess.js'], {
    cwd: new URL('../tools/local-print-bridge/', import.meta.url),
    env: {
      ...process.env,
      ALPHA_AUTH_HARNESS_ENDPOINT: `ws://127.0.0.1:${port}/gateway`,
      ALPHA_DEVICE_GATEWAY_ID: 'gateway-auth-smoke-01',
      ALPHA_DEVICE_GATEWAY_BRANCH_ID: '2',
      ALPHA_DEVICE_GATEWAY_PROOF_KEY: 'invalid-non-production-proof-key',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  try {
    await waitFor(() => harness.stats.rejected === 1)
    assert.equal(harness.stats.authenticated, 0)
    assert.equal(harness.stats.heartbeats, 0)
  } finally {
    await stopChild(child)
    await harness.stop()
  }
})

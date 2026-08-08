import assert from 'node:assert/strict'
import test from 'node:test'
import {
  bootstrapStoreDeviceGatewaySession,
  createStoreDeviceGatewaySessionClient,
} from '../src/storeDeviceGatewaySessionClient.js'

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() { return body },
})

test('registers, authenticates, and heartbeats one store device gateway session', async () => {
  const calls = []
  const client = createStoreDeviceGatewaySessionClient({
    serverBaseUrl: 'https://example.test/',
    getAuthorization: async () => 'Bearer pilot-token',
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      if (url.endsWith('/api/store-devices/gateways')) {
        return jsonResponse(201, {
          data: {
            id: 7,
            branchId: 2,
            gatewayId: 'print-bridge-win-01',
            enrollmentState: 'ENROLLED',
            runtimeState: 'OFFLINE',
            credentialVersion: 1,
          },
        })
      }
      if (url.endsWith('/api/store-devices/gateways/print-bridge-win-01/sessions')) {
        return jsonResponse(201, {
          data: {
            id: 9,
            branchId: 2,
            gatewayId: 7,
            sessionId: 'sds_session-1',
            credentialVersion: 1,
            state: 'AUTHENTICATED',
          },
        })
      }
      return jsonResponse(200, {
        data: {
          gatewayId: 'print-bridge-win-01',
          sessionId: 'sds_session-1',
          heartbeatAt: '2026-08-08T05:00:00.000Z',
        },
      })
    },
  })

  const result = await bootstrapStoreDeviceGatewaySession({
    client,
    gatewayId: 'print-bridge-win-01',
    credentialVersion: 1,
    capabilitiesSnapshot: { printing: true, saleReceipt: true },
    platformSnapshot: { platform: 'win32', node: '22.22.0' },
  })

  assert.deepEqual(result.authority, {
    gatewayId: 'print-bridge-win-01',
    sessionId: 'sds_session-1',
  })
  assert.equal(result.gateway.enrollmentState, 'ENROLLED')
  assert.equal(result.session.state, 'AUTHENTICATED')
  assert.equal(result.heartbeat.gatewayId, 'print-bridge-win-01')
  assert.equal(calls.length, 3)
  assert.equal(calls[0].options.headers.Authorization, 'Bearer pilot-token')
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    gatewayId: 'print-bridge-win-01',
    credentialVersion: 1,
    capabilitiesSnapshot: { printing: true, saleReceipt: true },
    platformSnapshot: { platform: 'win32', node: '22.22.0' },
  })
  assert.match(calls[1].url, /\/gateways\/print-bridge-win-01\/sessions$/)
  assert.match(calls[2].url, /\/sessions\/sds_session-1\/heartbeat$/)
})

test('fails closed on mismatched gateway and heartbeat authority', async () => {
  const registerMismatch = createStoreDeviceGatewaySessionClient({
    serverBaseUrl: 'https://example.test',
    fetchImpl: async () => jsonResponse(201, {
      data: { gatewayId: 'other-gateway' },
    }),
  })

  await assert.rejects(
    () => registerMismatch.register({ gatewayId: 'print-bridge-win-01' }),
    (error) => error.code === 'PRINT_BRIDGE_GATEWAY_RESPONSE_MISMATCH',
  )

  let requestCount = 0
  const heartbeatMismatch = createStoreDeviceGatewaySessionClient({
    serverBaseUrl: 'https://example.test',
    fetchImpl: async () => {
      requestCount += 1
      return jsonResponse(200, {
        data: { gatewayId: 'other-gateway', sessionId: 'other-session' },
      })
    },
  })

  await assert.rejects(
    () => heartbeatMismatch.heartbeat({
      gatewayId: 'print-bridge-win-01',
      sessionId: 'sds_session-1',
    }),
    (error) => error.code === 'PRINT_BRIDGE_GATEWAY_HEARTBEAT_MISMATCH',
  )
  assert.equal(requestCount, 1)
})

test('propagates server gateway lifecycle failure codes', async () => {
  const client = createStoreDeviceGatewaySessionClient({
    serverBaseUrl: 'https://example.test',
    fetchImpl: async () => jsonResponse(403, {
      code: 'STORE_DEVICE_GATEWAY_SESSION_INACTIVE',
      error: 'Gateway is revoked',
    }),
  })

  await assert.rejects(
    () => client.authenticate({ gatewayId: 'print-bridge-win-01' }),
    (error) =>
      error.code === 'STORE_DEVICE_GATEWAY_SESSION_INACTIVE'
      && error.statusCode === 403,
  )
})

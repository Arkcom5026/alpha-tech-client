import { createGatewayTransportContract } from './createGatewayTransportContract.js'

const createInMemoryGatewayTransport = ({ gatewayId, branchId, protocolVersion = '1.0' } = {}) => {
  let contract = createGatewayTransportContract({
    transportId: `memory:${gatewayId}`,
    gatewayId,
    branchId,
    protocolVersion,
  })
  let revoked = false
  const outbound = []
  const inbound = []

  const assertActive = () => {
    if (revoked) {
      const error = new Error('gateway transport is revoked')
      error.code = 'GATEWAY_TRANSPORT_REVOKED'
      throw error
    }
  }

  return Object.freeze({
    get snapshot() {
      return contract
    },
    connect({ reconnectCursor = null } = {}) {
      assertActive()
      contract = createGatewayTransportContract({
        ...contract,
        state: 'CONNECTED',
        reconnectCursor,
        connectedAt: new Date().toISOString(),
        disconnectedAt: null,
      })
      return contract
    },
    disconnect() {
      if (revoked) return contract
      contract = createGatewayTransportContract({
        ...contract,
        state: 'DISCONNECTED',
        disconnectedAt: new Date().toISOString(),
      })
      return contract
    },
    revoke() {
      revoked = true
      contract = createGatewayTransportContract({
        ...contract,
        state: 'REVOKED',
        disconnectedAt: new Date().toISOString(),
      })
      return contract
    },
    send(envelope) {
      assertActive()
      if (contract.state !== 'CONNECTED') throw new Error('transport must be connected before send')
      if (envelope.gatewayId !== contract.gatewayId || envelope.branchId !== contract.branchId) {
        const error = new Error('transport authority mismatch')
        error.code = 'TRANSPORT_AUTHORITY_MISMATCH'
        throw error
      }
      outbound.push(structuredClone(envelope))
      return outbound.length
    },
    receive(envelope) {
      assertActive()
      if (envelope.gatewayId !== contract.gatewayId || envelope.branchId !== contract.branchId) {
        const error = new Error('transport authority mismatch')
        error.code = 'TRANSPORT_AUTHORITY_MISMATCH'
        throw error
      }
      inbound.push(structuredClone(envelope))
      return inbound.length
    },
    drainOutbound() {
      return outbound.splice(0).map((item) => Object.freeze(item))
    },
    drainInbound() {
      return inbound.splice(0).map((item) => Object.freeze(item))
    },
  })
}

export { createInMemoryGatewayTransport }
export default createInMemoryGatewayTransport

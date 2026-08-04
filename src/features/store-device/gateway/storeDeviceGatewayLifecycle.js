const heartbeatGateway = (gateway, { at = new Date().toISOString(), runtimeState = 'ONLINE' } = {}) => {
  if (gateway.enrollmentState !== 'ENROLLED') {
    throw new Error('Only enrolled gateways may heartbeat')
  }
  if (gateway.enrollmentState === 'REVOKED') {
    throw new Error('Revoked gateways may not heartbeat')
  }
  return Object.freeze({ ...gateway, runtimeState, lastHeartbeatAt: at })
}

const rotateGatewayCredential = (gateway) => {
  if (gateway.enrollmentState === 'REVOKED') {
    throw new Error('Revoked gateways may not rotate credentials')
  }
  return Object.freeze({ ...gateway, credentialVersion: gateway.credentialVersion + 1 })
}

const revokeGateway = (gateway, { at = new Date().toISOString() } = {}) => Object.freeze({
  ...gateway,
  enrollmentState: 'REVOKED',
  runtimeState: 'OFFLINE',
  revokedAt: at,
})

export { heartbeatGateway, rotateGatewayCredential, revokeGateway }

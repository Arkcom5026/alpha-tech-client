const createGatewayRuntimeDiagnostics = ({ now = () => new Date().toISOString() } = {}) => {
  let state = Object.freeze({
    status: 'DISABLED',
    connected: false,
    authenticated: false,
    reconnectAttempt: 0,
    reconnectCursor: null,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    lastHeartbeatAt: null,
    lastMessageAt: null,
    lastError: null,
    physicalExecutionEnabled: false,
  })

  const patch = (values) => {
    state = Object.freeze({ ...state, ...values })
    return state
  }

  return Object.freeze({
    get snapshot() { return state },
    disabled() { return patch({ status: 'DISABLED', connected: false, authenticated: false }) },
    connecting(attempt = 0) { return patch({ status: attempt > 0 ? 'RECONNECTING' : 'CONNECTING', reconnectAttempt: attempt, lastError: null }) },
    connected() { return patch({ status: 'CONNECTED', connected: true, lastConnectedAt: now(), lastError: null }) },
    authenticated() { return patch({ status: 'AUTHENTICATED', authenticated: true, reconnectAttempt: 0 }) },
    heartbeat() { return patch({ lastHeartbeatAt: now() }) },
    message({ reconnectCursor = state.reconnectCursor } = {}) { return patch({ lastMessageAt: now(), reconnectCursor }) },
    disconnected(error = null) {
      return patch({
        status: 'DISCONNECTED',
        connected: false,
        authenticated: false,
        lastDisconnectedAt: now(),
        lastError: error ? String(error.message || error) : null,
      })
    },
    revoke() { return patch({ status: 'REVOKED', connected: false, authenticated: false }) },
    setPhysicalExecutionEnabled(enabled) { return patch({ physicalExecutionEnabled: enabled === true }) },
  })
}

export { createGatewayRuntimeDiagnostics }
export default createGatewayRuntimeDiagnostics

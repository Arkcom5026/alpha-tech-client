const SENSITIVE_KEYS = /proof|secret|token|credential|certificate|privateKey/i

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEYS.test(key))
      .map(([key, nested]) => [key, sanitize(nested)]),
  )
}

export function createStoreDeviceAuditProjection({ branchId, events = [] }) {
  const scopedEvents = events
    .filter((event) => event.branchId === branchId)
    .map((event) => Object.freeze(sanitize(structuredClone(event))))

  const latestByGateway = new Map()
  for (const event of scopedEvents) {
    if (event.gatewayId) latestByGateway.set(event.gatewayId, event)
  }

  return Object.freeze({
    branchId,
    totalEvents: scopedEvents.length,
    errorEvents: scopedEvents.filter((event) => event.severity === 'ERROR').length,
    offlineEvents: scopedEvents.filter((event) => event.type === 'GATEWAY_OFFLINE').length,
    gateways: [...latestByGateway.entries()].map(([gatewayId, latestEvent]) => ({ gatewayId, latestEvent })),
    events: scopedEvents,
  })
}

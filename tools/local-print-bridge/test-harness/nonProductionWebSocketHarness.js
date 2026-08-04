import http from 'node:http'
import { createHash } from 'node:crypto'

const encodeServerTextFrame = (value) => {
  const payload = Buffer.from(JSON.stringify(value), 'utf8')
  if (payload.length >= 126) throw new Error('harness payload is too large')
  return Buffer.concat([Buffer.from([0x81, payload.length]), payload])
}

const decodeClientFrames = (buffer) => {
  const messages = []
  let offset = 0
  while (buffer.length - offset >= 2) {
    const first = buffer[offset]
    const second = buffer[offset + 1]
    const opcode = first & 0x0f
    const masked = (second & 0x80) !== 0
    let length = second & 0x7f
    let headerLength = 2
    if (length === 126) {
      if (buffer.length - offset < 4) break
      length = buffer.readUInt16BE(offset + 2)
      headerLength = 4
    }
    const maskLength = masked ? 4 : 0
    if (buffer.length - offset < headerLength + maskLength + length) break
    const mask = masked ? buffer.subarray(offset + headerLength, offset + headerLength + 4) : null
    const payloadStart = offset + headerLength + maskLength
    const payload = Buffer.from(buffer.subarray(payloadStart, payloadStart + length))
    if (mask) for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4]
    if (opcode === 0x1) messages.push({ type: 'message', data: payload.toString('utf8') })
    if (opcode === 0x8) messages.push({ type: 'close' })
    offset = payloadStart + length
  }
  return { messages, remaining: buffer.subarray(offset) }
}

const createNonProductionWebSocketHarness = ({ host = '127.0.0.1', port = 18452, forceCloseAfterHeartbeats = 1 } = {}) => {
  const stats = {
    connections: 0,
    disconnects: 0,
    heartbeats: 0,
    lastGatewayId: null,
    lastBranchId: null,
    lastReconnectCursor: null,
  }
  const sockets = new Set()

  const server = http.createServer((req, res) => {
    if (req.url === '/stats') {
      const body = JSON.stringify(stats)
      res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) })
      res.end(body)
      return
    }
    res.writeHead(404)
    res.end()
  })

  server.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key']
    if (!key) return socket.destroy()
    const accept = createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64')
    socket.write([
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '\r\n',
    ].join('\r\n'))

    stats.connections += 1
    sockets.add(socket)
    let buffer = Buffer.alloc(0)
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk])
      const decoded = decodeClientFrames(buffer)
      buffer = decoded.remaining
      for (const event of decoded.messages) {
        if (event.type === 'close') return socket.end()
        const envelope = JSON.parse(event.data)
        if (envelope.messageType !== 'HEARTBEAT') continue
        stats.heartbeats += 1
        stats.lastGatewayId = envelope.gatewayId
        stats.lastBranchId = envelope.branchId
        stats.lastReconnectCursor = envelope.reconnectCursor || null
        const cursor = `cursor-${stats.heartbeats}`
        socket.write(encodeServerTextFrame({
          messageType: 'HEARTBEAT_ACK',
          gatewayId: envelope.gatewayId,
          branchId: envelope.branchId,
          reconnectCursor: cursor,
        }))
        if (forceCloseAfterHeartbeats > 0 && stats.heartbeats === forceCloseAfterHeartbeats) {
          setTimeout(() => socket.destroy(), 10)
        }
      }
    })
    socket.on('close', () => {
      sockets.delete(socket)
      stats.disconnects += 1
    })
  })

  return Object.freeze({
    get stats() { return Object.freeze({ ...stats }) },
    start: () => new Promise((resolve) => server.listen(port, host, () => resolve({ host, port }))),
    stop: () => new Promise((resolve, reject) => {
      for (const socket of sockets) socket.destroy()
      server.close((error) => error ? reject(error) : resolve())
    }),
  })
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replaceAll('\\', '/')}`).href) {
  const harness = createNonProductionWebSocketHarness({
    host: process.env.ALPHA_DEVICE_HARNESS_HOST || '127.0.0.1',
    port: Number(process.env.ALPHA_DEVICE_HARNESS_PORT || 18452),
    forceCloseAfterHeartbeats: Number(process.env.ALPHA_DEVICE_HARNESS_FORCE_CLOSE_AFTER || 1),
  })
  await harness.start()
  console.log('[device-harness] ready')
  const shutdown = async () => { await harness.stop(); process.exit(0) }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

export { createNonProductionWebSocketHarness }
export default createNonProductionWebSocketHarness

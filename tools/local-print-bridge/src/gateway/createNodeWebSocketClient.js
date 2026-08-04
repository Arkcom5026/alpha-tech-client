import net from 'node:net'
import tls from 'node:tls'
import { createHash, randomBytes } from 'node:crypto'

const OPEN = 1
const CLOSED = 3

const encodeClientTextFrame = (text) => {
  const payload = Buffer.from(String(text), 'utf8')
  const mask = randomBytes(4)
  const header = payload.length < 126
    ? Buffer.from([0x81, 0x80 | payload.length])
    : Buffer.from([0x81, 0x80 | 126, (payload.length >> 8) & 0xff, payload.length & 0xff])
  const masked = Buffer.alloc(payload.length)
  for (let index = 0; index < payload.length; index += 1) masked[index] = payload[index] ^ mask[index % 4]
  return Buffer.concat([header, mask, masked])
}

const decodeServerFrames = (buffer) => {
  const messages = []
  let offset = 0
  while (buffer.length - offset >= 2) {
    const first = buffer[offset]
    const second = buffer[offset + 1]
    const opcode = first & 0x0f
    let length = second & 0x7f
    let headerLength = 2
    if (length === 126) {
      if (buffer.length - offset < 4) break
      length = buffer.readUInt16BE(offset + 2)
      headerLength = 4
    }
    if (buffer.length - offset < headerLength + length) break
    const payload = buffer.subarray(offset + headerLength, offset + headerLength + length)
    if (opcode === 0x1) messages.push({ type: 'message', data: payload.toString('utf8') })
    if (opcode === 0x8) messages.push({ type: 'close' })
    offset += headerLength + length
  }
  return { messages, remaining: buffer.subarray(offset) }
}

const createNodeWebSocketClient = (url) => {
  const endpoint = new URL(url)
  if (!['ws:', 'wss:'].includes(endpoint.protocol)) throw new TypeError('websocket endpoint must use ws or wss')

  const client = {
    readyState: 0,
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    send(text) {
      if (client.readyState !== OPEN) throw new Error('websocket is not open')
      socket.write(encodeClientTextFrame(text))
    },
    close() {
      if (client.readyState === CLOSED) return
      client.readyState = CLOSED
      socket.end(Buffer.from([0x88, 0x80, 0, 0, 0, 0]))
    },
  }

  const key = randomBytes(16).toString('base64')
  const port = Number(endpoint.port || (endpoint.protocol === 'wss:' ? 443 : 80))
  const connectOptions = { host: endpoint.hostname, port, servername: endpoint.hostname }
  const socket = endpoint.protocol === 'wss:' ? tls.connect(connectOptions) : net.connect(connectOptions)
  let handshakeBuffer = Buffer.alloc(0)
  let frameBuffer = Buffer.alloc(0)
  let upgraded = false

  socket.on('connect', () => {
    const path = `${endpoint.pathname || '/'}${endpoint.search || ''}`
    socket.write([
      `GET ${path} HTTP/1.1`,
      `Host: ${endpoint.host}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${key}`,
      'Sec-WebSocket-Version: 13',
      '\r\n',
    ].join('\r\n'))
  })

  socket.on('data', (chunk) => {
    if (!upgraded) {
      handshakeBuffer = Buffer.concat([handshakeBuffer, chunk])
      const boundary = handshakeBuffer.indexOf('\r\n\r\n')
      if (boundary < 0) return
      const headers = handshakeBuffer.subarray(0, boundary).toString('utf8')
      const expectedAccept = createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64')
      if (!headers.startsWith('HTTP/1.1 101') || !headers.toLowerCase().includes(`sec-websocket-accept: ${expectedAccept.toLowerCase()}`)) {
        const error = new Error('websocket upgrade failed')
        client.onerror?.(error)
        socket.destroy(error)
        return
      }
      upgraded = true
      client.readyState = OPEN
      client.onopen?.()
      frameBuffer = handshakeBuffer.subarray(boundary + 4)
      handshakeBuffer = Buffer.alloc(0)
    } else {
      frameBuffer = Buffer.concat([frameBuffer, chunk])
    }

    const decoded = decodeServerFrames(frameBuffer)
    frameBuffer = decoded.remaining
    for (const event of decoded.messages) {
      if (event.type === 'message') client.onmessage?.({ data: event.data })
      if (event.type === 'close') socket.end()
    }
  })

  socket.on('error', (error) => client.onerror?.(error))
  socket.on('close', () => {
    client.readyState = CLOSED
    client.onclose?.()
  })

  return client
}

export { createNodeWebSocketClient }
export default createNodeWebSocketClient

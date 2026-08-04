const FRAME_VERSION = '1.0'

const encodeGatewayWebSocketFrame = ({ frameType = 'PROTOCOL', envelope } = {}) => {
  if (!envelope || typeof envelope !== 'object') throw new TypeError('envelope is required')
  return JSON.stringify({ frameVersion: FRAME_VERSION, frameType, envelope })
}

const decodeGatewayWebSocketFrame = (raw) => {
  const text = typeof raw === 'string' ? raw : Buffer.from(raw).toString('utf8')
  const frame = JSON.parse(text)
  if (frame.frameVersion !== FRAME_VERSION) {
    const error = new Error('unsupported websocket frame version')
    error.code = 'UNSUPPORTED_WEBSOCKET_FRAME_VERSION'
    throw error
  }
  if (!frame.envelope || typeof frame.envelope !== 'object') throw new TypeError('frame envelope is required')
  return Object.freeze({ frameVersion: frame.frameVersion, frameType: frame.frameType, envelope: Object.freeze(structuredClone(frame.envelope)) })
}

export { FRAME_VERSION, decodeGatewayWebSocketFrame, encodeGatewayWebSocketFrame }

const createMockWebSocketPair = () => {
  const createSocket = () => ({
    readyState: 0,
    peer: null,
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    send(data) {
      if (this.readyState !== 1) throw new Error('mock websocket is not open')
      queueMicrotask(() => this.peer?.onmessage?.({ data }))
    },
    close() {
      if (this.readyState === 3) return
      this.readyState = 3
      const peer = this.peer
      queueMicrotask(() => this.onclose?.({ code: 1000 }))
      if (peer && peer.readyState !== 3) {
        peer.readyState = 3
        queueMicrotask(() => peer.onclose?.({ code: 1000 }))
      }
    },
  })

  const client = createSocket()
  const server = createSocket()
  client.peer = server
  server.peer = client

  const open = () => {
    client.readyState = 1
    server.readyState = 1
    queueMicrotask(() => client.onopen?.())
    queueMicrotask(() => server.onopen?.())
  }

  return Object.freeze({ client, server, open })
}

export { createMockWebSocketPair }
export default createMockWebSocketPair

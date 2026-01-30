import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { WsGatewayPayload } from '../../types/ws/WsGatewayPayload'
import { createSocketClient } from '../client'

type Listener = (event?: { data?: string }) => void

class MockWebSocket {
  static OPEN = 1
  static CLOSED = 3
  static instances: MockWebSocket[] = []

  url: string
  readyState = 0
  sent: string[] = []
  listeners: Record<string, Listener[]> = {}

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners[type] ??= []
    this.listeners[type].push(listener)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    this.emit('close')
  }

  open() {
    this.readyState = MockWebSocket.OPEN
    this.emit('open')
  }

  error() {
    this.emit('error')
  }

  message(data: string) {
    this.emit('message', { data })
  }

  emit(type: string, event: { data?: string } = {}) {
    this.listeners[type]?.forEach((listener) => listener(event))
  }
}

describe('createSocketClient', () => {
  const originalWebSocket = globalThis.WebSocket

  beforeEach(() => {
    MockWebSocket.instances = []
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket
  })

  afterEach(() => {
    globalThis.WebSocket = originalWebSocket
  })

  it('connects, emits events, and sends payloads', () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const onError = vi.fn()
    const onMessage = vi.fn()

    const client = createSocketClient<WsGatewayPayload>({
      url: () => 'ws://example.test/ws',
      onOpen,
      onClose,
      onError,
      onMessage,
    })

    expect(client.isOpen()).toBe(false)
    expect(client.send({ op: 'Hello', d: { heartbeat_interval_ms: 1000 } })).toBe(false)

    client.connect()
    const socket = MockWebSocket.instances[0]
    expect(socket).toBeDefined()
    if (!socket) {
      throw new Error('MockWebSocket instance not created')
    }

    socket.open()
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(client.isOpen()).toBe(true)

    const payload: WsGatewayPayload = { op: 'Hello', d: { heartbeat_interval_ms: 1200 } }
    socket.message(JSON.stringify(payload))
    expect(onMessage).toHaveBeenCalledWith(payload)

    expect(client.send(payload)).toBe(true)
    expect(socket.sent).toHaveLength(1)

    socket.error()
    expect(onError).toHaveBeenCalledTimes(1)

    client.disconnect()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(client.isOpen()).toBe(false)
  })
})

import { render } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import type { DispatchPayload } from '@/types/gateway/incoming/DispatchPayload.ts'

import { createSocketClient } from '../client'
import { useWebsocket } from '../useWebsocket'

const getAccessTokenSilently = vi.fn()
const isAuthenticated = ref(false)

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    getAccessTokenSilently,
    isAuthenticated,
  }),
}))

const mockSocketClient = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  isOpen: vi.fn(() => false),
  send: vi.fn(() => true),
}

vi.mock('../client.ts', () => ({
  createSocketClient: vi.fn(() => mockSocketClient),
}))

describe('useWebsocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isAuthenticated.value = false
    mockSocketClient.isOpen.mockReturnValue(false)
  })

  describe('initial state', () => {
    it('starts disconnected with idle status', () => {
      const ws = useWebsocket()

      expect(ws.status.value).toBe('disconnected')
      expect(ws.statusNote.value).toBe('Idle')
      expect(ws.gatewayLog.value).toEqual([])
    })

    it('returns correct status labels', () => {
      const ws = useWebsocket()

      expect(ws.statusLabel.value).toBe('Disconnected')

      ws.status.value = 'connecting'
      expect(ws.statusLabel.value).toBe('Connecting')

      ws.status.value = 'connected'
      expect(ws.statusLabel.value).toBe('Connected')

      ws.status.value = 'ready'
      expect(ws.statusLabel.value).toBe('Ready')

      ws.status.value = 'error'
      expect(ws.statusLabel.value).toBe('Error')
    })
  })

  describe('connect', () => {
    it('shows error when not authenticated', async () => {
      isAuthenticated.value = false
      const ws = useWebsocket()

      await ws.connect()

      expect(ws.status.value).toBe('error')
      expect(ws.statusNote.value).toBe('Please sign in before connecting')
      expect(createSocketClient).not.toHaveBeenCalled()
    })

    it('fetches token and creates socket when authenticated', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token-123')

      const ws = useWebsocket()
      await ws.connect()

      expect(getAccessTokenSilently).toHaveBeenCalled()
      expect(ws.gatewayLog.value).toContain('< AUTH0 token ok')
      expect(createSocketClient).toHaveBeenCalled()
      expect(mockSocketClient.connect).toHaveBeenCalled()
    })

    it('handles token fetch failure', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockRejectedValue(new Error('Token expired'))

      const ws = useWebsocket()
      await ws.connect()

      expect(ws.status.value).toBe('error')
      expect(ws.statusNote.value).toBe('Token fetch failed: Token expired')
    })

    it('handles non-Error token fetch failure', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockRejectedValue('string error')

      const ws = useWebsocket()
      await ws.connect()

      expect(ws.status.value).toBe('error')
      expect(ws.statusNote.value).toBe('Token fetch failed: Unknown error')
    })
  })

  describe('socket callbacks', () => {
    it('handles onOpen by setting connected status and sending identify', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')
      mockSocketClient.isOpen.mockReturnValue(true)

      let capturedCallbacks: Record<string, () => void> = {}
      vi.mocked(createSocketClient).mockImplementation((opts) => {
        capturedCallbacks = {
          onOpen: opts.onOpen!,
          onClose: opts.onClose!,
          onError: opts.onError!,
        }
        return mockSocketClient
      })

      const ws = useWebsocket()
      await ws.connect()

      capturedCallbacks.onOpen!()

      expect(ws.status.value).toBe('connected')
      expect(ws.statusNote.value).toBe('Identifying...')
      expect(mockSocketClient.send).toHaveBeenCalledWith({
        op: 'Identify',
        d: { token: 'test-token' },
      })
    })

    it('does not send identify when token is missing', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue(null)

      let capturedCallbacks: Record<string, () => void> = {}
      vi.mocked(createSocketClient).mockImplementation((opts) => {
        capturedCallbacks = {
          onOpen: opts.onOpen!,
          onClose: opts.onClose!,
          onError: opts.onError!,
        }
        return mockSocketClient
      })

      const ws = useWebsocket()
      await ws.connect()

      capturedCallbacks.onOpen!()

      expect(mockSocketClient.send).not.toHaveBeenCalled()
    })

    it('handles onClose by setting disconnected status', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')

      let capturedCallbacks: Record<string, () => void> = {}
      vi.mocked(createSocketClient).mockImplementation((opts) => {
        capturedCallbacks = {
          onOpen: opts.onOpen!,
          onClose: opts.onClose!,
          onError: opts.onError!,
        }
        return mockSocketClient
      })

      const ws = useWebsocket()
      await ws.connect()

      capturedCallbacks.onClose!()

      expect(ws.status.value).toBe('disconnected')
      expect(ws.statusNote.value).toBe('Socket closed')
    })

    it('handles onError by setting error status', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')

      let capturedCallbacks: Record<string, () => void> = {}
      vi.mocked(createSocketClient).mockImplementation((opts) => {
        capturedCallbacks = {
          onOpen: opts.onOpen!,
          onClose: opts.onClose!,
          onError: opts.onError!,
        }
        return mockSocketClient
      })

      const ws = useWebsocket()
      await ws.connect()

      capturedCallbacks.onError!()

      expect(ws.status.value).toBe('error')
      expect(ws.statusNote.value).toBe('Socket error')
    })

    it('handles Hello payload with heartbeat interval', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')

      let onMessage: ((payload: unknown) => void) | undefined
      vi.mocked(createSocketClient).mockImplementation((opts) => {
        onMessage = opts.onMessage
        return mockSocketClient
      })

      const ws = useWebsocket()
      await ws.connect()

      onMessage!({ op: 'Hello', d: { heartbeat_interval_ms: 45000 } })

      expect(ws.statusNote.value).toBe('Heartbeat 45000ms')
      expect(ws.gatewayLog.value[0]).toBe('< Hello')
    })

    it('handles Dispatch payload and calls registered handlers', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')

      let onMessage: ((payload: unknown) => void) | undefined
      vi.mocked(createSocketClient).mockImplementation((opts) => {
        onMessage = opts.onMessage
        return mockSocketClient
      })

      const ws = useWebsocket()
      const handler = vi.fn()
      ws.onDispatch(handler)

      await ws.connect()

      const dispatchPayload: DispatchPayload = {
        t: 'READY',
        d: {
          connection_id: 'connection_id',
          user_id: 'u1',
          username: 'testuser',
          is_developer: false,
          heartbeat_interval_ms: 25000,
          servers: [],
        },
      }
      onMessage!({ op: 'Dispatch', d: dispatchPayload })

      expect(handler).toHaveBeenCalledWith(dispatchPayload)
      expect(ws.gatewayLog.value[0]).toBe('< Dispatch')
    })
  })

  describe('ws url', () => {
    it('uses protocol and host when gateway override is not set', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')

      let capturedUrl: (() => string) | undefined
      vi.mocked(createSocketClient).mockImplementation((opts) => {
        capturedUrl = opts.url
        return mockSocketClient
      })

      const ws = useWebsocket()
      await ws.connect()

      expect(capturedUrl?.()).toMatch(/wss?:\/\/.*\/ws/)
    })
  })

  describe('send', () => {
    it('does nothing when socket is not open', () => {
      mockSocketClient.isOpen.mockReturnValue(false)

      const ws = useWebsocket()
      ws.send({ op: 'Subscribe', d: { channel_id: 'general' } })

      expect(mockSocketClient.send).not.toHaveBeenCalled()
    })

    it('sends payload and logs when socket is open', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')
      mockSocketClient.isOpen.mockReturnValue(true)

      const ws = useWebsocket()
      await ws.connect()

      ws.send({ op: 'Subscribe', d: { channel_id: 'general' } })

      expect(mockSocketClient.send).toHaveBeenCalledWith({
        op: 'Subscribe',
        d: { channel_id: 'general' },
      })
      expect(ws.gatewayLog.value).toContain('> Subscribe')
    })
  })

  describe('disconnect', () => {
    it('disconnects socket and resets state', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')

      const ws = useWebsocket()
      await ws.connect()

      ws.disconnect()

      expect(mockSocketClient.disconnect).toHaveBeenCalled()
      expect(ws.status.value).toBe('disconnected')
      expect(ws.statusNote.value).toBe('Disconnected')
      expect(ws.gatewayLog.value).toContain('< DISCONNECT')
    })
  })

  describe('lifecycle', () => {
    it('disconnects socket on unmount when used in a component', async () => {
      isAuthenticated.value = true
      getAccessTokenSilently.mockResolvedValue('test-token')

      const TestComponent = {
        template: '<div />',
        setup() {
          const ws = useWebsocket()
          void ws.connect()
          return {}
        },
      }

      const { unmount } = render(TestComponent)

      await nextTick()
      unmount()

      expect(mockSocketClient.disconnect).toHaveBeenCalled()
    })
  })
})

import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { createSocketClient } from '../client'

const getAccessTokenSilently = vi.fn()
const isAuthenticated = ref(true)

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

vi.mock('../../config/env.ts', () => ({
  gatewayWsUrl: 'wss://gateway.example/ws',
  auth0Audience: '',
}))

describe('useWebsocket env override', () => {
  it('uses gateway url when configured', async () => {
    getAccessTokenSilently.mockResolvedValue('test-token')

    const { useWebsocket } = await import('../useWebsocket')
    const ws = useWebsocket()

    await ws.connect()

    const urlFn = vi.mocked(createSocketClient).mock.calls[0]?.[0]?.url
    expect(urlFn?.()).toBe('wss://gateway.example/ws')
  })
})

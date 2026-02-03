import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useAuthStore } from '@/store/auth.store.ts'
import { useMessageStore } from '@/store/message.store.ts'
import type { DispatchPayload } from '@/types/gateway/incoming/DispatchPayload.ts'

import { useChat } from '../useChat'

const mockWebsocket = {
  status: ref('disconnected' as string),
  statusNote: ref('Idle'),
  statusLabel: ref('Disconnected'),
  gatewayLog: ref<string[]>([]),
  connect: vi.fn(),
  disconnect: vi.fn(),
  send: vi.fn(),
  onDispatch: vi.fn(),
}

vi.mock('@/ws/useWebsocket', () => ({
  useWebsocket: () => mockWebsocket,
}))

vi.mock('@/api/message.api', () => ({
  useInfiniteChannelMessages: () => ({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null),
    fetchNextPage: vi.fn(),
    hasNextPage: ref(false),
    isFetchingNextPage: ref(false),
  }),
}))

vi.mock('@/api/server.api', () => ({
  useCreateServer: () => ({
    mutate: vi.fn(),
  }),
  useCreateChannel: () => ({
    mutate: vi.fn(),
  }),
  useDeleteServer: () => ({
    mutate: vi.fn(),
  }),
}))

vi.mock('@/api/channel.api', () => ({
  useDeleteChannel: () => ({
    mutate: vi.fn(),
  }),
}))

const mockReadyEvent = {
  t: 'READY' as const,
  d: {
    connection_id: 'connection_id',
    user_id: 'user-123',
    username: 'testuser',
    is_developer: true,
    heartbeat_interval_ms: 25000,
    servers: [
      {
        id: 'server-1',
        name: 'Server 1',
        owner_user_id: 'owner-1',
        channels: [
          { id: 'general', name: 'general', server_id: 'server-1' },
          { id: 'random', name: 'random', server_id: 'server-1' },
        ],
      },
    ],
  },
}

const dispatchReady = () => {
  const handler = mockWebsocket.onDispatch.mock.calls[0]![0] as (e: typeof mockReadyEvent) => void
  handler(mockReadyEvent)
}

describe('useChat', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockWebsocket.status.value = 'disconnected'
    mockWebsocket.statusNote.value = 'Idle'
    mockWebsocket.gatewayLog.value = []
  })

  describe('initial state', () => {
    it('returns initial chat state', () => {
      const chat = useChat()

      expect(chat.activeChannelId.value).toBe('')
      expect(chat.composer.value).toBe('')
      expect(chat.servers.value).toHaveLength(0)
      expect(chat.channels.value).toHaveLength(0)
    })

    it('hydrates servers and channels from READY', () => {
      const chat = useChat()
      dispatchReady()

      expect(chat.servers.value).toHaveLength(1)
      expect(chat.activeServerId.value).toBe('server-1')
      expect(chat.channels.value).toHaveLength(2)
      expect(chat.activeChannelId.value).toBe('general')
      expect(chat.channels.value[0]).toEqual({ id: 'general', name: 'general', serverId: 'server-1' })
    })

    it('exposes websocket status', () => {
      const chat = useChat()

      expect(chat.status).toBe(mockWebsocket.status)
      expect(chat.statusNote).toBe(mockWebsocket.statusNote)
      expect(chat.statusLabel).toBe(mockWebsocket.statusLabel)
      expect(chat.gatewayLog).toBe(mockWebsocket.gatewayLog)
    })

    it('registers dispatch handler on creation', () => {
      useChat()
      expect(mockWebsocket.onDispatch).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('connect', () => {
    it('calls websocket connect', async () => {
      const chat = useChat()
      await chat.connect()

      expect(mockWebsocket.connect).toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('disconnects and clears messages', () => {
      const chat = useChat()
      const messageStore = useMessageStore()
      messageStore.addMessage('general', {
        id: 'm1',
        authorUserId: 'u1',
        authorUsername: 'user1',
        content: 'test',
        createdAt: '10:00 AM',
        channelId: 'general',
      })

      chat.disconnect()

      expect(mockWebsocket.disconnect).toHaveBeenCalled()
      expect(messageStore.getMessages('general').value).toEqual([])
    })
  })

  describe('sendMessage', () => {
    it('does nothing when composer is empty', () => {
      const chat = useChat()
      chat.composer.value = '   '

      chat.sendMessage()

      expect(mockWebsocket.send).not.toHaveBeenCalled()
    })

    it('sets status note when not ready', () => {
      mockWebsocket.status.value = 'connected'
      const chat = useChat()
      chat.composer.value = 'Hello'

      chat.sendMessage()

      expect(mockWebsocket.statusNote.value).toBe('Not ready: login/identify first')
      expect(mockWebsocket.send).not.toHaveBeenCalled()
    })

    it('sends message and clears composer when ready', () => {
      mockWebsocket.status.value = 'ready'
      const chat = useChat()
      dispatchReady()
      chat.composer.value = 'Hello world'

      chat.sendMessage()

      expect(mockWebsocket.send).toHaveBeenCalledWith({
        op: 'MessageCreate',
        d: { channel_id: 'general', content: 'Hello world' },
      })
      expect(chat.composer.value).toBe('')
    })
  })

  describe('switchChannel', () => {
    it('updates active channel', () => {
      const chat = useChat()
      dispatchReady()

      chat.switchChannel('random')

      expect(chat.activeChannelId.value).toBe('random')
    })

    it('sends subscribe when status is ready', async () => {
      mockWebsocket.status.value = 'ready'
      const chat = useChat()
      dispatchReady()
      mockWebsocket.send.mockClear()

      chat.switchChannel('random')
      await vi.waitFor(() => {
        expect(mockWebsocket.send).toHaveBeenCalledWith({
          op: 'Subscribe',
          d: { channel_id: 'random' },
        })
      })
    })

    it('does not send subscribe when not ready', async () => {
      mockWebsocket.status.value = 'connected'
      const chat = useChat()

      chat.switchChannel('random')

      await Promise.resolve()
      expect(mockWebsocket.send).not.toHaveBeenCalled()
    })
  })

  describe('dispatch handling', () => {
    it('handles READY event', () => {
      const chat = useChat()
      const authStore = useAuthStore()
      dispatchReady()

      expect(authStore.currentUser).toEqual({
        id: 'user-123',
        username: 'testuser',
        isDeveloper: true,
      })
      expect(chat.servers.value).toHaveLength(1)
      expect(chat.servers.value[0]!.channels).toHaveLength(2)
      expect(mockWebsocket.statusNote.value).toBe('User testuser')
      expect(mockWebsocket.status.value).toBe('ready')
      expect(mockWebsocket.send).toHaveBeenCalledWith({
        op: 'Subscribe',
        d: { channel_id: 'general' },
      })
    })

    it('handles MESSAGE_CREATE event', () => {
      useChat()
      const messageStore = useMessageStore()
      const handler = mockWebsocket.onDispatch.mock.calls[0]![0] as (e: DispatchPayload) => void

      const timestamp = new Date('2024-01-15T10:30:00Z').toISOString()
      handler({
        t: 'MESSAGE_CREATE',
        d: {
          id: 'msg-1',
          author_user_id: 'u1',
          author_username: 'sender',
          content: 'Hello!',
          timestamp,
          channel_id: 'general',
        },
      })

      const messages = messageStore.getMessages('general').value
      expect(messages).toHaveLength(1)
      expect(messages[0]).toMatchObject({
        id: 'msg-1',
        authorUserId: 'u1',
        authorUsername: 'sender',
        content: 'Hello!',
        channelId: 'general',
      })
    })

    it('handles ERROR event', () => {
      useChat()
      const handler = mockWebsocket.onDispatch.mock.calls[0]![0] as (e: DispatchPayload) => void

      handler({
        t: 'ERROR',
        d: { code: '69420' },
      })

      expect(mockWebsocket.status.value).toBe('error')
      expect(mockWebsocket.statusNote.value).toBe('Gateway error: 69420')
    })
  })

  describe('filteredMessages', () => {
    it('returns messages for active channel', () => {
      const chat = useChat()
      const messageStore = useMessageStore()
      dispatchReady()

      messageStore.addMessage('general', {
        id: 'm1',
        authorUserId: 'u1',
        authorUsername: 'user1',
        content: 'General message',
        createdAt: '10:00 AM',
        channelId: 'general',
      })
      messageStore.addMessage('random', {
        id: 'm2',
        authorUserId: 'u2',
        authorUsername: 'user2',
        content: 'Random message',
        createdAt: '10:01 AM',
        channelId: 'random',
      })

      expect(chat.filteredMessages.value).toHaveLength(1)
      expect(chat.filteredMessages.value[0]!.content).toBe('General message')

      chat.switchChannel('random')
      expect(chat.filteredMessages.value).toHaveLength(1)
      expect(chat.filteredMessages.value[0]!.content).toBe('Random message')
    })
  })
})

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { useMessageStore } from '@/store/message.store'
import type { ClientStatus } from '@/types/ClientStatus.ts'
import type { Message } from '@/types/Message.ts'
import type { WebsocketContext } from '@/ws/useWebsocket'

import { useMessages } from '../useMessages'

const historyData = ref<Message[] | null>(null)
const fetchNextPage = vi.fn()
const hasNextPage = ref(false)
const isFetchingNextPage = ref(false)

vi.mock('@/api/message.api', () => ({
  useInfiniteChannelMessages: () => ({
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }),
}))

describe('useMessages', () => {
  const createWebsocket = (statusValue: ClientStatus = 'disconnected'): WebsocketContext => ({
    status: ref<ClientStatus>(statusValue),
    statusNote: ref(''),
    statusLabel: ref(''),
    gatewayLog: ref([]),
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    onDispatch: vi.fn(),
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    historyData.value = null
    hasNextPage.value = false
    isFetchingNextPage.value = false
  })

  it('sets messages from history data', async () => {
    const activeChannelId = ref('general')
    const websocket = createWebsocket()
    const messages = useMessages({ activeChannelId, websocket })

    historyData.value = [
      {
        id: 'msg-1',
        authorUserId: 'u1',
        authorUsername: 'user1',
        content: 'Hello',
        createdAt: '10:00',
        channelId: 'general',
      },
    ]

    await nextTick()

    const store = useMessageStore()
    expect(store.getMessages('general').value).toHaveLength(1)
    expect(messages.filteredMessages.value).toHaveLength(1)
  })

  it('loads older messages only when allowed', () => {
    const activeChannelId = ref('general')
    const websocket = createWebsocket()
    const messages = useMessages({ activeChannelId, websocket })

    hasNextPage.value = true
    isFetchingNextPage.value = false

    messages.loadOlderMessages()
    expect(fetchNextPage).toHaveBeenCalled()

    fetchNextPage.mockClear()
    isFetchingNextPage.value = true

    messages.loadOlderMessages()
    expect(fetchNextPage).not.toHaveBeenCalled()
  })

  it('subscribes only when ready and active channel exists', () => {
    const activeChannelId = ref('')
    const websocket = createWebsocket('connected')
    const messages = useMessages({ activeChannelId, websocket })

    messages.subscribeActiveChannel()
    expect(websocket.send).not.toHaveBeenCalled()

    websocket.status.value = 'ready'
    messages.subscribeActiveChannel()
    expect(websocket.send).not.toHaveBeenCalled()

    activeChannelId.value = 'general'
    messages.subscribeActiveChannel()
    expect(websocket.send).toHaveBeenCalledWith({
      op: 'Subscribe',
      d: { channel_id: 'general' },
    })
  })

  it('handles MESSAGE_CREATE and ignores duplicates', () => {
    const activeChannelId = ref('general')
    const websocket = createWebsocket('ready')
    const messages = useMessages({ activeChannelId, websocket })

    messages.handleMessageCreate({
      id: 'msg-1',
      author_user_id: 'u1',
      author_username: 'user1',
      content: 'Hello',
      timestamp: new Date().toISOString(),
      channel_id: 'general',
    })
    messages.handleMessageCreate({
      id: 'msg-1',
      author_user_id: 'u1',
      author_username: 'user1',
      content: 'Hello',
      timestamp: new Date().toISOString(),
      channel_id: 'general',
    })

    const store = useMessageStore()
    expect(store.getMessages('general').value).toHaveLength(1)
  })

  it('subscribes when active channel changes while ready', async () => {
    const activeChannelId = ref('general')
    const websocket = createWebsocket('ready')
    useMessages({ activeChannelId, websocket })

    activeChannelId.value = 'random'
    await nextTick()

    expect(websocket.send).toHaveBeenCalledWith({
      op: 'Subscribe',
      d: { channel_id: 'random' },
    })
  })
})

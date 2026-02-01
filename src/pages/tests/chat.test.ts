import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import Chat from '../Chat.vue'

const mockConnect = vi.fn()
const mockDisconnect = vi.fn()
const mockSendMessage = vi.fn()
const mockSwitchChannel = vi.fn()

vi.mock('@/composables/useChat', () => ({
  useChat: () => ({
    status: ref('disconnected'),
    statusNote: ref('Idle'),
    statusLabel: ref('Disconnected'),
    gatewayLog: ref<string[]>([]),
    activeServerId: ref('server-1'),
    activeChannelId: ref('general'),
    activeChannelName: ref('general'),
    composer: ref(''),
    servers: ref([
      { id: 'server-1', name: 'My Server', ownerUserId: 'user-1' },
    ]),
    channels: ref([
      { id: 'general', name: 'general', serverId: 'server-1' },
      { id: 'random', name: 'random', serverId: 'server-1' },
    ]),
    filteredMessages: ref([]),
    connect: mockConnect,
    disconnect: mockDisconnect,
    sendMessage: mockSendMessage,
    switchChannel: mockSwitchChannel,
  }),
}))

describe('Chat', () => {
  const stubs = {
    AppSideBar: {
      template: '<div data-testid="app-sidebar" />',
      props: ['activeServerId', 'activeChannelId', 'servers', 'channels'],
    },
    ChatHeader: {
      template: '<div data-testid="chat-header" />',
      props: ['activeChannelName', 'gatewayLog', 'status', 'statusLabel', 'statusNote'],
    },
    MessageList: {
      template: '<div data-testid="message-list" />',
      props: ['messages'],
    },
    MessageComposer: {
      template: '<div data-testid="message-composer" />',
      props: ['modelValue', 'activeChannelName'],
    },
  }

  it('renders all child components', () => {
    const { getByTestId } = render(Chat, { global: { stubs } })

    expect(getByTestId('app-sidebar')).toBeInTheDocument()
    expect(getByTestId('chat-header')).toBeInTheDocument()
    expect(getByTestId('message-list')).toBeInTheDocument()
    expect(getByTestId('message-composer')).toBeInTheDocument()
  })

  it('calls connect on mount', () => {
    mockConnect.mockClear()
    render(Chat, { global: { stubs } })

    expect(mockConnect).toHaveBeenCalled()
  })
})

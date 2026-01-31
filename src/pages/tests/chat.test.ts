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
    activeChannelId: ref('general'),
    composer: ref(''),
    channels: ref([
      { id: 'general', name: 'general', type: 'text' },
      { id: 'random', name: 'random', type: 'text' },
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
    ChannelList: {
      template: '<div data-testid="channel-list" />',
      props: ['activeChannelId', 'channels'],
    },
    ChatHeader: {
      template: '<div data-testid="chat-header" />',
      props: ['activeChannelId', 'gatewayLog', 'status', 'statusLabel', 'statusNote'],
    },
    MessageList: {
      template: '<div data-testid="message-list" />',
      props: ['messages'],
    },
    MessageComposer: {
      template: '<div data-testid="message-composer" />',
      props: ['modelValue', 'activeChannelId'],
    },
  }

  it('renders all child components', () => {
    const { getByTestId } = render(Chat, { global: { stubs } })

    expect(getByTestId('channel-list')).toBeInTheDocument()
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

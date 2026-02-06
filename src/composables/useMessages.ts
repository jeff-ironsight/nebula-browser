import type { Ref } from 'vue'
import { computed, watch } from 'vue'

import { useInfiniteChannelMessages } from '@/api/message.api'
import { useMessageStore } from '@/store/message.store'
import type { MessageCreatedEvent } from '@/types/gateway/incoming/MessageCreatedEvent.ts'
import { mapMessageFromEvent } from '@/types/Message.ts'
import type { WebsocketContext } from '@/ws/useWebsocket'

interface UseMessagesOptions {
  activeChannelId: Ref<string>
  websocket: WebsocketContext
}

export const useMessages = ({ activeChannelId, websocket }: UseMessagesOptions) => {
  const messageStore = useMessageStore()

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteChannelMessages(activeChannelId)

  watch(historyData, (messages) => {
    if (messages && activeChannelId.value) {
      messageStore.setMessages(activeChannelId.value, messages)
    }
  })

  const filteredMessages = computed(() =>
    messageStore.getMessages(activeChannelId.value).value
  )

  const loadOlderMessages = () => {
    if (hasNextPage.value && !isFetchingNextPage.value) {
      void fetchNextPage()
    }
  }

  const hasMoreMessages = hasNextPage
  const isLoadingMoreMessages = computed(() => isFetchingNextPage.value)

  const sendSubscribe = (channelId: string) => {
    websocket.send({ op: 'Subscribe', d: { channel_id: channelId } })
  }

  const subscribeActiveChannel = () => {
    if (websocket.status.value !== 'ready') {
      return
    }
    if (!activeChannelId.value) {
      return
    }
    sendSubscribe(activeChannelId.value)
  }

  const handleMessageCreate = (data: MessageCreatedEvent) => {
    const existing = messageStore.getMessages(data.channel_id).value
    if (existing.some((m) => m.id === data.id)) {
      return
    }
    messageStore.addMessage(data.channel_id, mapMessageFromEvent(data))
  }

  watch(activeChannelId, (channelId) => {
    messageStore.setActiveChannel(channelId)
    if (websocket.status.value === 'ready') {
      sendSubscribe(channelId)
    }
  })

  return {
    filteredMessages,
    hasMoreMessages,
    isLoadingMoreMessages,
    loadOlderMessages,
    handleMessageCreate,
    subscribeActiveChannel,
  }
}

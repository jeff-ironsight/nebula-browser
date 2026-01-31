import { computed, ref, watch } from 'vue'

import { useAuthStore } from '@/store/auth.store'
import { useMessageStore } from '@/store/message.store'
import type { Channel } from '@/types/Channel'
import type { DispatchEvent } from '@/types/ws/DispatchEvent'
import { useWebsocket } from '@/ws/useWebsocket'

export const useChat = () => {
  const websocket = useWebsocket()
  const authStore = useAuthStore()
  const messageStore = useMessageStore()

  const activeChannelId = ref('general')
  const composer = ref('')

  const channels = ref<Channel[]>([
    { id: 'general', name: 'general', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
  ])

  const filteredMessages = computed(() =>
    messageStore.getMessages(activeChannelId.value).value
  )

  const sendSubscribe = (channelId: string) => {
    websocket.send({ op: 'Subscribe', d: { channel_id: channelId } })
  }

  const handleDispatch = (event: DispatchEvent) => {
    if (event.t === 'READY') {
      authStore.setCurrentUser({
        id: event.d.user_id,
        username: event.d.username,
        isDeveloper: event.d.is_developer,
      })
      websocket.statusNote.value = `User ${event.d.username}`
      websocket.status.value = 'ready'
      sendSubscribe(activeChannelId.value)
      return
    }

    if (event.t === 'MESSAGE_CREATE') {
      messageStore.addMessage(event.d.channel_id, {
        id: event.d.id,
        author: `User ${event.d.author_user_id.slice(0, 6)}`,
        content: event.d.content,
        time: new Date(event.d.timestamp).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        channelId: event.d.channel_id,
      })
      return
    }

    websocket.status.value = 'error'
    websocket.statusNote.value = `Gateway error: ${event.d.code}`
  }

  websocket.onDispatch(handleDispatch)

  const connect = async () => {
    await websocket.connect()
  }

  const disconnect = () => {
    websocket.disconnect()
    messageStore.clearAll()
  }

  const sendMessage = () => {
    const content = composer.value.trim()
    if (!content) {
      return
    }
    if (websocket.status.value !== 'ready') {
      websocket.statusNote.value = 'Not ready: login/identify first'
      return
    }
    websocket.send({
      op: 'MessageCreate',
      d: { channel_id: activeChannelId.value, content },
    })
    composer.value = ''
  }

  const switchChannel = (channelId: string) => {
    activeChannelId.value = channelId
  }

  watch(activeChannelId, (channelId) => {
    if (websocket.status.value === 'ready') {
      sendSubscribe(channelId)
    }
  })

  return {
    // Connection state (from websocket)
    status: websocket.status,
    statusNote: websocket.statusNote,
    statusLabel: websocket.statusLabel,
    gatewayLog: websocket.gatewayLog,

    // Chat state
    activeChannelId,
    composer,
    channels,
    filteredMessages,

    // Actions
    connect,
    disconnect,
    sendMessage,
    switchChannel,
  }
}

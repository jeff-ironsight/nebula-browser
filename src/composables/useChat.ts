import { computed, ref, watch } from 'vue'

import { useAuthStore } from '@/store/auth.store'
import { useMessageStore } from '@/store/message.store'
import { mapCurrentUserFromJson } from '@/types/CurrentUserContext.ts'
import type { DispatchPayload } from '@/types/gateway/incoming/DispatchPayload.ts'
import { mapMessageFromJson } from '@/types/Message.ts'
import type { Server } from '@/types/Server.ts'
import { mapServerFromJson } from '@/types/Server.ts'
import { useWebsocket } from '@/ws/useWebsocket'

export const useChat = () => {
  const websocket = useWebsocket()
  const authStore = useAuthStore()
  const messageStore = useMessageStore()
  const composer = ref('')

  const servers = ref<Server[]>([])
  const activeServerId = ref('')

  const activeChannelId = ref('')
  const channels = computed(() =>
    servers.value.find((s) => s.id === activeServerId.value)?.channels ?? []
  )
  const activeChannel = computed(() =>
    channels.value.find((c) => c.id === activeChannelId.value)
  )
  const activeChannelName = computed(() =>
    activeChannel.value ? activeChannel.value.name : ''
  )

  const filteredMessages = computed(() =>
    messageStore.getMessages(activeChannelId.value).value
  )

  const sendSubscribe = (channelId: string) => {
    websocket.send({ op: 'Subscribe', d: { channel_id: channelId } })
  }

  const handleDispatch = (event: DispatchPayload) => {
    switch (event.t) {
      case 'READY': {
        const data = event.d
        authStore.setCurrentUser(mapCurrentUserFromJson(data))
        servers.value = data.servers.map(mapServerFromJson)

        // Set defaults if not already set
        if (!activeServerId.value && servers.value.length > 0) {
          activeServerId.value = servers.value[0]!.id
        }
        const currentChannels = servers.value.find((s) => s.id === activeServerId.value)?.channels ?? []
        if (!activeChannelId.value && currentChannels.length > 0) {
          activeChannelId.value = currentChannels[0]!.id
        }

        websocket.statusNote.value = `User ${data.username}`
        websocket.status.value = 'ready'
        if (activeChannelId.value) {
          sendSubscribe(activeChannelId.value)
        }
        break
      }
      case 'MESSAGE_CREATE': {
        const data = event.d
        messageStore.addMessage(data.channel_id, mapMessageFromJson(data))
        break
      }
      case 'ERROR': {
        const data = event.d
        websocket.status.value = 'error'
        websocket.statusNote.value = `Gateway error: ${data.code}`
        break
      }
    }
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

  const switchServer = (serverId: string) => {
    activeServerId.value = serverId
  }

  const switchChannel = (channelId: string) => {
    activeChannelId.value = channelId
  }

  watch(activeChannelId, (channelId) => {
    messageStore.setActiveChannel(channelId)
    if (websocket.status.value === 'ready') {
      sendSubscribe(channelId)
    }
  })

  watch(
    servers,
    (next) => {
      if (!activeServerId.value && next.length > 0) {
        activeServerId.value = next[0]!.id
      }
    },
    { immediate: true }
  )

  watch(
    channels,
    (next) => {
      if (!activeChannelId.value && next.length > 0) {
        activeChannelId.value = next[0]!.id
      }
    },
    { immediate: true }
  )

  return {
    // Connection state (from websocket)
    status: websocket.status,
    statusNote: websocket.statusNote,
    statusLabel: websocket.statusLabel,
    gatewayLog: websocket.gatewayLog,

    // Chat state
    activeChannel,
    activeServerId,
    activeChannelId,
    activeChannelName,
    composer,
    servers,
    channels,
    filteredMessages,
    getUnreadCount: messageStore.getUnreadCount,

    // Actions
    connect,
    disconnect,
    sendMessage,
    switchServer,
    switchChannel,
  }
}

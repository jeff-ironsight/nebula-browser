import { computed, ref, watch } from 'vue'

import { useGetServerChannels, useGetServers } from '@/api/server.api.ts'
import { useAuthStore } from '@/store/auth.store'
import { useMessageStore } from '@/store/message.store'
import type { DispatchPayload } from '@/types/ws/incoming/DispatchPayload.ts'
import { useWebsocket } from '@/ws/useWebsocket'

export const useChat = () => {
  const websocket = useWebsocket()
  const authStore = useAuthStore()
  const messageStore = useMessageStore()
  const composer = ref('')

  const activeServerId = ref('')
  const { data: serversQuery } = useGetServers()
  const servers = computed(() => serversQuery.value ?? [])

  const activeChannelId = ref('')
  const { data: channelsQuery } = useGetServerChannels(activeServerId)
  const channels = computed(() => channelsQuery.value ?? [])
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
    if (event.t === 'READY') {
      authStore.setCurrentUser({
        id: event.d.user_id,
        username: event.d.username,
        isDeveloper: event.d.is_developer,
      })
      websocket.statusNote.value = `User ${event.d.username}`
      websocket.status.value = 'ready'
      if (activeChannelId.value) {
        sendSubscribe(activeChannelId.value)
      }
      return
    }

    if (event.t === 'MESSAGE_CREATE') {
      messageStore.addMessage(event.d.channel_id, {
        id: event.d.id,
        authorUserId: event.d.author_user_id,
        authorUsername: event.d.author_username,
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

  const switchServer = (serverId: string) => {
    activeServerId.value = serverId
  }

  const switchChannel = (channelId: string) => {
    activeChannelId.value = channelId
  }

  watch(activeChannelId, (channelId) => {
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

    // Actions
    connect,
    disconnect,
    sendMessage,
    switchServer,
    switchChannel,
  }
}

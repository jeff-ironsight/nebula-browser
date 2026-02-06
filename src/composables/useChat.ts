import { ref } from 'vue'

import { useAuthStore } from '@/store/auth.store'
import { useMessageStore } from '@/store/message.store'
import { mapCurrentUserFromJson } from '@/types/CurrentUserContext.ts'
import type { DispatchPayload } from '@/types/gateway/incoming/DispatchPayload.ts'
import { useWebsocket } from '@/ws/useWebsocket'

import { useMessages } from './useMessages'
import { useServers } from './useServers'


export const useChat = () => {
  const websocket = useWebsocket()
  const authStore = useAuthStore()
  const messageStore = useMessageStore()
  const composer = ref('')

  const serversState = useServers()
  const messagesState = useMessages({
    activeChannelId: serversState.activeChannelId,
    websocket,
  })

  const handleDispatch = (event: DispatchPayload) => {
    switch (event.t) {
      case 'READY': {
        const data = event.d
        authStore.setCurrentUser(mapCurrentUserFromJson(data))
        serversState.hydrateFromReady(data)

        websocket.statusNote.value = `User ${data.username}`
        websocket.status.value = 'ready'
        messagesState.subscribeActiveChannel()
        break
      }
      case 'MESSAGE_CREATE': {
        messagesState.handleMessageCreate(event.d)
        break
      }
      case 'MEMBER_JOIN': {
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
      d: { channel_id: serversState.activeChannelId.value, content },
    })
    composer.value = ''
  }

  return {
    // Connection state (from websocket)
    status: websocket.status,
    statusNote: websocket.statusNote,
    statusLabel: websocket.statusLabel,
    gatewayLog: websocket.gatewayLog,

    // Chat state
    activeChannel: serversState.activeChannel,
    activeServerId: serversState.activeServerId,
    activeServerRole: serversState.activeServerRole,
    activeChannelId: serversState.activeChannelId,
    activeChannelName: serversState.activeChannelName,
    composer,
    servers: serversState.servers,
    channels: serversState.channels,
    filteredMessages: messagesState.filteredMessages,
    hasMoreMessages: messagesState.hasMoreMessages,
    isLoadingMoreMessages: messagesState.isLoadingMoreMessages,
    getUnreadCount: messageStore.getUnreadCount,

    // Actions
    connect,
    disconnect,
    sendMessage,
    switchServer: serversState.switchServer,
    switchChannel: serversState.switchChannel,
    createServer: serversState.createServer,
    createChannel: serversState.createChannel,
    deleteServer: serversState.deleteServer,
    deleteChannel: serversState.deleteChannel,
    loadOlderMessages: messagesState.loadOlderMessages,
  }
}

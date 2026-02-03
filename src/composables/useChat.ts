import { computed, ref, watch } from 'vue'

import { useDeleteChannel } from '@/api/channel.api'
import { useInfiniteChannelMessages } from '@/api/message.api'
import { useCreateChannel, useCreateServer, useDeleteServer } from '@/api/server.api'
import { useAuthStore } from '@/store/auth.store'
import { useMessageStore } from '@/store/message.store'
import { mapCurrentUserFromJson } from '@/types/CurrentUserContext.ts'
import type { DispatchPayload } from '@/types/gateway/incoming/DispatchPayload.ts'
import { mapMessageFromEvent } from '@/types/Message.ts'
import type { Server } from '@/types/Server.ts'
import { mapServerFromJson } from '@/types/Server.ts'
import type { ServerRole } from '@/types/ServerRole.ts'
import { useWebsocket } from '@/ws/useWebsocket'


export const useChat = () => {
  const websocket = useWebsocket()
  const authStore = useAuthStore()
  const messageStore = useMessageStore()
  const composer = ref('')

  const servers = ref<Server[]>([])
  const activeServerId = ref('')
  const activeServerRole = computed<ServerRole>(() => {
    const server = servers.value.find((s) => s.id === activeServerId.value)
    return server?.myRole ?? 'member'
  })

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

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteChannelMessages(activeChannelId)
  const { mutate: createServerMutation } = useCreateServer()
  const { mutate: createChannelMutation } = useCreateChannel(activeServerId)
  const { mutate: deleteServerMutation } = useDeleteServer()
  const { mutate: deleteChannelMutation } = useDeleteChannel()

  watch(historyData, (messages) => {
    if (messages && activeChannelId.value) {
      // Messages are already in chronological order from the select transform
      messageStore.setMessages(activeChannelId.value, messages)
    }
  })

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
        // Skip if we already have this message (from history fetch)
        const existing = messageStore.getMessages(data.channel_id).value
        if (existing.some((m) => m.id === data.id)) {
          break
        }
        messageStore.addMessage(data.channel_id, mapMessageFromEvent(data))
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
      d: { channel_id: activeChannelId.value, content },
    })
    composer.value = ''
  }

  const switchServer = (serverId: string) => {
    activeServerId.value = serverId
    activeChannelId.value = channels.value[0]?.id || ''
  }

  const switchChannel = (channelId: string) => {
    activeChannelId.value = channelId
  }

  const createServer = (name: string) => {
    createServerMutation(
      { name },
      {
        onSuccess: (newServer) => {
          servers.value = [...servers.value, newServer]
        },
      }
    )
  }

  const createChannel = (name: string) => {
    createChannelMutation(
      { name },
      {
        onSuccess: (newChannel) => {
          servers.value = servers.value.map((s) =>
            s.id === activeServerId.value
              ? { ...s, channels: [...s.channels, newChannel] }
              : s
          )
        },
      }
    )
  }

  const deleteServer = (serverId: string) => {
    deleteServerMutation(serverId, {
      onSuccess: () => {
        servers.value = servers.value.filter((s) => s.id !== serverId)
        // Switch to another server if we deleted the active one
        if (activeServerId.value === serverId) {
          activeServerId.value = servers.value[0]?.id ?? ''
        }
      },
    })
  }

  const deleteChannel = (channelId: string) => {
    // Find which server this channel belongs to
    const server = servers.value.find((s) =>
      s.channels.some((c) => c.id === channelId)
    )
    if (!server) {
      return
    }

    deleteChannelMutation(
      { channelId, serverId: server.id },
      {
        onSuccess: () => {
          servers.value = servers.value.map((s) =>
            s.id === server.id
              ? { ...s, channels: s.channels.filter((c) => c.id !== channelId) }
              : s
          )
          // Switch to another channel if we deleted the active one
          if (activeChannelId.value === channelId) {
            activeChannelId.value = channels.value[0]?.id ?? ''
          }
        },
      }
    )
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
    activeServerRole,
    activeChannelId,
    activeChannelName,
    composer,
    servers,
    channels,
    filteredMessages,
    hasMoreMessages,
    isLoadingMoreMessages,
    getUnreadCount: messageStore.getUnreadCount,

    // Actions
    connect,
    disconnect,
    sendMessage,
    switchServer,
    switchChannel,
    createServer,
    createChannel,
    deleteServer,
    deleteChannel,
    loadOlderMessages,
  }
}

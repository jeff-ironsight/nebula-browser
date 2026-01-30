import { useAuth0 } from '@auth0/auth0-vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { gatewayWsUrl } from '../config/env'
import type { Channel } from '../types/Channel'
import type { ClientStatus } from '../types/ClientStatus'
import type { Message } from '../types/Message'
import type { WsGatewayPayload } from '../types/ws/WsGatewayPayload'
import { createSocketClient } from '../ws/client'

const toLogString = (value: unknown, fallback = ''): string => {
  if (typeof value==='string') {
    return value
  }
  if (typeof value==='number' || typeof value==='boolean' || typeof value==='bigint') {
    return String(value)
  }
  if (value==null) {
    return fallback
  }
  return JSON.stringify(value)
}

export const useGateway = () => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0()

  const status = ref<ClientStatus>('disconnected')
  const statusNote = ref('Idle')
  const gatewayLog = ref<string[]>([])
  const userToken = ref<string | null>(null)
  const userId = ref<string | null>(null)
  const activeChannelId = ref('general')
  const composer = ref('')
  const messages = ref<Message[]>([])

  const channels = ref<Channel[]>([
    { id: 'general', name: 'general', type: 'text' },
    { id: 'random', name: 'random', type: 'text' },
  ])

  const filteredMessages = computed(() =>
    messages.value.filter((message) => message.channelId===activeChannelId.value),
  )

  const statusLabel = computed(() => {
    if (status.value==='ready') {
      return 'Ready'
    }
    if (status.value==='connected') {
      return 'Connected'
    }
    if (status.value==='connecting') {
      return 'Connecting'
    }
    if (status.value==='error') {
      return 'Error'
    }
    return 'Disconnected'
  })

  const wsUrl = computed<string>(() => {
    if (gatewayWsUrl) {
      return gatewayWsUrl
    }
    const protocol = window.location.protocol==='https:' ? 'wss':'ws'
    return `${protocol}://${window.location.host}/ws`
  })

  let socketClient: ReturnType<typeof createSocketClient<WsGatewayPayload>> | null = null

  const sendPayload = (payload: WsGatewayPayload) => {
    if (!socketClient?.isOpen()) {
      return
    }
    gatewayLog.value.unshift(`> ${payload.op}`)
    socketClient.send(payload)
  }

  const sendIdentify = () => {
    if (!userToken.value) {
      return
    }
    sendPayload({ op: 'Identify', d: { token: userToken.value } })
  }

  const sendSubscribe = (channelId: string) => {
    sendPayload({ op: 'Subscribe', d: { channel_id: channelId } })
  }

  const handleDispatch = (type: string, payload: Record<string, unknown>) => {
    gatewayLog.value.unshift(`< DISPATCH ${type}`)
    if (type==='READY') {
      status.value = 'ready'
      statusNote.value = `User ${toLogString(payload.user_id, 'unknown')}`
      sendSubscribe(activeChannelId.value)
      return
    }

    if (type==='MESSAGE_CREATE') {
      const content = typeof payload.content==='string' ? payload.content:''
      const authorId = toLogString(payload.author_user_id, 'User')
      const channelId = toLogString(payload.channel_id, activeChannelId.value)
      const fallbackId = `msg-${Date.now().toString()}`
      const messageId = toLogString(payload.id, fallbackId) || fallbackId

      messages.value.push({
        id: messageId,
        author: `User ${authorId.slice(0, 6)}`,
        content,
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        channelId,
      })
      return
    }

    if (type==='ERROR') {
      status.value = 'error'
      statusNote.value = `Gateway error: ${toLogString(payload.code, 'Unknown')}`
    }
  }

  const handlePayload = (payload: WsGatewayPayload) => {
    gatewayLog.value.unshift(`< ${payload.op}`)
    if (payload.op==='Hello') {
      statusNote.value = `Heartbeat ${String(payload.d.heartbeat_interval_ms)}ms`
      return
    }
    if (payload.op==='Dispatch') {
      handleDispatch(payload.d.t, payload.d.d)
    }
  }

  const connectGateway = async () => {
    if (!isAuthenticated.value) {
      status.value = 'error'
      statusNote.value = 'Please sign in before connecting'
      return
    }

    status.value = 'connecting'
    statusNote.value = 'Fetching access token...'
    try {
      userToken.value = await getAccessTokenSilently()
      userId.value = user.value?.sub ?? null
      gatewayLog.value.unshift('< AUTH0 token ok')
    } catch (error) {
      status.value = 'error'
      statusNote.value = `Token fetch failed: ${toLogString(error, 'Unknown error')}`
      return
    }

    statusNote.value = 'Connecting to gateway...'
    socketClient = createSocketClient<WsGatewayPayload>({
      url: () => wsUrl.value,
      onOpen: () => {
        status.value = 'connected'
        statusNote.value = 'Identifying...'
        sendIdentify()
      },
      onMessage: handlePayload,
      onClose: () => {
        status.value = 'disconnected'
        statusNote.value = 'Socket closed'
      },
      onError: () => {
        status.value = 'error'
        statusNote.value = 'Socket error'
      },
    })
    socketClient.connect()
  }

  const disconnectGateway = () => {
    socketClient?.disconnect()
    socketClient = null
    status.value = 'disconnected'
    statusNote.value = 'Disconnected'
    gatewayLog.value.unshift('< DISCONNECT')
  }

  const sendMessage = () => {
    const content = composer.value.trim()
    if (!content) {
      return
    }
    if (status.value!=='ready') {
      statusNote.value = 'Not ready: login/identify first'
      return
    }
    sendPayload({
      op: 'MessageCreate',
      d: { channel_id: activeChannelId.value, content },
    })
    composer.value = ''
  }

  const switchChannel = (channelId: string) => {
    activeChannelId.value = channelId
  }

  watch(activeChannelId, (channelId) => {
    if (status.value==='ready') {
      sendSubscribe(channelId)
    }
  })

  onBeforeUnmount(() => {
    socketClient?.disconnect()
    socketClient = null
  })

  return {
    status,
    statusNote,
    statusLabel,
    gatewayLog,
    userId,
    activeChannelId,
    composer,
    channels,
    filteredMessages,
    connectGateway,
    disconnectGateway,
    sendMessage,
    switchChannel,
  }
}

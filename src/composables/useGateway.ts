import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import type { Message } from '../types/Message'
import type { Channel } from '../types/Channel'
import type { GatewayPayload } from '../types/GatewayPayload'
import type { ClientStatus } from '../types/ClientStatus'

export const useGateway = () => {
  const wsBase = import.meta.env.VITE_GATEWAY_WS_URL || ''
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE || ''
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
    messages.value.filter((message) => message.channelId === activeChannelId.value),
  )

  const statusLabel = computed(() => {
    if (status.value === 'ready') return 'Ready'
    if (status.value === 'connected') return 'Connected'
    if (status.value === 'connecting') return 'Connecting'
    if (status.value === 'error') return 'Error'
    return 'Disconnected'
  })

  const wsUrl = computed(() => {
    if (wsBase) return wsBase
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    return `${protocol}://${window.location.host}/ws`
  })

  let socket: WebSocket | null = null

  const sendPayload = (payload: GatewayPayload) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    gatewayLog.value.unshift(`> ${payload.op}`)
    socket.send(JSON.stringify(payload))
  }

  const sendIdentify = () => {
    if (!userToken.value) return
    sendPayload({ op: 'Identify', d: { token: userToken.value } })
  }

  const sendSubscribe = (channelId: string) => {
    sendPayload({ op: 'Subscribe', d: { channel_id: channelId } })
  }

  const handleDispatch = (type: string, payload: Record<string, unknown>) => {
    gatewayLog.value.unshift(`< DISPATCH ${type}`)
    if (type === 'READY') {
      status.value = 'ready'
      statusNote.value = `User ${payload.user_id}`
      sendSubscribe(activeChannelId.value)
      return
    }

    if (type === 'MESSAGE_CREATE') {
      const content = String(payload.content ?? '')
      const authorId = String(payload.author_user_id ?? 'User')
      const channelId = String(payload.channel_id ?? activeChannelId.value)
      messages.value.push({
        id: String(payload.id ?? `msg-${Date.now()}`),
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

    if (type === 'ERROR') {
      status.value = 'error'
      statusNote.value = `Gateway error: ${payload.code ?? 'Unknown'}`
    }
  }

  const handleMessage = (event: MessageEvent<string>) => {
    const payload = JSON.parse(event.data) as GatewayPayload
    gatewayLog.value.unshift(`< ${payload.op}`)
    if (payload.op === 'Hello') {
      statusNote.value = `Heartbeat ${payload.d.heartbeat_interval_ms}ms`
      return
    }
    if (payload.op === 'Dispatch') {
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
      userToken.value = await getAccessTokenSilently({
        authorizationParams: audience ? { audience } : undefined,
      })
      userId.value = user.value?.sub ?? null
      gatewayLog.value.unshift('< AUTH0 token ok')
    } catch (error) {
      status.value = 'error'
      statusNote.value = `Token fetch failed: ${String(error)}`
      return
    }

    statusNote.value = 'Connecting to gateway...'
    socket = new WebSocket(wsUrl.value)
    socket.addEventListener('open', () => {
      status.value = 'connected'
      statusNote.value = 'Identifying...'
      sendIdentify()
    })
    socket.addEventListener('message', handleMessage)
    socket.addEventListener('close', () => {
      status.value = 'disconnected'
      statusNote.value = 'Socket closed'
    })
    socket.addEventListener('error', () => {
      status.value = 'error'
      statusNote.value = 'Socket error'
    })
  }

  const disconnectGateway = () => {
    if (socket) {
      socket.close()
      socket = null
    }
    status.value = 'disconnected'
    statusNote.value = 'Disconnected'
    gatewayLog.value.unshift('< DISCONNECT')
  }

  const sendMessage = () => {
    const content = composer.value.trim()
    if (!content) return
    if (status.value !== 'ready') {
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
    if (status.value === 'ready') {
      sendSubscribe(channelId)
    }
  })

  onBeforeUnmount(() => {
    if (socket) {
      socket.close()
      socket = null
    }
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

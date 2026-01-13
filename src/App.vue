<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type GatewayPayload =
  | { op: 'Hello'; d: { heartbeat_interval_ms: number } }
  | { op: 'Identify'; d: { token: string } }
  | { op: 'Subscribe'; d: { channel_id: string } }
  | { op: 'MessageCreate'; d: { channel_id: string; content: string } }
  | { op: 'Dispatch'; d: { t: string; d: Record<string, unknown> } }

type Message = {
  id: string
  author: string
  content: string
  time: string
  channelId: string
}

type Channel = {
  id: string
  name: string
  type: 'text' | 'voice'
}

const httpBase = import.meta.env.VITE_GATEWAY_HTTP_URL || ''
const wsBase = import.meta.env.VITE_GATEWAY_WS_URL || ''

const status = ref<'disconnected' | 'connecting' | 'connected' | 'ready' | 'error'>(
  'disconnected',
)
const statusNote = ref('Idle')
const gatewayLog = ref<string[]>([])
const userToken = ref<string | null>(null)
const userId = ref<string | null>(null)
const activeChannelId = ref('general')
const composer = ref('')
const messages = ref<Message[]>([])

const channels = ref<Channel[]>([
  { id: 'general', name: 'general', type: 'text' },
  { id: 'random', name: 'random', type: 'text' }
])

const filteredMessages = computed(() =>
  messages.value.filter((message) => message.channelId === activeChannelId.value),
)

let socket: WebSocket | null = null

const statusLabel = computed(() => {
  if (status.value === 'ready') return 'Ready'
  if (status.value === 'connected') return 'Connected'
  if (status.value === 'connecting') return 'Connecting'
  if (status.value === 'error') return 'Error'
  return 'Disconnected'
})

const loginUrl = computed(() =>
  httpBase ? `${httpBase}/api/login` : '/api/login',
)

const wsUrl = computed(() => {
  if (wsBase) return wsBase
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/ws`
})

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
  status.value = 'connecting'
  statusNote.value = 'Logging in...'
  try {
    const response = await fetch(loginUrl.value, { method: 'POST' })
    if (!response.ok) {
      const error = new Error(`Login failed (${response.status})`)
      status.value = 'error'
      statusNote.value = String(error)
      return
    }
    const data = (await response.json()) as { token: string; user_id: string }
    userToken.value = data.token
    userId.value = data.user_id
    gatewayLog.value.unshift('< LOGIN ok')
  } catch (error) {
    status.value = 'error'
    statusNote.value = String(error)
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
</script>

<template>
  <div class="shell">
    <aside class="channels">
      <header class="channels-header">
        <div>
          <div class="server-title">Nebula</div>
          <div class="server-subtitle">Nebula Gateway</div>
        </div>
      </header>

      <div class="channel-group">
        <div class="channel-group-title">Text Channels</div>
        <button
          v-for="channel in channels.filter((item) => item.type === 'text')"
          :key="channel.id"
          class="channel-row"
          :class="{ active: channel.id === activeChannelId }"
          type="button"
          @click="switchChannel(channel.id)"
        >
          <span class="channel-hash">#</span>
          <span>{{ channel.name }}</span>
        </button>
      </div>
    </aside>

    <main class="chat">
      <header class="chat-header">
        <div class="chat-title">
          <span class="channel-hash">#</span>
          <div>
            <div class="chat-name">{{ activeChannelId }}</div>
          </div>
        </div>
        <div class="chat-status">
          <div class="status-pill" :data-status="status">
            {{ statusLabel }}
          </div>
          <div class="status-note">{{ statusNote }}</div>
          <div class="status-actions">
            <button
              v-if="status === 'disconnected' || status === 'error'"
              class="status-button"
              type="button"
              @click="connectGateway"
            >
              Connect
            </button>
            <button
              v-else
              class="status-button secondary"
              type="button"
              @click="disconnectGateway"
            >
              Disconnect
            </button>
          </div>
          <div class="status-log">
            <div
              v-for="(line, index) in gatewayLog.slice(0, 6)"
              :key="`${line}-${index}`"
            >
              {{ line }}
            </div>
          </div>
        </div>
      </header>

      <section class="messages">
        <article
          v-for="(message, index) in filteredMessages"
          :key="message.id"
          class="message"
          :style="{ '--stagger': `${index * 40}ms` }"
        >
          <div class="message-avatar">
            {{ message.author.slice(0, 1) }}
          </div>
          <div class="message-body">
            <div class="message-meta">
              <span class="message-author">{{ message.author }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
        </article>
      </section>

      <form class="composer" @submit.prevent="sendMessage">
        <span class="composer-icon">+</span>
        <input
          v-model="composer"
          type="text"
          placeholder="Message #general"
        />
        <button class="composer-action" type="submit">Send</button>
      </form>
    </main>
  </div>
</template>

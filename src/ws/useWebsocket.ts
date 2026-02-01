import { useAuth0 } from '@auth0/auth0-vue'
import type { Ref } from 'vue'
import { computed, getCurrentInstance, onBeforeUnmount, ref } from 'vue'

import type { DispatchPayload } from '@/types/gateway/incoming/DispatchPayload.ts'
import type { WsGatewayPayload } from '@/types/gateway/outgoing/WsGatewayPayload.ts'

import { gatewayWsUrl } from '../config/env.ts'
import type { ClientStatus } from '../types/ClientStatus.ts'
import { createSocketClient } from './client.ts'

type DispatchHandler = (event: DispatchPayload) => void

export interface WebsocketContext {
  status: Ref<ClientStatus>
  statusNote: Ref<string>
  statusLabel: Ref<string>
  gatewayLog: Ref<string[]>
  connect: () => Promise<void>
  disconnect: () => void
  send: (payload: WsGatewayPayload) => void
  onDispatch: (handler: DispatchHandler) => void
}

export const useWebsocket = (): WebsocketContext => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const status = ref<ClientStatus>('disconnected')
  const statusNote = ref('Idle')
  const gatewayLog = ref<string[]>([])
  const userToken = ref<string | null>(null)

  const dispatchHandlers: DispatchHandler[] = []

  const statusLabel = computed(() => {
    switch (status.value) {
      case 'ready':
        return 'Ready'
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting'
      case 'error':
        return 'Error'
      default:
        return 'Disconnected'
    }
  })

  const wsUrl = computed<string>(() => {
    if (gatewayWsUrl) {
      return gatewayWsUrl
    }
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    return `${protocol}://${window.location.host}/ws`
  })

  let socketClient: ReturnType<typeof createSocketClient<WsGatewayPayload>> | null = null

  const send = (payload: WsGatewayPayload) => {
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
    send({ op: 'Identify', d: { token: userToken.value } })
  }

  const handlePayload = (payload: WsGatewayPayload) => {
    gatewayLog.value.unshift(`< ${payload.op}`)
    if (payload.op === 'Hello') {
      statusNote.value = `Heartbeat ${String(payload.d.heartbeat_interval_ms)}ms`
      return
    }
    if (payload.op === 'Dispatch') {
      for (const handler of dispatchHandlers) {
        handler(payload.d)
      }
    }
  }

  const connect = async () => {
    if (!isAuthenticated.value) {
      status.value = 'error'
      statusNote.value = 'Please sign in before connecting'
      return
    }

    status.value = 'connecting'
    statusNote.value = 'Fetching access token...'
    try {
      userToken.value = await getAccessTokenSilently()
      gatewayLog.value.unshift('< AUTH0 token ok')
    } catch (error) {
      status.value = 'error'
      const message = error instanceof Error ? error.message : 'Unknown error'
      statusNote.value = `Token fetch failed: ${message}`
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

  const disconnect = () => {
    socketClient?.disconnect()
    socketClient = null
    status.value = 'disconnected'
    statusNote.value = 'Disconnected'
    gatewayLog.value.unshift('< DISCONNECT')
  }

  const onDispatch = (handler: DispatchHandler) => {
    dispatchHandlers.push(handler)
  }

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      socketClient?.disconnect()
      socketClient = null
    })
  }

  return {
    status,
    statusNote,
    statusLabel,
    gatewayLog,
    connect,
    disconnect,
    send,
    onDispatch,
  }
}

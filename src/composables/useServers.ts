import { computed, ref, watch } from 'vue'

import { useDeleteChannel } from '@/api/channel.api'
import { useCreateChannel, useCreateServer, useDeleteServer } from '@/api/server.api'
import type { ReadyEvent } from '@/types/gateway/incoming/ReadyEvent.ts'
import type { Server } from '@/types/Server.ts'
import { mapServerFromJson } from '@/types/Server.ts'
import type { ServerRole } from '@/types/ServerRole.ts'

export const useServers = () => {
  const servers = ref<Server[]>([])
  const activeServerId = ref('')
  const activeChannelId = ref('')

  const activeServerRole = computed<ServerRole>(() => {
    const server = servers.value.find((s) => s.id === activeServerId.value)
    return server?.myRole ?? 'member'
  })

  const channels = computed(() =>
    servers.value.find((s) => s.id === activeServerId.value)?.channels ?? []
  )
  const activeChannel = computed(() =>
    channels.value.find((c) => c.id === activeChannelId.value)
  )
  const activeChannelName = computed(() =>
    activeChannel.value ? activeChannel.value.name : ''
  )

  const { mutate: createServerMutation } = useCreateServer()
  const { mutate: createChannelMutation } = useCreateChannel(activeServerId)
  const { mutate: deleteServerMutation } = useDeleteServer()
  const { mutate: deleteChannelMutation } = useDeleteChannel()

  const hydrateFromReady = (data: ReadyEvent) => {
    servers.value = data.servers.map(mapServerFromJson)

    if (!activeServerId.value && servers.value.length > 0) {
      activeServerId.value = servers.value[0]!.id
    }
    const currentChannels = servers.value.find((s) => s.id === activeServerId.value)?.channels ?? []
    if (!activeChannelId.value && currentChannels.length > 0) {
      activeChannelId.value = currentChannels[0]!.id
    }
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
          servers.value = [...servers.value, newServer].map((server) => ({
            ...server,
            channels: [...server.channels],
          }))
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
              : { ...s, channels: [...s.channels] }
          )
        },
      }
    )
  }

  const deleteServer = (serverId: string) => {
    deleteServerMutation(serverId, {
      onSuccess: () => {
        servers.value = servers.value
          .filter((s) => s.id !== serverId)
          .map((server) => ({
            ...server,
            channels: [...server.channels],
          }))
        if (activeServerId.value === serverId) {
          activeServerId.value = servers.value[0]?.id ?? ''
        }
      },
    })
  }

  const deleteChannel = (channelId: string) => {
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
              : { ...s, channels: [...s.channels] }
          )
          if (activeChannelId.value === channelId) {
            activeChannelId.value = channels.value[0]?.id ?? ''
          }
        },
      }
    )
  }

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
    servers,
    activeServerId,
    activeChannelId,
    activeServerRole,
    channels,
    activeChannel,
    activeChannelName,
    hydrateFromReady,
    switchServer,
    switchChannel,
    createServer,
    createChannel,
    deleteServer,
    deleteChannel,
  }
}

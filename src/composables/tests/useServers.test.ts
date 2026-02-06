import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Server } from '@/types/Server.ts'

import { useServers } from '../useServers'

const createServerMutate = vi.fn()
const createChannelMutate = vi.fn()
const deleteServerMutate = vi.fn()
const deleteChannelMutate = vi.fn()

vi.mock('@/api/server.api', () => ({
  useCreateServer: () => ({
    mutate: (payload: { name: string }, options?: { onSuccess?: (server: Server) => void }) => {
      createServerMutate(payload, options)
      options?.onSuccess?.({
        id: 'server-3',
        name: payload.name,
        ownerUserId: 'user-3',
        myRole: 'owner',
        channels: [],
      })
    },
  }),
  useCreateChannel: () => ({
    mutate: (payload: { name: string }, options?: { onSuccess?: (channel: { id: string, name: string, serverId: string, type: 'text' }) => void }) => {
      createChannelMutate(payload, options)
      options?.onSuccess?.({
        id: 'channel-3',
        name: payload.name,
        serverId: 'server-1',
        type: 'text',
      })
    },
  }),
  useDeleteServer: () => ({
    mutate: (payload: string, options?: { onSuccess?: () => void }) => {
      deleteServerMutate(payload, options)
      options?.onSuccess?.()
    },
  }),
}))

vi.mock('@/api/channel.api', () => ({
  useDeleteChannel: () => ({
    mutate: (payload: { channelId: string, serverId: string }, options?: { onSuccess?: () => void }) => {
      deleteChannelMutate(payload, options)
      options?.onSuccess?.()
    },
  }),
}))

describe('useServers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('hydrates from READY and sets defaults', () => {
    const servers = useServers()

    servers.hydrateFromReady({
      connection_id: 'c1',
      user_id: 'u1',
      username: 'tester',
      is_developer: false,
      heartbeat_interval_ms: 1000,
      servers: [
        {
          id: 'server-1',
          name: 'Server 1',
          owner_user_id: 'owner-1',
          my_role: 'admin',
          channels: [
            { id: 'channel-1', name: 'general', server_id: 'server-1', channel_type: 'text' },
          ],
        },
      ],
    })

    expect(servers.servers.value).toHaveLength(1)
    expect(servers.activeServerId.value).toBe('server-1')
    expect(servers.activeChannelId.value).toBe('channel-1')
    expect(servers.activeServerRole.value).toBe('admin')
    expect(servers.activeChannelName.value).toBe('general')
  })

  it('switches server and channel', () => {
    const servers = useServers()
    servers.servers.value = [
      {
        id: 'server-1',
        name: 'Server 1',
        ownerUserId: 'owner-1',
        myRole: 'member',
        channels: [
          { id: 'channel-1', name: 'general', serverId: 'server-1', type: 'text' },
        ],
      },
      {
        id: 'server-2',
        name: 'Server 2',
        ownerUserId: 'owner-2',
        myRole: 'member',
        channels: [
          { id: 'channel-2', name: 'random', serverId: 'server-2', type: 'text' },
        ],
      },
    ]

    servers.switchServer('server-2')

    expect(servers.activeServerId.value).toBe('server-2')
    expect(servers.activeChannelId.value).toBe('channel-2')
  })

  it('creates server and channel on success', () => {
    const servers = useServers()
    servers.servers.value = [
      {
        id: 'server-1',
        name: 'Server 1',
        ownerUserId: 'owner-1',
        myRole: 'owner',
        channels: [],
      },
    ]
    servers.activeServerId.value = 'server-1'

    servers.createServer('New Server')
    servers.createChannel('new-channel')

    expect(servers.servers.value.map((s) => s.id)).toContain('server-3')
    expect(servers.channels.value.map((c) => c.id)).toContain('channel-3')
  })

  it('deletes server and reassigns active server when needed', () => {
    const servers = useServers()
    servers.servers.value = [
      {
        id: 'server-1',
        name: 'Server 1',
        ownerUserId: 'owner-1',
        myRole: 'owner',
        channels: [],
      },
      {
        id: 'server-2',
        name: 'Server 2',
        ownerUserId: 'owner-2',
        myRole: 'member',
        channels: [],
      },
    ]
    servers.activeServerId.value = 'server-1'

    servers.deleteServer('server-1')

    expect(servers.servers.value.map((s) => s.id)).toEqual(['server-2'])
    expect(servers.activeServerId.value).toBe('server-2')
  })

  it('deletes channel and updates active channel when needed', () => {
    const servers = useServers()
    servers.servers.value = [
      {
        id: 'server-1',
        name: 'Server 1',
        ownerUserId: 'owner-1',
        myRole: 'owner',
        channels: [
          { id: 'channel-1', name: 'general', serverId: 'server-1', type: 'text' },
          { id: 'channel-2', name: 'random', serverId: 'server-1', type: 'text' },
        ],
      },
    ]
    servers.activeServerId.value = 'server-1'
    servers.activeChannelId.value = 'channel-1'

    servers.deleteChannel('channel-1')

    expect(servers.channels.value.map((c) => c.id)).toEqual(['channel-2'])
    expect(servers.activeChannelId.value).toBe('channel-2')
  })

  it('no-ops when deleting a channel that does not exist', () => {
    const servers = useServers()
    servers.servers.value = [
      {
        id: 'server-1',
        name: 'Server 1',
        ownerUserId: 'owner-1',
        myRole: 'owner',
        channels: [],
      },
    ]

    servers.deleteChannel('missing')

    expect(deleteChannelMutate).not.toHaveBeenCalled()
  })
})

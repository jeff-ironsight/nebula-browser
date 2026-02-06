import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { ServerRole } from '@/types/ServerRole.ts'

import AppSideBar from '../AppSideBar.vue'

describe('AppSideBar', () => {
  const servers = [
    { id: 'server-1', name: 'My Server', myRole: 'member' as ServerRole, ownerUserId: 'user-1', channels: [] },
    { id: 'server-2', name: 'Other Server', myRole: 'member' as ServerRole, ownerUserId: 'user-2', channels: [] },
  ]

  const stubs = {
    SidebarProvider: { template: '<div><slot /></div>' },
    Sidebar: { template: '<aside><slot /></aside>' },
    SidebarFooter: { template: '<div><slot /></div>' },
    UserMenuButton: { template: '<div data-testid="user-menu-button">User</div>' },
    ServerList: {
      template: `
        <div>
          <button type="button" data-testid="server-switch" @click="$emit('switch-server', 'server-2')">Switch</button>
          <button type="button" data-testid="server-create" @click="$emit('create-server', 'New Server')">Create</button>
          <button type="button" data-testid="server-delete" @click="$emit('delete-server', 'server-1')">Delete</button>
        </div>
      `,
    },
    ChannelList: {
      template: `
        <div>
          <button type="button" data-testid="channel-switch" @click="$emit('switch-channel', 'random')">Switch</button>
          <button type="button" data-testid="channel-create" @click="$emit('create-channel', 'New Channel')">Create</button>
          <button type="button" data-testid="channel-delete" @click="$emit('delete-channel', 'general')">Delete</button>
        </div>
      `,
    },
  }

  it('emits switchChannel when a channel is clicked', async () => {
    const onSwitchChannel = vi.fn()

    const { getByTestId } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels: [],
        activeChannelId: 'general',
        onSwitchChannel,
      },
      global: { stubs },
    })

    await fireEvent.click(getByTestId('channel-switch'))

    expect(onSwitchChannel).toHaveBeenCalledWith('random')
  })

  it('emits switchServer when a server is clicked', async () => {
    const onSwitchServer = vi.fn()

    const { getByTestId } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels: [],
        activeChannelId: 'general',
        onSwitchServer,
      },
      global: { stubs },
    })

    await fireEvent.click(getByTestId('server-switch'))

    expect(onSwitchServer).toHaveBeenCalledWith('server-2')
  })

  it('forwards create and delete events from ServerList', async () => {
    const onCreateServer = vi.fn()
    const onDeleteServer = vi.fn()

    const { getByTestId } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels: [],
        activeChannelId: 'general',
        onCreateServer,
        onDeleteServer,
      },
      global: { stubs },
    })

    await fireEvent.click(getByTestId('server-create'))
    await fireEvent.click(getByTestId('server-delete'))

    expect(onCreateServer).toHaveBeenCalledWith('New Server')
    expect(onDeleteServer).toHaveBeenCalledWith('server-1')
  })

  it('forwards create and delete events from ChannelList', async () => {
    const onCreateChannel = vi.fn()
    const onDeleteChannel = vi.fn()

    const { getByTestId } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels: [],
        activeChannelId: 'general',
        onCreateChannel,
        onDeleteChannel,
      },
      global: { stubs },
    })

    await fireEvent.click(getByTestId('channel-create'))
    await fireEvent.click(getByTestId('channel-delete'))

    expect(onCreateChannel).toHaveBeenCalledWith('New Channel')
    expect(onDeleteChannel).toHaveBeenCalledWith('general')
  })

  it('renders UserMenuButton below both sidebars', () => {
    const { getByTestId } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels: [],
        activeChannelId: 'general',
      },
      global: { stubs },
    })

    expect(getByTestId('user-menu-button')).toBeInTheDocument()
  })
})

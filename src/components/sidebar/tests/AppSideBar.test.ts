import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { ChannelType } from '@/types/ChannelType.ts'
import type { ServerRole } from '@/types/ServerRole.ts'

import AppSideBar from '../AppSideBar.vue'

describe('AppSideBar', () => {
  const servers = [
    { id: 'server-1', name: 'My Server', myRole: 'member' as ServerRole, ownerUserId: 'user-1', channels: [] },
    { id: 'server-2', name: 'Other Server', myRole: 'member' as ServerRole, ownerUserId: 'user-2', channels: [] },
  ]

  const channels = [
    { id: 'general', name: 'general', serverId: 'server-1', type: 'text' as ChannelType },
    { id: 'random', name: 'random', serverId: 'server-1', type: 'text' as ChannelType },
  ]

  const stubs = {
    SidebarProvider: { template: '<div><slot /></div>' },
    Sidebar: { template: '<aside><slot /></aside>' },
    SidebarHeader: { template: '<div><slot /></div>' },
    SidebarContent: { template: '<div><slot /></div>' },
    SidebarFooter: { template: '<div><slot /></div>' },
    SidebarGroup: { template: '<div><slot /></div>' },
    SidebarGroupContent: { template: '<div><slot /></div>' },
    SidebarGroupLabel: { template: '<div><slot /></div>' },
    SidebarMenu: { template: '<div><slot /></div>' },
    SidebarMenuItem: { template: '<div><slot /></div>' },
    SidebarMenuButton: {
      template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
    },
    UserMenuButton: { template: '<div data-testid="user-menu-button">User</div>' },
  }

  it('emits switchChannel when a channel is clicked', async () => {
    const onSwitchChannel = vi.fn()

    const { getByRole } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels,
        activeChannelId: 'general',
        onSwitchChannel,
      },
      global: { stubs },
    })

    await fireEvent.click(getByRole('button', { name: /random/i }))

    expect(onSwitchChannel).toHaveBeenCalledWith('random')
  })

  it('emits switchServer when a server is clicked', async () => {
    const onSwitchServer = vi.fn()

    const { getByRole } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels,
        activeChannelId: 'general',
        onSwitchServer,
      },
      global: { stubs },
    })

    await fireEvent.click(getByRole('button', { name: 'O' }))

    expect(onSwitchServer).toHaveBeenCalledWith('server-2')
  })

  it('renders UserMenuButton below both sidebars', () => {
    const { getByTestId } = render(AppSideBar, {
      props: {
        servers,
        activeServerId: 'server-1',
        activeServerRole: 'member' as ServerRole,
        channels,
        activeChannelId: 'general',
      },
      global: { stubs },
    })

    expect(getByTestId('user-menu-button')).toBeInTheDocument()
  })
})

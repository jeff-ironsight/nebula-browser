import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import ChannelList from '../ChannelList.vue'

const logout = vi.hoisted(() => vi.fn())

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    logout,
    isLoading: ref(false),
  }),
}))

describe('ChannelList', () => {
  const channels = [
    { id: 'general', name: 'general', type: 'text' as const },
    { id: 'random', name: 'random', type: 'text' as const },
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
    DropdownMenu: { template: '<div><slot /></div>' },
    DropdownMenuTrigger: { template: '<div><slot /></div>' },
    DropdownMenuContent: { template: '<div><slot /></div>' },
    DropdownMenuItem: {
      template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
    },
    UserMenuButton: { template: '<button type="button">User</button>' },
  }

  it('emits switch when a channel is clicked', async () => {
    const onSwitch = vi.fn()

    const { getByRole } = render(ChannelList, {
      props: {
        channels,
        activeChannelId: 'general',
        onSwitch,
      },
      global: { stubs },
    })

    await fireEvent.click(getByRole('button', { name: /random/i }))

    expect(onSwitch).toHaveBeenCalledWith('random')
  })

  it('calls logout from the dropdown item', async () => {
    logout.mockReset()

    const { getByRole } = render(ChannelList, {
      props: {
        channels,
        activeChannelId: 'general',
      },
      global: { stubs },
    })

    await fireEvent.click(getByRole('button', { name: /log out/i }))

    expect(logout).toHaveBeenCalled()
  })
})

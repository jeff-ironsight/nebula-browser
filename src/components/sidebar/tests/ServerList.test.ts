import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useUseInvite } from '@/api/invite.api.ts'
import type { Server } from '@/types/Server.ts'

import ServerList from '../ServerList.vue'

vi.mock('@/api/server.api', () => ({
  useCreateInvite: () => ({
    mutateAsync: vi.fn(),
    isPending: ref(false),
  }),
}))

vi.mock('@/api/invite.api.ts', () => ({
  useUseInvite: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: ref(false),
  })),
}))

describe('ServerList', () => {
  const stubs = {
    SidebarContent: { template: '<div><slot /></div>' },
    SidebarGroup: { template: '<div><slot /></div>' },
    SidebarGroupContent: { template: '<div><slot /></div>' },
    SidebarMenu: { template: '<div><slot /></div>' },
    SidebarMenuItem: { template: '<div><slot /></div>' },
    SidebarMenuButton: {
      template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
    },
    Popover: { template: '<div><slot /></div>' },
    PopoverTrigger: { template: '<div><slot /></div>' },
    PopoverContent: { template: '<div><slot /></div>' },
    ContextMenu: { template: '<div><slot /></div>' },
    ContextMenuTrigger: { template: '<div><slot /></div>' },
    ContextMenuContent: { template: '<div><slot /></div>' },
    ContextMenuItem: {
      template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
    },
    Label: { template: '<label><slot /></label>' },
    Input: {
      props: ['modelValue'],
      emits: ['update:modelValue', 'keydown'],
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" />',
    },
    Button: {
      template: '<button type="button" @click="$emit(\'click\')"><slot /></button>',
    },
    Icon: { template: '<span />' },
  }

  const servers: Server[] = [
    { id: 'server-1', name: 'Alpha', ownerUserId: 'user-1', myRole: 'owner', channels: [] },
    { id: 'server-2', name: 'Beta', ownerUserId: 'user-2', myRole: 'member', channels: [] },
  ]

  it('emits switchServer when server button is clicked', async () => {
    const onSwitchServer = vi.fn()

    const { getByRole } = render(ServerList, {
      props: {
        servers,
        activeServerId: 'server-2',
        onSwitchServer,
      },
      global: { stubs },
    })

    await fireEvent.click(getByRole('button', { name: 'A' }))

    expect(onSwitchServer).toHaveBeenCalledWith('server-1')
  })

  it('emits createServer when name is entered and submitted', async () => {
    const onCreateServer = vi.fn()

    const { getByPlaceholderText, getByRole } = render(ServerList, {
      props: {
        servers,
        activeServerId: 'server-1',
        onCreateServer,
      },
      global: { stubs },
    })

    const input = getByPlaceholderText('Enter name')
    await fireEvent.update(input, 'New Server')
    await fireEvent.click(getByRole('button', { name: 'Submit' }))

    expect(onCreateServer).toHaveBeenCalledWith('New Server')
  })

  it('shows delete action only for manageable servers', () => {
    const { queryAllByText } = render(ServerList, {
      props: {
        servers,
        activeServerId: 'server-1',
      },
      global: { stubs },
    })

    const deleteButtons = queryAllByText('Delete Server')
    expect(deleteButtons).toHaveLength(1)
  })

  it('joins a server with an invite code', async () => {
    const onSwitchServer = vi.fn()
    const useUseInviteMock = useUseInvite as unknown as ReturnType<typeof vi.fn>
    const mutateAsync = vi.fn().mockResolvedValue({
      serverId: 'server-1',
      alreadyMember: false,
      server: null,
    })
    useUseInviteMock.mockReturnValue({
      mutateAsync,
      isPending: ref(false),
    } as unknown as ReturnType<typeof useUseInvite>)

    const { getByPlaceholderText, getByRole } = render(ServerList, {
      props: {
        servers,
        activeServerId: 'server-2',
        onSwitchServer,
      },
      global: { stubs },
    })

    await fireEvent.update(getByPlaceholderText('e.g. 4C2Z9B'), 'INVITE123')
    await fireEvent.click(getByRole('button', { name: 'Join' }))

    expect(mutateAsync).toHaveBeenCalledWith('INVITE123')
    expect(onSwitchServer).toHaveBeenCalledWith('server-1')
  })
})

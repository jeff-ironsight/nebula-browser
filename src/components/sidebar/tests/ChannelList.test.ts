import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { Channel } from '@/types/Channel.ts'

import ChannelList from '../ChannelList.vue'

describe('ChannelList', () => {
  const stubs = {
    SidebarContent: { template: '<div><slot /></div>' },
    SidebarGroup: { template: '<div><slot /></div>' },
    SidebarGroupContent: { template: '<div><slot /></div>' },
    SidebarGroupLabel: { template: '<div><slot /></div>' },
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
  }

  const channels: Channel[] = [
    { id: 'general', name: 'general', serverId: 'server-1', type: 'text' },
    { id: 'voice-1', name: 'Voice', serverId: 'server-1', type: 'voice' },
  ]

  it('renders only text channels', () => {
    const { queryByText } = render(ChannelList, {
      props: {
        channels,
        activeChannelId: 'general',
        activeServerRole: 'member',
      },
      global: { stubs },
    })

    expect(queryByText('general')).toBeInTheDocument()
    expect(queryByText('Voice')).not.toBeInTheDocument()
  })

  it('emits switchChannel when channel is clicked', async () => {
    const onSwitchChannel = vi.fn()

    const { getByRole } = render(ChannelList, {
      props: {
        channels,
        activeChannelId: 'general',
        activeServerRole: 'member',
        onSwitchChannel,
      },
      global: { stubs },
    })

    await fireEvent.click(getByRole('button', { name: /general/i }))

    expect(onSwitchChannel).toHaveBeenCalledWith('general')
  })

  it('emits createChannel when name is entered and submitted', async () => {
    const onCreateChannel = vi.fn()

    const { getByPlaceholderText, getByRole } = render(ChannelList, {
      props: {
        channels,
        activeChannelId: 'general',
        activeServerRole: 'owner',
        onCreateChannel,
      },
      global: { stubs },
    })

    const input = getByPlaceholderText('Enter name')
    await fireEvent.update(input, 'new-channel')
    await fireEvent.click(getByRole('button', { name: 'Submit' }))

    expect(onCreateChannel).toHaveBeenCalledWith('new-channel')
  })

  it('shows delete action only when allowed', () => {
    const { queryByText } = render(ChannelList, {
      props: {
        channels,
        activeChannelId: 'general',
        activeServerRole: 'admin',
      },
      global: { stubs },
    })

    expect(queryByText('Delete Channel')).toBeInTheDocument()
  })
})

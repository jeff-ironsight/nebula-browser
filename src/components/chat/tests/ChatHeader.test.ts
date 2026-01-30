import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ChatHeader from '../ChatHeader.vue'

describe('ChatHeader', () => {
  it('emits connect when disconnected', async () => {
    const onConnect = vi.fn()
    const onDisconnect = vi.fn()

    const { getByRole } = render(ChatHeader, {
      props: {
        activeChannelId: 'general',
        status: 'disconnected',
        statusLabel: 'Disconnected',
        statusNote: 'Offline',
        gatewayLog: [],
        onConnect,
        onDisconnect,
      },
      global: {
        stubs: {
          DebugLogSheet: {
            template: '<button>Debug</button>',
          },
        },
      },
    })

    const button = getByRole('button', { name: /connect/i })
    await fireEvent.click(button)
    expect(onConnect).toHaveBeenCalledTimes(1)
    expect(onDisconnect).not.toHaveBeenCalled()
  })

  it('emits disconnect when connected', async () => {
    const onConnect = vi.fn()
    const onDisconnect = vi.fn()

    const { getByRole } = render(ChatHeader, {
      props: {
        activeChannelId: 'general',
        status: 'ready',
        statusLabel: 'Connected',
        statusNote: 'Online',
        gatewayLog: [],
        onConnect,
        onDisconnect,
      },
      global: {
        stubs: {
          DebugLogSheet: {
            template: '<button>Debug</button>',
          },
        },
      },
    })

    const button = getByRole('button', { name: /disconnect/i })
    await fireEvent.click(button)
    expect(onDisconnect).toHaveBeenCalledTimes(1)
    expect(onConnect).not.toHaveBeenCalled()
  })
})

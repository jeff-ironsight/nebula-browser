import { fireEvent, render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/store/auth.store'

import ChatHeader from '../ChatHeader.vue'

const defaultProps = {
  activeChannelId: 'general',
  status: 'disconnected' as const,
  statusLabel: 'Disconnected',
  statusNote: 'Offline',
  gatewayLog: [],
}

describe('ChatHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('connect/disconnect', () => {
    it('emits connect when disconnected', async () => {
      const onConnect = vi.fn()
      const onDisconnect = vi.fn()

      const { getByRole } = render(ChatHeader, {
        props: {
          ...defaultProps,
          status: 'disconnected',
          onConnect,
          onDisconnect,
        },
        global: {
          stubs: {
            DebugLogSheet: {
              template: '<div data-testid="debug-sheet">Debug</div>',
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
          ...defaultProps,
          status: 'ready',
          statusLabel: 'Connected',
          onConnect,
          onDisconnect,
        },
        global: {
          stubs: {
            DebugLogSheet: {
              template: '<div data-testid="debug-sheet">Debug</div>',
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

  describe('debug sheet visibility', () => {
    it('shows debug sheet when user is a developer', () => {
      const authStore = useAuthStore()
      authStore.setCurrentUser({
        id: 'user-1',
        username: 'devuser',
        isDeveloper: true,
      })

      const { queryByTestId } = render(ChatHeader, {
        props: defaultProps,
        global: {
          stubs: {
            DebugLogSheet: {
              template: '<div data-testid="debug-sheet">Debug</div>',
            },
          },
        },
      })

      expect(queryByTestId('debug-sheet')).toBeInTheDocument()
    })

    it('hides debug sheet when user is not a developer', () => {
      const authStore = useAuthStore()
      authStore.setCurrentUser({
        id: 'user-1',
        username: 'regularuser',
        isDeveloper: false,
      })

      const { queryByTestId } = render(ChatHeader, {
        props: defaultProps,
        global: {
          stubs: {
            DebugLogSheet: {
              template: '<div data-testid="debug-sheet">Debug</div>',
            },
          },
        },
      })

      expect(queryByTestId('debug-sheet')).not.toBeInTheDocument()
    })

    it('hides debug sheet when no user is logged in', () => {
      const { queryByTestId } = render(ChatHeader, {
        props: defaultProps,
        global: {
          stubs: {
            DebugLogSheet: {
              template: '<div data-testid="debug-sheet">Debug</div>',
            },
          },
        },
      })

      expect(queryByTestId('debug-sheet')).not.toBeInTheDocument()
    })
  })
})

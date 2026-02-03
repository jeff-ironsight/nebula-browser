import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { INACTIVE_CHANNEL_LIMIT, useMessageStore } from '../message.store'

describe('useMessageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addMessage', () => {
    it('adds a message to the specified channel', () => {
      const store = useMessageStore()
      const message = {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello world',
        createdAt: '10:30 AM',
        channelId: 'general',
      }

      store.addMessage('general', message)

      expect(store.messagesByChannel.general).toHaveLength(1)
      expect(store.messagesByChannel.general![0]).toEqual(message)
    })

    it('creates channel array if it does not exist', () => {
      const store = useMessageStore()
      const message = {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'random',
      }

      expect(store.messagesByChannel.random).toBeUndefined()
      store.addMessage('random', message)
      expect(store.messagesByChannel.random).toHaveLength(1)
    })

    it('appends messages to existing channel', () => {
      const store = useMessageStore()
      const message1 = {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'First',
        createdAt: '10:30 AM',
        channelId: 'general',
      }
      const message2 = {
        id: 'msg-2',
        authorUserId: 'def123',
        authorUsername: 'User def123',
        content: 'Second',
        createdAt: '10:31 AM',
        channelId: 'general',
      }

      store.addMessage('general', message1)
      store.addMessage('general', message2)

      expect(store.messagesByChannel.general).toHaveLength(2)
      expect(store.messagesByChannel.general![0]!.content).toBe('First')
      expect(store.messagesByChannel.general![1]!.content).toBe('Second')
    })
  })

  describe('getMessages', () => {
    it('returns empty array for channel with no messages', () => {
      const store = useMessageStore()
      const messages = store.getMessages('general')
      expect(messages.value).toEqual([])
    })

    it('returns messages for the specified channel', () => {
      const store = useMessageStore()
      const message = {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      }

      store.addMessage('general', message)
      const messages = store.getMessages('general')

      expect(messages.value).toHaveLength(1)
      expect(messages.value[0]).toEqual(message)
    })

    it('returns computed that updates when messages are added', () => {
      const store = useMessageStore()
      const messages = store.getMessages('general')

      expect(messages.value).toHaveLength(0)

      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      })

      expect(messages.value).toHaveLength(1)
    })
  })

  describe('clearChannel', () => {
    it('removes all messages from the specified channel', () => {
      const store = useMessageStore()
      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      })

      store.clearChannel('general')

      expect(store.messagesByChannel.general).toBeUndefined()
      expect(store.getMessages('general').value).toEqual([])
    })

    it('does not affect other channels', () => {
      const store = useMessageStore()
      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'General message',
        createdAt: '10:30 AM',
        channelId: 'general',
      })
      store.addMessage('random', {
        id: 'msg-2',
        authorUserId: 'def456',
        authorUsername: 'User def456',
        content: 'Random message',
        createdAt: '10:31 AM',
        channelId: 'random',
      })

      store.clearChannel('general')

      expect(store.messagesByChannel.general).toBeUndefined()
      expect(store.messagesByChannel.random).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('removes all messages from all channels', () => {
      const store = useMessageStore()
      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'General message',
        createdAt: '10:30 AM',
        channelId: 'general',
      })
      store.addMessage('random', {
        id: 'msg-2',
        authorUserId: 'def456',
        authorUsername: 'User def456', content: 'Random message',
        createdAt: '10:31 AM',
        channelId: 'random',
      })

      store.clearAll()

      expect(store.messagesByChannel).toEqual({})
      expect(store.getMessages('general').value).toEqual([])
      expect(store.getMessages('random').value).toEqual([])
    })

    it('clears unread counts and active channel', () => {
      const store = useMessageStore()
      store.setActiveChannel('general')
      store.addMessage('random', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'random',
      })

      store.clearAll()

      expect(store.unreadCounts).toEqual({})
      expect(store.activeChannelId).toBe('')
    })
  })

  describe('setActiveChannel', () => {
    it('sets the active channel id', () => {
      const store = useMessageStore()

      store.setActiveChannel('general')

      expect(store.activeChannelId).toBe('general')
    })

    it('clears unread count for the channel', () => {
      const store = useMessageStore()
      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      })
      expect(store.getUnreadCount('general').value).toBe(1)

      store.setActiveChannel('general')

      expect(store.getUnreadCount('general').value).toBe(0)
    })
  })

  describe('getUnreadCount', () => {
    it('returns 0 for channel with no messages', () => {
      const store = useMessageStore()

      expect(store.getUnreadCount('general').value).toBe(0)
    })

    it('returns unread count for inactive channel', () => {
      const store = useMessageStore()
      store.setActiveChannel('random')

      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      })
      store.addMessage('general', {
        id: 'msg-2',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'World',
        createdAt: '10:31 AM',
        channelId: 'general',
      })

      expect(store.getUnreadCount('general').value).toBe(2)
    })

    it('caps unread count at message array length', () => {
      const store = useMessageStore()
      store.unreadCounts.general = 100

      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      })

      expect(store.getUnreadCount('general').value).toBe(1)
    })
  })

  describe('inactive channel behavior', () => {
    it('does not increment unread for active channel', () => {
      const store = useMessageStore()
      store.setActiveChannel('general')

      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      })

      expect(store.getUnreadCount('general').value).toBe(0)
    })

    it('trims inactive channel messages to limit', () => {
      const store = useMessageStore()
      store.setActiveChannel('random')

      const overflow = 5
      const totalMessages = INACTIVE_CHANNEL_LIMIT + overflow

      for (let i = 0; i < totalMessages; i++) {
        store.addMessage('general', {
          id: `msg-${String(i)}`,
          authorUserId: 'abc123',
          authorUsername: 'User abc123',
          content: `Message ${String(i)}`,
          createdAt: '10:30 AM',
          channelId: 'general',
        })
      }

      expect(store.messagesByChannel.general).toHaveLength(INACTIVE_CHANNEL_LIMIT)
      // Should keep the most recent messages
      expect(store.messagesByChannel.general![0]!.content).toBe(`Message ${String(overflow)}`)
      expect(store.messagesByChannel.general![INACTIVE_CHANNEL_LIMIT - 1]!.content).toBe(`Message ${String(totalMessages - 1)}`)
    })

    it('does not trim active channel messages', () => {
      const store = useMessageStore()
      store.setActiveChannel('general')

      const totalMessages = INACTIVE_CHANNEL_LIMIT + 5

      for (let i = 0; i < totalMessages; i++) {
        store.addMessage('general', {
          id: `msg-${String(i)}`,
          authorUserId: 'abc123',
          authorUsername: 'User abc123',
          content: `Message ${String(i)}`,
          createdAt: '10:30 AM',
          channelId: 'general',
        })
      }

      expect(store.messagesByChannel.general).toHaveLength(totalMessages)
    })
  })

  describe('clearChannel', () => {
    it('also clears unread count', () => {
      const store = useMessageStore()
      store.addMessage('general', {
        id: 'msg-1',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Hello',
        createdAt: '10:30 AM',
        channelId: 'general',
      })

      store.clearChannel('general')

      expect(store.unreadCounts.general).toBeUndefined()
    })
  })

  describe('prependMessages', () => {
    it('prepends messages to the beginning of a channel', () => {
      const store = useMessageStore()
      store.addMessage('general', {
        id: 'msg-3',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Third',
        createdAt: '10:32 AM',
        channelId: 'general',
      })

      store.prependMessages('general', [
        {
          id: 'msg-1',
          authorUserId: 'abc123',
          authorUsername: 'User abc123',
          content: 'First',
          createdAt: '10:30 AM',
          channelId: 'general',
        },
        {
          id: 'msg-2',
          authorUserId: 'abc123',
          authorUsername: 'User abc123',
          content: 'Second',
          createdAt: '10:31 AM',
          channelId: 'general',
        },
      ])

      expect(store.messagesByChannel.general).toHaveLength(3)
      expect(store.messagesByChannel.general![0]!.content).toBe('First')
      expect(store.messagesByChannel.general![1]!.content).toBe('Second')
      expect(store.messagesByChannel.general![2]!.content).toBe('Third')
    })

    it('filters out duplicate messages', () => {
      const store = useMessageStore()
      store.addMessage('general', {
        id: 'msg-2',
        authorUserId: 'abc123',
        authorUsername: 'User abc123',
        content: 'Second',
        createdAt: '10:31 AM',
        channelId: 'general',
      })

      store.prependMessages('general', [
        {
          id: 'msg-1',
          authorUserId: 'abc123',
          authorUsername: 'User abc123',
          content: 'First',
          createdAt: '10:30 AM',
          channelId: 'general',
        },
        {
          id: 'msg-2',
          authorUserId: 'abc123',
          authorUsername: 'User abc123',
          content: 'Second (duplicate)',
          createdAt: '10:31 AM',
          channelId: 'general',
        },
      ])

      expect(store.messagesByChannel.general).toHaveLength(2)
      expect(store.messagesByChannel.general![0]!.content).toBe('First')
      expect(store.messagesByChannel.general![1]!.content).toBe('Second')
    })

    it('creates channel array if it does not exist', () => {
      const store = useMessageStore()

      store.prependMessages('general', [
        {
          id: 'msg-1',
          authorUserId: 'abc123',
          authorUsername: 'User abc123',
          content: 'First',
          createdAt: '10:30 AM',
          channelId: 'general',
        },
      ])

      expect(store.messagesByChannel.general).toHaveLength(1)
      expect(store.messagesByChannel.general![0]!.content).toBe('First')
    })
  })
})

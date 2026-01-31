import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useMessageStore } from '../message.store'

describe('useMessageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addMessage', () => {
    it('adds a message to the specified channel', () => {
      const store = useMessageStore()
      const message = {
        id: 'msg-1',
        author: 'User abc123',
        content: 'Hello world',
        time: '10:30 AM',
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
        author: 'User abc123',
        content: 'Hello',
        time: '10:30 AM',
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
        author: 'User abc123',
        content: 'First',
        time: '10:30 AM',
        channelId: 'general',
      }
      const message2 = {
        id: 'msg-2',
        author: 'User def456',
        content: 'Second',
        time: '10:31 AM',
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
        author: 'User abc123',
        content: 'Hello',
        time: '10:30 AM',
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
        author: 'User abc123',
        content: 'Hello',
        time: '10:30 AM',
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
        author: 'User abc123',
        content: 'Hello',
        time: '10:30 AM',
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
        author: 'User abc123',
        content: 'General message',
        time: '10:30 AM',
        channelId: 'general',
      })
      store.addMessage('random', {
        id: 'msg-2',
        author: 'User def456',
        content: 'Random message',
        time: '10:31 AM',
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
        author: 'User abc123',
        content: 'General message',
        time: '10:30 AM',
        channelId: 'general',
      })
      store.addMessage('random', {
        id: 'msg-2',
        author: 'User def456',
        content: 'Random message',
        time: '10:31 AM',
        channelId: 'random',
      })

      store.clearAll()

      expect(store.messagesByChannel).toEqual({})
      expect(store.getMessages('general').value).toEqual([])
      expect(store.getMessages('random').value).toEqual([])
    })
  })
})

import 'pinia-plugin-persistedstate'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Message } from '@/types/Message'

export const INACTIVE_CHANNEL_LIMIT: number = 50

export const useMessageStore = defineStore('messages', () => {
  const messagesByChannel = ref<Record<string, Message[]>>({})
  const unreadCounts = ref<Record<string, number>>({})
  const activeChannelId = ref('')

  const getMessages = (channelId: string) =>
    computed(() => messagesByChannel.value[channelId] ?? [])

  const getUnreadCount = (channelId: string) =>
    computed(() => {
      const count = unreadCounts.value[channelId] ?? 0
      const messageCount = messagesByChannel.value[channelId]?.length ?? 0
      return Math.min(count, messageCount)
    })

  const setActiveChannel = (channelId: string) => {
    activeChannelId.value = channelId
    unreadCounts.value[channelId] = 0
  }

  const addMessage = (channelId: string, message: Message) => {
    const existing = messagesByChannel.value[channelId] ?? []
    let updated = [...existing, message]

    if (channelId !== activeChannelId.value) {
      unreadCounts.value[channelId] = (unreadCounts.value[channelId] ?? 0) + 1
      updated = updated.slice(-INACTIVE_CHANNEL_LIMIT)
    }

    messagesByChannel.value[channelId] = updated
  }

  const setMessages = (channelId: string, messages: Message[]) => {
    messagesByChannel.value[channelId] = messages
  }

  const clearChannel = (channelId: string) => {
    delete messagesByChannel.value[channelId]
    delete unreadCounts.value[channelId]
  }

  const clearAll = () => {
    messagesByChannel.value = {}
    unreadCounts.value = {}
    activeChannelId.value = ''
  }

  return {
    messagesByChannel,
    unreadCounts,
    activeChannelId,
    getMessages,
    getUnreadCount,
    setActiveChannel,
    setMessages,
    addMessage,
    clearChannel,
    clearAll,
  }
}, { persist: true })

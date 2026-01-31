import 'pinia-plugin-persistedstate'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Message } from '@/types/Message'

export const useMessageStore = defineStore('messages', () => {
  const messagesByChannel = ref<Record<string, Message[]>>({})

  const getMessages = (channelId: string) =>
    computed(() => messagesByChannel.value[channelId] ?? [])

  const addMessage = (channelId: string, message: Message) => {
    messagesByChannel.value[channelId] ??= [];
    messagesByChannel.value[channelId].push(message)
  }

  const clearChannel = (channelId: string) => {
    delete messagesByChannel.value[channelId]
  }

  const clearAll = () => {
    messagesByChannel.value = {}
  }

  return {
    messagesByChannel,
    getMessages,
    addMessage,
    clearChannel,
    clearAll,
  }
}, { persist: true })

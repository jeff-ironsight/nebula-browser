import { useInfiniteQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { computed } from 'vue'

import { BASE_API_ENDPOINT, useApi } from '@/api/client.ts'
import type { MessageResponse } from '@/types/gateway/incoming/MessageResponse.ts'
import type { Message } from '@/types/Message.ts'
import { mapMessageFromJson } from '@/types/Message.ts'

const DEFAULT_PAGE_SIZE = 25

const messagesEndpoint = (channelId: string) =>
  `${BASE_API_ENDPOINT}/channels/${channelId}/messages`

interface MessagePage {
  messages: Message[]
  oldestId: string | null
}

export function useInfiniteChannelMessages(channelId: Ref<string>) {
  return useInfiniteQuery<MessagePage, Error, Message[], string[], string | null>({
    queryKey: computed(() => ['channels', channelId.value, 'messages']),
    queryFn: async ({ signal, pageParam }) => {
      const result = await getChannelMessages(channelId.value, {
        signal,
        before: pageParam ?? undefined,
        limit: DEFAULT_PAGE_SIZE,
      })
      const messages = result.map(mapMessageFromJson)
      return {
        messages,
        oldestId: messages.length > 0 ? messages[messages.length - 1]!.id : null,
      }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.oldestId,
    enabled: computed(() => !!channelId.value),
    select: (data) => {
      // Flatten pages and reverse to chronological order (oldest first)
      // Each page is newest-first from API, so we reverse each page then concat
      const allMessages: Message[] = []
      // Pages are fetched newest-to-oldest, so iterate in reverse to get chronological order
      for (let i = data.pages.length - 1; i >= 0; i--) {
        // Each page is also newest-first, so reverse it
        const pageMessages = [...data.pages[i]!.messages].reverse()
        allMessages.push(...pageMessages)
      }
      return allMessages
    },
  })
}

interface GetMessagesOptions {
  signal?: AbortSignal
  before?: string
  limit?: number
}

async function getChannelMessages(
  channelId: string,
  options: GetMessagesOptions = {}
): Promise<MessageResponse[]> {
  const { get } = useApi()
  const params = new URLSearchParams()
  if (options.before) {
    params.set('before', options.before)
  }
  if (options.limit) {
    params.set('limit', options.limit.toString())
  }
  const queryString = params.toString()
  const url = queryString
    ? `${messagesEndpoint(channelId)}?${queryString}`
    : messagesEndpoint(channelId)
  const res = await get<MessageResponse[]>(url, { signal: options.signal })
  return res.data
}

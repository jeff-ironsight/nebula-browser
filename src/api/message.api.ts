import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { computed } from 'vue'

import { BASE_API_ENDPOINT, useApi } from '@/api/client.ts'
import type { MessageResponse } from '@/types/gateway/incoming/MessageResponse.ts'
import type { Message } from '@/types/Message.ts';
import { mapMessageFromJson } from '@/types/Message.ts'

const messagesEndpoint = (channelId: string) =>
  `${BASE_API_ENDPOINT}/channels/${channelId}/messages`

export function useGetChannelMessages(channelId: Ref<string>) {
  return useQuery<Message[]>({
    queryKey: computed(() => ['channels', channelId.value, 'messages']),
    queryFn: async ({ signal }) => {
      const result = await getChannelMessages(channelId.value, signal)
      return result.map(mapMessageFromJson)
    },
    enabled: computed(() => !!channelId.value),
  })
}

async function getChannelMessages(
  channelId: string,
  signal?: AbortSignal
): Promise<MessageResponse[]> {
  const { get } = useApi()
  const res = await get<MessageResponse[]>(messagesEndpoint(channelId), { signal })
  return res.data
}

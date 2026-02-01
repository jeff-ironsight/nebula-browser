import { useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue';
import { computed, watch } from 'vue';

import { BASE_API_ENDPOINT, useApi } from '@/api/client.ts'
import type { ChannelResponse } from '@/types/api/ChannelResponse.ts'
import type { Channel } from '@/types/Channel.ts';
import { mapChannelFromJson } from '@/types/Channel.ts'

const channelsEndpoint = `${BASE_API_ENDPOINT}/channels`;

export function useGetChannel(channelId: Ref<string>) {
  const queryClient = useQueryClient()
  const query = useQuery<Channel>({
    queryKey: computed(() => ['channels', channelId.value]),
    queryFn: async ({ signal }) => {
      const response = await getChannel(channelId.value, signal)
      return mapChannelFromJson(response)
    },
    enabled: computed(() => !!channelId.value),
  })

  watch(
    () => query.data.value,
    (channel: Channel | undefined) => {
      if (!channel) {
        return
      }
      queryClient.setQueryData<Channel[]>(
        ['servers', channel.serverId, 'channels'],
        (old) => {
          if (!old) {
            return [channel]
          }
          const idx = old.findIndex((c) => c.id === channel.id)
          if (idx === -1) {
            return [...old, channel]
          }
          const next = old.slice()
          next[idx] = channel
          return next
        }
      )
    },
    { immediate: true }
  )

  return query
}

async function getChannel(channelId: string, signal?: AbortSignal) {
  const { get } = useApi()
  const res = await get<ChannelResponse>(`${channelsEndpoint}/${channelId}`, { signal });
  return res.data;
}

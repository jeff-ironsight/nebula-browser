import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue';
import { computed, watch } from 'vue';

import { BASE_API_ENDPOINT, useApi } from '@/api/client.ts'
import type { Channel } from '@/types/Channel.ts';
import { mapChannelFromJson } from '@/types/Channel.ts'
import type { ChannelResponse } from '@/types/gateway/incoming/ChannelResponse.ts'

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

export function useDeleteChannel() {
  const queryClient = useQueryClient()
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  return useMutation<void, Error, { channelId: string; serverId: string }>({
    mutationFn: async ({ channelId }) => {
      await deleteChannel(channelId)
    },
    onSuccess: (_data, { channelId, serverId }) => {
      queryClient.removeQueries({ queryKey: ['channels', channelId] })
      queryClient.setQueryData<Channel[]>(
        ['servers', serverId, 'channels'],
        (old) => old?.filter((channel) => channel.id !== channelId) ?? []
      )
    },
  })
}

async function deleteChannel(channelId: string) {
  const { del } = useApi()
  await del(`${channelsEndpoint}/${channelId}`);
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { computed, unref } from 'vue'

import { BASE_API_ENDPOINT, useApi } from '@/api/client.ts';
import type { ChannelResponse } from '@/types/api/ChannelResponse.ts'
import type { ServerResponse } from '@/types/api/ServerResponse.ts'
import type {Channel} from '@/types/Channel.ts';
import {  mapChannelFromJson } from '@/types/Channel.ts'
import type { Server } from '@/types/Server.ts';
import { mapServerFromJson } from '@/types/Server.ts'

const serversEndpoint = `${BASE_API_ENDPOINT}/servers`;

export function useGetServers() {
  return useQuery({
    queryKey: ['servers'],
    retry: 3,
    queryFn: async ({ signal }) => {
      const response = await getServers(signal)
      return response.map(mapServerFromJson)
    },
  })
}

async function getServers(signal?: AbortSignal) {
  const { get } = useApi()
  const res = await get<ServerResponse[]>(serversEndpoint, { signal, })
  return res.data
}

export function useCreateServer() {
  const queryClient = useQueryClient()
  return useMutation<Server, Error, { name: string }>({
    mutationFn: async (payload) => {
      const result = await createServer(payload)
      return mapServerFromJson(result)
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Server[]>(
        ['servers'],
        (old) => [created, ...(old ?? [])]
      )
    },
  })
}

async function createServer(data: { name: string }) {
  const { post } = useApi()
  const res = await post<ServerResponse>(serversEndpoint, { data });
  return res.data;
}

export function useGetServerChannels(serverId: Ref<string>) {
  const id = computed(() => unref(serverId));
  return useQuery<Channel[]>({
    queryKey: computed(() => ['servers', id.value, 'channels']),
    retry: 3,
    queryFn: async ({ signal }) => {
      const result = await getServerChannels(serverId.value, signal)
      return result.map(mapChannelFromJson)
    },
    enabled: computed(() => !!id.value),
  });
}

async function getServerChannels(serverId: string, signal?: AbortSignal) {
  const { get } = useApi()
  const res = await get<ChannelResponse[]>(`${serversEndpoint}/${serverId}/channels`, { signal });
  return res.data;
}

export function useCreateChannel(serverId: Ref<string>) {
  const queryClient = useQueryClient()
  return useMutation<Channel, Error, { name: string }>({
    mutationFn: async (payload) => {
      const result = await createChannel(serverId.value, payload)
      return mapChannelFromJson(result)
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Channel[]>(
        ['servers', serverId.value, 'channels'],
        (old) => [created, ...(old ?? [])]
      )
    },
  })
}

async function createChannel(serverId: string, data: { name: string }) {
  const { post } = useApi()
  const res = await post<ChannelResponse>(`${serversEndpoint}/${serverId}/channels`, { data });
  return res.data;
}

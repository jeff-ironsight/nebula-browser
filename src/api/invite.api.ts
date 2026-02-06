import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { BASE_API_ENDPOINT, useApi } from '@/api/client.ts'
import type { Invite, InviteResponse } from '@/types/Invite.ts';
import { mapInviteFromJson } from '@/types/Invite.ts'

const serversEndpoint = `${BASE_API_ENDPOINT}/servers`;

export function useCreateInvite(serverId: Ref<string>) {
  const queryClient = useQueryClient()
  return useMutation<Invite, Error, { max_uses: number, expires_in_hours: number }>({
    mutationFn: async (payload) => {
      const result = await createInvite(serverId.value, payload)
      return mapInviteFromJson(result)
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Invite[]>(
        ['servers', serverId.value, 'invites'],
        (old) => [created, ...(old ?? [])]
      )
    },
  })
}

async function createInvite(serverId: string, data: { max_uses: number, expires_in_hours: number }) {
  const { post } = useApi()
  const res = await post<InviteResponse>(`${serversEndpoint}/${serverId}/invites`, data)
  return res.data
}

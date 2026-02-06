import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

import { BASE_API_ENDPOINT, useApi } from '@/api/client.ts'
import type { UsedInvite, UseInviteResponse } from '@/types/Invite.ts'
import { mapUsedInviteFromJson } from '@/types/Invite.ts'
import type { Server } from '@/types/Server.ts'

const invitesEndpoint = `${BASE_API_ENDPOINT}/invites`

export function useUseInvite() {
  const queryClient = useQueryClient()
  return useMutation<UsedInvite, Error, string>({
    mutationFn: async (inviteCode) => {
      const result = await acceptInvite(inviteCode)
      return mapUsedInviteFromJson(result)
    },
    onSuccess: (usedInvite) => {
      if (usedInvite.alreadyMember) {
        toast.info('You are already a member of this server.')
      } else {
        toast.success('Joined server.')
      }
      const server = usedInvite.server
      if (!server) {
        return
      }
      queryClient.setQueryData<Server[]>(
        ['servers'],
        (old) => {
          if (!old) {
            return [server]
          }
          const idx = old.findIndex((item) => item.id === server.id)
          if (idx === -1) {
            return [server, ...old]
          }
          const next = old.slice()
          next[idx] = server
          return next
        }
      )
    },
  })
}

async function acceptInvite(inviteCode: string) {
  const { post } = useApi()
  const res = await post<UseInviteResponse>(`${invitesEndpoint}/${inviteCode}`)
  return res.data
}

import type { ServerResponse } from '@/types/api/ServerResponse.ts'

export interface Server {
  id: string
  name: string
  ownerUserId: string
}

export const mapServerFromJson = (data: ServerResponse): Server => ({
  id: data.id,
  name: data.name,
  ownerUserId: data.owner_user_id,
})

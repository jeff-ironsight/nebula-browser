import type { ChannelResponse } from '@/types/gateway/incoming/ChannelResponse.ts'

export interface ServerResponse {
  id: string
  name: string
  owner_user_id: string
  channels: ChannelResponse[]
}

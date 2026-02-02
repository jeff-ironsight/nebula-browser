import type { ChannelResponse } from '@/types/gateway/incoming/ChannelResponse.ts'
import type { ServerRole } from '@/types/ServerRole.ts'

export interface ServerResponse {
  id: string
  name: string
  owner_user_id: string
  my_role: ServerRole
  channels: ChannelResponse[]
}

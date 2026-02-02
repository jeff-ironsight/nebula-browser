import type { Channel } from '@/types/Channel.ts';
import { mapChannelFromJson } from '@/types/Channel.ts'
import type { ServerResponse } from '@/types/gateway/incoming/ServerResponse.ts'
import type { ServerRole } from '@/types/ServerRole.ts'

export interface Server {
  id: string
  name: string
  ownerUserId: string
  myRole: ServerRole
  channels: Channel[]
}

export const mapServerFromJson = (data: ServerResponse): Server => ({
  id: data.id,
  name: data.name,
  ownerUserId: data.owner_user_id,
  myRole: data.my_role,
  channels: data.channels.map(mapChannelFromJson),
})

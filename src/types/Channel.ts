import type { ChannelType } from '@/types/ChannelType.ts'
import type { ChannelResponse } from '@/types/gateway/incoming/ChannelResponse.ts'

export interface Channel {
  id: string
  serverId: string
  name: string
  type: ChannelType
}

export const mapChannelFromJson = (data: ChannelResponse): Channel => ({
  id: data.id,
  serverId: data.server_id,
  name: data.name,
  type: data.channel_type,
})

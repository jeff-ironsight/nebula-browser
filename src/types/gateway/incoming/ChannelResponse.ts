import type { ChannelType } from '@/types/ChannelType.ts'

export interface ChannelResponse {
  id: string
  server_id: string
  name: string
  channel_type: ChannelType
}

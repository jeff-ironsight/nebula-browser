import type { MessageCreatedEvent } from '@/types/gateway/incoming/MessageCreatedEvent.ts'
import type { MessageResponse } from '@/types/gateway/incoming/MessageResponse.ts'
import { formatTime } from '@/utils/time.ts'

export interface Message {
  id: string
  authorUserId: string
  authorUsername: string
  content: string
  createdAt: string
  channelId: string
}

export const mapMessageFromJson = (data: MessageResponse): Message => ({
  id: data.id,
  authorUserId: data.author_user_id,
  authorUsername: data.author_username,
  content: data.content,
  createdAt: formatTime(new Date(data.created_at)),
  channelId: data.channel_id,
})

export const mapMessageFromEvent = (data: MessageCreatedEvent): Message => ({
  id: data.id,
  authorUserId: data.author_user_id,
  authorUsername: data.author_username,
  content: data.content,
  createdAt: formatTime(new Date(data.timestamp)),
  channelId: data.channel_id,
})

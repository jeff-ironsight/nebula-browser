import type { MessageCreatedEvent } from '@/types/ws/incoming/MessageCreatedEvent.ts'

export interface Message {
  id: string
  authorUserId: string
  authorUsername: string
  content: string
  time: string
  channelId: string
}

export const mapMessageFromJson = (data: MessageCreatedEvent): Message => ({
  id: data.id,
  authorUserId: data.author_user_id,
  authorUsername: data.author_username,
  content: data.content,
  time: new Date(data.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }),
  channelId: data.channel_id,
})

export interface MessageCreatedEvent {
  id: string
  channel_id: string
  content: string
  author_user_id: string
  author_username: string
  timestamp: string
}

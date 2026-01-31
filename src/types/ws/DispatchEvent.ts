interface ReadyPayload {
  user_id: string
  username: string
  is_developer: boolean
  connection_id: string
  heartbeat_interval_ms: number
}

interface MessageCreatePayload {
  id: string
  channel_id: string
  content: string
  author_user_id: string
  timestamp: string
}

interface ErrorPayload {
  code: string
}

export type DispatchEvent =
  | { t: 'READY'; d: ReadyPayload }
  | { t: 'MESSAGE_CREATE'; d: MessageCreatePayload }
  | { t: 'ERROR'; d: ErrorPayload }

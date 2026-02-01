import type { ServerResponse } from '@/types/gateway/incoming/ServerResponse.ts'

export interface ReadyEvent {
  user_id: string
  username: string
  is_developer: boolean
  connection_id: string
  heartbeat_interval_ms: number
  servers: ServerResponse[]
}

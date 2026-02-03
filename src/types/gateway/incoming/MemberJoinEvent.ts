export interface MemberJoinEvent {
  server_id: string
  user_id: string
  username: string | null
  joined_at: string
}

import type { ReadyEvent } from '@/types/ws/incoming/ReadyEvent.ts'

export interface CurrentUserContext {
  id: string
  username: string
  isDeveloper: boolean
}

export const mapCurrentUserFromJson = (data: ReadyEvent): CurrentUserContext => ({
  id: data.user_id,
  username: data.username,
  isDeveloper: data.is_developer,
})


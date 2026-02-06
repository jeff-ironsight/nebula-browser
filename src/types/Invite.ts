import type { ServerResponse } from '@/types/gateway/incoming/ServerResponse.ts'
import type { Server } from '@/types/Server.ts';
import { mapServerFromJson } from '@/types/Server.ts'

export interface Invite {
  code: string
  serverId: string
  maxUses: number | null
  useCount: number
  expiresAt: string | null
  createdAt: string
}

export interface UsedInvite {
  serverId: string
  alreadyMember: boolean
  server: Server | null
}

export interface InvitePreview {
  code: string
  serverId: string
  serverName: string
  memberCount: number
}

export interface InviteResponse {
  code: string
  server_id: string
  max_uses: number | null
  use_count: number
  expires_at: string | null
  created_at: string
}

export interface UseInviteResponse {
  server_id: string
  already_member: boolean
  server?: ServerResponse
}

export interface InvitePreviewResponse {
  code: string
  server_id: string
  server_name: string
  member_count: number
}

export const mapInviteFromJson = (data: InviteResponse): Invite => ({
  code: data.code,
  serverId: data.server_id,
  maxUses: data.max_uses,
  useCount: data.use_count,
  expiresAt: data.expires_at,
  createdAt: data.created_at,
})

export const mapInvitePreviewFromJson = (data: InvitePreviewResponse): InvitePreview => ({
  code: data.code,
  serverId: data.server_id,
  serverName: data.server_name,
  memberCount: data.member_count,
})

export const mapUsedInviteFromJson = (data: UseInviteResponse): UsedInvite => ({
  serverId: data.server_id,
  alreadyMember: data.already_member,
  server: data.server ? mapServerFromJson(data.server) : null,
})

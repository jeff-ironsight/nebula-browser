export interface Invite {
  code: string
  serverId: string
  maxUses: number | null
  useCount: number
  expiresAt: string | null
  createdAt: string
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

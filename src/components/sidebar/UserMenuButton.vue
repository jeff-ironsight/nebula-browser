<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { Icon } from '@iconify/vue'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const { user, isLoading, logout } = useAuth0()

const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2363b3ed'/%3E%3Cpath d='M50 45c7.5 0 13.64-6.14 13.64-13.64S57.5 17.72 50 17.72s-13.64 6.14-13.64 13.64S42.5 45 50 45zm0 6.82c-9.09 0-27.28 4.56-27.28 13.64v3.41c0 1.88 1.53 3.41 3.41 3.41h47.74c1.88 0 3.41-1.53 3.41-3.41v-3.41c0-9.08-18.19-13.64-27.28-13.64z' fill='%23fff'/%3E%3C/svg%3E`

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = placeholderImage
}

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  })
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="user-menu-button" type="button">
        <img
            :alt="user?.name || 'User'"
            :src="user?.picture || placeholderImage"
            class="user-menu-avatar"
            @error="handleImageError"
        />
        <span class="user-menu-text">
          <span class="user-menu-name">{{ user?.name || 'User' }}</span>
          <span class="user-menu-email">{{ user?.email || (isLoading ? 'Loading...' : 'No email') }}</span>
        </span>
        <span class="user-menu-caret">▾</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-12" side="top">
      <DropdownMenuItem :disabled="isLoading" @click="handleLogout">
        <Icon class="h-4 w-4 mr-2" icon="mdi:logout"/>
        {{ isLoading ? 'Loading...' : 'Log out' }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>
.user-menu-button {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  text-align: left;
  transition: background 0.2s ease, transform 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.user-menu-button:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.user-menu-button[data-open='true'] {
  background: rgba(94, 162, 255, 0.16);
}

.user-menu-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(94, 162, 255, 0.6);
}

.user-menu-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-menu-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-email {
  font-size: 0.75rem;
  color: var(--ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-caret {
  font-size: 0.8rem;
  color: var(--ink-faint);
}
</style>

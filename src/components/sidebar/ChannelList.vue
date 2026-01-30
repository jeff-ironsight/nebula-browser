<script lang="ts" setup>
import type { Channel } from '@/types/Channel.ts'
import { Icon } from '@iconify/vue'
import { useAuth0 } from '@auth0/auth0-vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../ui/dropdown-menu'
import UserMenuButton from './UserMenuButton.vue'

defineProps<{ channels: Channel[]; activeChannelId: string }>()

defineEmits<{ switch: [channelId: string] }>()

const { logout, isLoading } = useAuth0()

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  })
}
</script>

<template>
  <SidebarProvider>
    <Sidebar class="flex flex-col gap-5 border-r border-sidebar-border/50 px-4 py-5" collapsible="none">
      <SidebarHeader class="flex items-center justify-between px-2">
        <div>
          <div class="text-sm font-semibold">Nebula</div>
          <div class="text-xs text-sidebar-foreground/60">Nebula Gateway</div>
        </div>
      </SidebarHeader>

      <SidebarContent class="flex-1 overflow-y-auto pr-1">
        <SidebarGroup>
          <SidebarGroupLabel class="text-[0.7rem] uppercase tracking-[0.08em] text-sidebar-foreground/50">
            Text Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem
                  v-for="channel in channels.filter((item) => item.type === 'text')"
                  :key="channel.id"
              >
                <SidebarMenuButton
                    :is-active="channel.id === activeChannelId"
                    class="justify-start gap-2"
                    type="button"
                    @click="$emit('switch', channel.id)"
                >
                  <span class="text-sidebar-foreground/50 font-semibold">#</span>
                  <span>{{ channel.name }}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="border-t border-sidebar-border/40 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <UserMenuButton/>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-48" side="top">
            <DropdownMenuItem :disabled="isLoading" @click="handleLogout">
              <Icon class="h-4 w-4 mr-2" icon="mdi:logout"/>
              {{ isLoading ? 'Loading...':'Log out' }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  </SidebarProvider>
</template>

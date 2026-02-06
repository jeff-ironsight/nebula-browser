<script lang="ts" setup>
import type { Channel } from '@/types/Channel.ts'
import type { Server } from '@/types/Server.ts'
import { Sidebar, SidebarFooter, SidebarProvider } from '@/components/ui/sidebar'
import ChannelList from '@/components/sidebar/ChannelList.vue'
import ServerList from '@/components/sidebar/ServerList.vue'
import UserMenuButton from '@/components/sidebar/UserMenuButton.vue'
import type { ServerRole } from '@/types/ServerRole.ts'

defineProps<{
  servers: Server[],
  activeServerId: string,
  activeServerRole: ServerRole,
  channels: Channel[];
  activeChannelId: string
}>()

defineEmits<{
  switchChannel: [channelId: string],
  switchServer: [serverId: string],
  createServer: [name: string],
  createChannel: [name: string],
  deleteServer: [serverId: string],
  deleteChannel: [channelId: string]
}>()
</script>

<template>
  <SidebarProvider>
    <Sidebar class="overflow-hidden *:data-[sidebar=sidebar]:flex-col">
      <div class="flex flex-row flex-1 overflow-hidden">
        <Sidebar
            class="w-[calc(var(--sidebar-width-icon)+10px)]! border-r"
            collapsible="none"
        >
          <ServerList
              :active-server-id="activeServerId"
              :servers="servers"
              @create-server="$emit('createServer', $event)"
              @delete-server="$emit('deleteServer', $event)"
              @switch-server="$emit('switchServer', $event)"
          />
        </Sidebar>
        <Sidebar class="hidden flex-1 md:flex" collapsible="none">
          <ChannelList
              :active-channel-id="activeChannelId"
              :active-server-role="activeServerRole"
              :channels="channels"
              @create-channel="$emit('createChannel', $event)"
              @delete-channel="$emit('deleteChannel', $event)"
              @switch-channel="$emit('switchChannel', $event)"
          />
        </Sidebar>
      </div>
      <SidebarFooter class="border-t border-sidebar-border/40 pt-3">
        <UserMenuButton/>
      </SidebarFooter>
    </Sidebar>
  </SidebarProvider>
</template>

<style scoped>

</style>

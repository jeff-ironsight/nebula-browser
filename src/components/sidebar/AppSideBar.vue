<script lang="ts" setup>
import type { Channel } from '@/types/Channel.ts'
import type { Server } from '@/types/Server.ts'
import { h } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import UserMenuButton from '@/components/sidebar/UserMenuButton.vue'

defineProps<{ servers: Server[], activeServerId: string, channels: Channel[]; activeChannelId: string }>()

defineEmits<{ switchChannel: [channelId: string], switchServer: [serverId: string] }>()
</script>

<template>
  <SidebarProvider>
    <Sidebar class="overflow-hidden *:data-[sidebar=sidebar]:flex-col">
      <div class="flex flex-row flex-1 overflow-hidden">
        <Sidebar
            class="w-[calc(var(--sidebar-width-icon)+10px)]! border-r"
            collapsible="none"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent class="px-1.5 mt-8 md:px-0">
                <SidebarMenu>
                  <SidebarMenuItem v-for="server in servers" :key="server.id">
                    <SidebarMenuButton
                        :is-active="server.id === activeServerId"
                        :tooltip="h('div', { hidden: false }, server.name)"
                        class="px-2.5 md:px-2 justify-center"
                        @click="$emit('switchServer', server.id)"
                    >
                      <!--                  <component :is="server.icon"/>-->
                      <span>{{ server.name[0] }}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <Sidebar class="hidden flex-1 md:flex" collapsible="none">
          <SidebarContent>
            <SidebarGroup class="px-1.5">
              <SidebarGroupLabel class="text-[0.7rem] uppercase tracking-[0.08em] text-sidebar-foreground/50">
                Text Channels
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem
                      v-for="channel in channels"
                      :key="channel.id"
                  >
                    <SidebarMenuButton
                        :is-active="channel.id === activeChannelId"
                        class="justify-start gap-2"
                        type="button"
                        @click="$emit('switchChannel', channel.id)"
                    >
                      <span class="text-sidebar-foreground/50 font-semibold">#</span>
                      <span>{{ channel.name }}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
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

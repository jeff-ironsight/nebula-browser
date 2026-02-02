<script lang="ts" setup>
import type { Channel } from '@/types/Channel.ts'
import type { Server } from '@/types/Server.ts'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from 'reka-ui'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ref } from 'vue'

defineProps<{ servers: Server[], activeServerId: string, channels: Channel[]; activeChannelId: string }>()

const emit = defineEmits<{
  switchChannel: [channelId: string],
  switchServer: [serverId: string],
  createServer: [name: string]
}>()

const newServerName = ref('')
const handleCreateServer = () => {
  if (newServerName.value.trim() !== '') {
    emit('createServer', newServerName.value.trim())
    newServerName.value = ''
  }
}
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
                        :tooltip="server.name"
                        class="px-2.5 md:px-2 justify-center"
                        show-tooltip
                        @click="$emit('switchServer', server.id)"
                    >
                      <!--                  <component :is="server.icon"/>-->
                      <span>{{ server.name[0] }}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <Popover>
                    <SidebarMenuItem>
                      <PopoverTrigger as-child>
                        <SidebarMenuButton
                            class="px-2.5 md:px-2 justify-center"
                            show-tooltip
                            tooltip="Create new server"
                        >
                          <span>+</span>
                        </SidebarMenuButton>
                      </PopoverTrigger>
                      <PopoverContent class="w-90 ml-8">
                        <div class="grid gap-4">
                          <div class="space-y-2">
                            <h4 class="font-medium leading-none">
                              Create New Server
                            </h4>
                            <p class="text-sm text-muted-foreground">
                              Choose a name for your new server.
                            </p>
                          </div>
                          <div class="grid gap-2">
                            <div class="grid grid-cols-4 items-center gap-4">
                              <Label class="ml-2" for="name">Name</Label>
                              <Input
                                  id="name"
                                  v-model="newServerName"
                                  class="col-span-2 h-8"
                                  placeholder="Enter name"
                                  @keydown.enter="handleCreateServer"
                              />
                              <Button type="button" @click="handleCreateServer">
                                Submit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </SidebarMenuItem>
                  </Popover>
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

<script lang="ts" setup>
import type { Server } from '@/types/Server.ts'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Label } from 'reka-ui'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ref } from 'vue'

const props = defineProps<{
  servers: Server[],
  activeServerId: string,
}>()

const emit = defineEmits<{
  switchServer: [serverId: string],
  createServer: [name: string],
  deleteServer: [serverId: string],
}>()

const newServerName = ref('')
const canManageServer = (serverId: string) => {
  const server = props.servers.find(s => s.id === serverId)
  return server?.myRole === 'owner' || server?.myRole === 'admin'
}
const handleCreateServer = () => {
  if (newServerName.value.trim() !== '') {
    emit('createServer', newServerName.value.trim())
    newServerName.value = ''
  }
}
</script>

<template>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupContent class="px-1.5 mt-8 md:px-0">
        <SidebarMenu>
          <SidebarMenuItem v-for="server in servers" :key="server.id">
            <ContextMenu>
              <ContextMenuTrigger as-child>
                <SidebarMenuButton
                  :is-active="server.id === activeServerId"
                  :tooltip="server.name"
                  class="px-2.5 md:px-2 justify-center"
                  show-tooltip
                  @click="$emit('switchServer', server.id)"
                >
                  <span>{{ server.name[0] }}</span>
                </SidebarMenuButton>
              </ContextMenuTrigger>
              <ContextMenuContent v-if="canManageServer(server.id)">
                <ContextMenuItem
                  variant="destructive"
                  @click="$emit('deleteServer', server.id)"
                >
                  Delete Server
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
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
</template>

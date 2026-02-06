<script lang="ts" setup>
import type { Channel } from '@/types/Channel.ts'
import type { ServerRole } from '@/types/ServerRole.ts'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Label } from 'reka-ui'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'

const props = defineProps<{
  channels: Channel[];
  activeChannelId: string
  activeServerRole: ServerRole
}>()

const emit = defineEmits<{
  switchChannel: [channelId: string],
  createChannel: [name: string],
  deleteChannel: [channelId: string]
}>()

const newChannelName = ref('')
const isCreateChannelOpen = ref(false)
const textChannels = computed(() => {
  return props.channels.filter(channel => channel.type === 'text')
})
const canManageChannels = computed(() => {
  return props.activeServerRole === 'owner' || props.activeServerRole === 'admin'
})
const handleCreateChannel = () => {
  if (newChannelName.value.trim() !== '') {
    emit('createChannel', newChannelName.value.trim())
    newChannelName.value = ''
    isCreateChannelOpen.value = false
  }
}
</script>

<template>
  <SidebarContent>
    <SidebarGroup class="px-1.5">
      <SidebarGroupLabel class="text-[0.7rem] uppercase tracking-[0.08em] text-sidebar-foreground/50">
        Text Channels
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem
            v-for="channel in textChannels"
            :key="channel.id"
          >
            <ContextMenu>
              <ContextMenuTrigger as-child>
                <SidebarMenuButton
                  :is-active="channel.id === activeChannelId"
                  class="justify-start gap-2"
                  type="button"
                  @click="$emit('switchChannel', channel.id)"
                >
                  <span class="text-sidebar-foreground/50 font-semibold">#</span>
                  <span>{{ channel.name }}</span>
                </SidebarMenuButton>
              </ContextMenuTrigger>
              <ContextMenuContent v-if="canManageChannels">
                <ContextMenuItem
                  variant="destructive"
                  @click="$emit('deleteChannel', channel.id)"
                >
                  Delete Channel
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </SidebarMenuItem>
          <Popover v-if="canManageChannels" v-model:open="isCreateChannelOpen">
            <SidebarMenuItem>
              <PopoverTrigger as-child>
                <SidebarMenuButton
                  class="justify-start gap-2"
                  type="button"
                >
                  <span class="text-sidebar-foreground/50 font-semibold">+</span>
                  <span class="text-sidebar-foreground/50">Create Channel</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent class="w-90 ml-4">
                <div class="grid gap-4">
                  <div class="space-y-2">
                    <h4 class="font-medium leading-none">
                      Create New Channel
                    </h4>
                    <p class="text-sm text-muted-foreground">
                      Choose a name for your new channel.
                    </p>
                  </div>
                  <div class="grid gap-2">
                    <div class="grid grid-cols-4 items-center gap-4">
                      <Label class="ml-2" for="channel-name">Name</Label>
                      <Input
                        id="channel-name"
                        v-model="newChannelName"
                        class="col-span-2 h-8"
                        placeholder="Enter name"
                        @keydown.enter="handleCreateChannel"
                      />
                      <Button type="button" @click="handleCreateChannel">
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

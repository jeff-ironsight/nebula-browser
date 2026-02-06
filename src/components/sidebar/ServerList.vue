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
import type { Invite } from '@/types/Invite'
import { computed, ref, watch } from 'vue'
import { useCreateInvite } from '@/api/server.api.ts'

const props = defineProps<{
  servers: Server[],
  activeServerId: string,
}>()

const emit = defineEmits<{
  switchServer: [serverId: string],
  createServer: [name: string],
  deleteServer: [serverId: string],
}>()

const DEFAULT_SERVER_ID = '00000000-0000-0000-0000-000000000001'
const SERVER_ORDER_STORAGE_KEY = 'server_order'

const newServerName = ref('')
const isCreateServerOpen = ref(false)
const inviteServerId = ref('')
const inviteForm = ref({ maxUses: 1, expiresInHours: 24 })
const inviteByServerId = ref<Record<string, Invite>>({})
const isInvitePopoverOpen = ref(false)
const invitePopoverPosition = ref<{ top: number, left: number } | null>(null)
const serverTriggerRefs = new Map<string, HTMLElement>()
const serverOrder = ref<string[]>([])
const draggingServerId = ref<string | null>(null)
const { mutateAsync: createInvite, isPending: isCreatingInvite } = useCreateInvite(inviteServerId)

const orderedServers = computed(() => {
  const defaultServer = props.servers.find((server) => server.id === DEFAULT_SERVER_ID)
  const otherServers = props.servers.filter((server) => server.id !== DEFAULT_SERVER_ID)
  const orderIndex = new Map(serverOrder.value.map((id, index) => [id, index]))
  const orderedOthers = [...otherServers].sort((a, b) => {
    const aIndex = orderIndex.get(a.id) ?? Number.POSITIVE_INFINITY
    const bIndex = orderIndex.get(b.id) ?? Number.POSITIVE_INFINITY
    return aIndex - bIndex
  })
  return defaultServer ? [defaultServer, ...orderedOthers] : orderedOthers
})

const readServerOrder = () => {
  const stored = localStorage.getItem(SERVER_ORDER_STORAGE_KEY)
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string')
    }
  } catch {
    return []
  }
  return []
}
const persistServerOrder = () => {
  localStorage.setItem(SERVER_ORDER_STORAGE_KEY, JSON.stringify(serverOrder.value))
}
const normalizeServerOrder = () => {
  const currentIds = props.servers
      .map((server) => server.id)
      .filter((id) => id !== DEFAULT_SERVER_ID)
  const existing = serverOrder.value.filter((id) => currentIds.includes(id))
  const missing = currentIds.filter((id) => !existing.includes(id))
  const nextOrder = [...existing, ...missing]
  if (nextOrder.join('|') !== serverOrder.value.join('|')) {
    serverOrder.value = nextOrder
    persistServerOrder()
  }
}

const canManageServer = (serverId: string) => {
  const server = props.servers.find(s => s.id === serverId)
  return server?.myRole === 'owner' || server?.myRole === 'admin'
}
const handleCreateServer = () => {
  if (newServerName.value.trim() !== '') {
    emit('createServer', newServerName.value.trim())
    newServerName.value = ''
    isCreateServerOpen.value = false
  }
}
const setServerTriggerRef = (serverId: string, el: HTMLElement | null) => {
  if (!el) {
    serverTriggerRefs.delete(serverId)
    return
  }
  serverTriggerRefs.set(serverId, el)
}
const handleDragStart = (serverId: string, event: DragEvent) => {
  if (serverId === DEFAULT_SERVER_ID) return
  draggingServerId.value = serverId
  event.dataTransfer?.setData('text/plain', serverId)
  event.dataTransfer && (event.dataTransfer.effectAllowed = 'move')
}
const handleDragOver = (serverId: string, event: DragEvent) => {
  if (serverId === DEFAULT_SERVER_ID) return
  if (draggingServerId.value && draggingServerId.value !== serverId) {
    event.preventDefault()
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  }
}
const handleDrop = (serverId: string, event: DragEvent) => {
  if (serverId === DEFAULT_SERVER_ID) return
  event.preventDefault()
  const sourceId = draggingServerId.value || event.dataTransfer?.getData('text/plain') || ''
  if (!sourceId || sourceId === serverId || sourceId === DEFAULT_SERVER_ID) return
  const order = [...serverOrder.value]
  const fromIndex = order.indexOf(sourceId)
  const toIndex = order.indexOf(serverId)
  if (fromIndex === -1 || toIndex === -1) return
  order.splice(fromIndex, 1)
  order.splice(toIndex, 0, sourceId)
  serverOrder.value = order
  persistServerOrder()
}
const handleDragEnd = () => {
  draggingServerId.value = null
}
const openInvitePopover = (serverId: string) => {
  inviteServerId.value = serverId
  inviteForm.value = { maxUses: 1, expiresInHours: 24 }
  const trigger = serverTriggerRefs.get(serverId)
  if (trigger) {
    const rect = trigger.getBoundingClientRect()
    invitePopoverPosition.value = {
      top: rect.bottom + 8,
      left: rect.right + 12,
    }
  } else {
    invitePopoverPosition.value = { top: 96, left: 96 }
  }
  isInvitePopoverOpen.value = true
}
const closeInvitePopover = () => {
  isInvitePopoverOpen.value = false
  invitePopoverPosition.value = null
  inviteServerId.value = ''
}
const clampInviteForm = () => {
  const maxUses = Math.min(Math.max(inviteForm.value.maxUses, 1), 10)
  const expiresInHours = Math.min(Math.max(inviteForm.value.expiresInHours, 1), 24)
  inviteForm.value = { maxUses, expiresInHours }
}
const handleCreateInvite = async () => {
  if (!inviteServerId.value) return
  clampInviteForm()
  inviteByServerId.value[inviteServerId.value] = await createInvite({
    max_uses: inviteForm.value.maxUses,
    expires_in_hours: inviteForm.value.expiresInHours,
  })
}
const copyInviteCode = async (serverId: string) => {
  const code = inviteByServerId.value[serverId]?.code
  if (!code) return
  await navigator.clipboard.writeText(code)
}

serverOrder.value = readServerOrder()
watch(
    () => props.servers,
    () => normalizeServerOrder(),
    { immediate: true },
)
</script>

<template>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupContent class="px-1.5 mt-8 md:px-0">
        <SidebarMenu>
          <SidebarMenuItem v-for="server in orderedServers" :key="server.id">
            <ContextMenu>
              <ContextMenuTrigger as-child>
                <span
                    :ref="(el) => setServerTriggerRef(server.id, el as HTMLElement)"
                    :draggable="server.id !== DEFAULT_SERVER_ID"
                    @dragend="handleDragEnd"
                    @dragover="handleDragOver(server.id, $event)"
                    @dragstart="handleDragStart(server.id, $event)"
                    @drop="handleDrop(server.id, $event)"
                >
                  <SidebarMenuButton
                      :is-active="server.id === activeServerId"
                      :tooltip="server.name"
                      class="px-2.5 md:px-2 justify-center"
                      show-tooltip
                      @click="$emit('switchServer', server.id)"
                  >
                    <span>{{ server.name[0] }}</span>
                  </SidebarMenuButton>
                </span>
              </ContextMenuTrigger>
              <ContextMenuContent v-if="canManageServer(server.id)">
                <ContextMenuItem @click="openInvitePopover(server.id)">
                  Create Invite
                </ContextMenuItem>
                <ContextMenuItem
                    variant="destructive"
                    @click="$emit('deleteServer', server.id)"
                >
                  Delete Server
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </SidebarMenuItem>
          <teleport to="body">
            <div v-if="isInvitePopoverOpen" class="fixed inset-0 z-40" @mousedown="closeInvitePopover"/>
            <div
                v-if="isInvitePopoverOpen && invitePopoverPosition"
                :style="{
                top: `${invitePopoverPosition.top}px`,
                left: `${invitePopoverPosition.left}px`,
              }"
                class="bg-popover text-popover-foreground fixed z-50 w-80 rounded-md border p-4 shadow-md"
                @mousedown.stop
            >
              <div class="grid gap-4">
                <div class="space-y-2">
                  <h4 class="font-medium leading-none">
                    Create Invite
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    Set limits and generate an invite code.
                  </p>
                </div>
                <div class="grid gap-3">
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="ml-2" for="invite-max-uses">Max uses</Label>
                    <Input
                        id="invite-max-uses"
                        v-model.number="inviteForm.maxUses"
                        class="col-span-2 h-8"
                        max="10"
                        min="1"
                        type="number"
                        @blur="clampInviteForm"
                    />
                    <span class="text-xs text-muted-foreground">1-10</span>
                  </div>
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label class="ml-2" for="invite-expires">Expires (hrs)</Label>
                    <Input
                        id="invite-expires"
                        v-model.number="inviteForm.expiresInHours"
                        class="col-span-2 h-8"
                        max="24"
                        min="1"
                        type="number"
                        @blur="clampInviteForm"
                    />
                    <span class="text-xs text-muted-foreground">1-24</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Button
                        :disabled="isCreatingInvite"
                        type="button"
                        @click="handleCreateInvite"
                    >
                      Generate
                    </Button>
                    <Input
                        v-if="inviteServerId && inviteByServerId[inviteServerId]"
                        :model-value="inviteByServerId[inviteServerId]?.code"
                        class="h-8 flex-1"
                        readonly
                    />
                    <Button
                        v-if="inviteServerId && inviteByServerId[inviteServerId]"
                        type="button"
                        variant="outline"
                        @click="copyInviteCode(inviteServerId)"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </teleport>
          <Popover v-model:open="isCreateServerOpen">
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

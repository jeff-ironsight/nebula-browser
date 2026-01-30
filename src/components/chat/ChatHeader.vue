<script lang="ts" setup>
import type { ClientStatus } from '@/types/ClientStatus.ts'
import DebugLogSheet from './DebugLogSheet.vue'

const props = defineProps<{
  activeChannelId: string
  status: ClientStatus
  statusLabel: string
  statusNote: string
  gatewayLog: string[]
}>()

const emit = defineEmits<{ connect: []; disconnect: [] }>()

const handleStatusAction = () => {
  if (props.status === 'disconnected' || props.status === 'error') {
    emit('connect')
  } else {
    emit('disconnect')
  }
}
</script>

<template>
  <header
      class="flex items-center justify-between border-b border-white/5 bg-[rgba(37,43,56,0.9)] px-7 py-4.5 backdrop-blur">
    <div class="flex items-center gap-3">
      <span class="font-semibold text-(--ink-faint)">#</span>
      <div>
        <div class="font-semibold">{{ activeChannelId }}</div>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex items-center justify-end gap-2">
        <DebugLogSheet :gateway-log="gatewayLog"/>
        <button
            :class="[
              'ml-1 rounded-[10px] px-3 py-1.5 text-[0.75rem] uppercase tracking-[0.06em]',
              status === 'disconnected' || status === 'error'
                ? 'bg-white/10'
                : 'bg-white/5 text-(--ink-muted)',
            ]"
            type="button"
            @click="handleStatusAction"
        >
          {{ status === 'disconnected' || status === 'error' ? 'Connect':'Disconnect' }}
        </button>
      </div>
      <div class="flex flex-col items-center text-right">
        <div class="mb-2 text-[0.75rem] text-(--ink-faint)">{{ statusNote }}</div>
        <div
            :class="[
              'inline-flex rounded-full px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.08em]',
              status === 'ready'
                ? 'bg-[rgba(97,213,166,0.2)] text-(--accent-2)'
                : status === 'error'
                  ? 'bg-[rgba(255,109,109,0.2)] text-[#ffb0b0]'
                  : 'bg-white/10',
            ]"
        >
          {{ statusLabel }}
        </div>
      </div>
    </div>
  </header>
</template>

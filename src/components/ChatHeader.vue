<script setup lang="ts">
import type { ClientStatus } from '../types/ClientStatus'

defineProps<{
  activeChannelId: string
  status: ClientStatus
  statusLabel: string
  statusNote: string
  gatewayLog: string[]
}>()

defineEmits<{ connect: []; disconnect: [] }>()
</script>

<template>
  <header class="chat-header">
    <div class="chat-title">
      <span class="channel-hash">#</span>
      <div>
        <div class="chat-name">{{ activeChannelId }}</div>
      </div>
    </div>
    <div class="chat-status">
      <div class="status-pill" :data-status="status">
        {{ statusLabel }}
      </div>
      <div class="status-note">{{ statusNote }}</div>
      <div class="status-actions">
        <button
          v-if="status === 'disconnected' || status === 'error'"
          class="status-button"
          type="button"
          @click="$emit('connect')"
        >
          Connect
        </button>
        <button
          v-else
          class="status-button secondary"
          type="button"
          @click="$emit('disconnect')"
        >
          Disconnect
        </button>
      </div>
      <div class="status-log">
        <div v-for="(line, index) in gatewayLog.slice(0, 6)" :key="`${line}-${index}`">
          {{ line }}
        </div>
      </div>
    </div>
  </header>
</template>

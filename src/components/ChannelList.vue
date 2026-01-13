<script setup lang="ts">
import type { Channel } from '../types/Channel'

defineProps<{ channels: Channel[]; activeChannelId: string }>()

defineEmits<{ switch: [channelId: string] }>()
</script>

<template>
  <aside class="channels">
    <header class="channels-header">
      <div>
        <div class="server-title">Nebula</div>
        <div class="server-subtitle">Nebula Gateway</div>
      </div>
    </header>

    <div class="channel-group">
      <div class="channel-group-title">Text Channels</div>
      <button
        v-for="channel in channels.filter((item) => item.type === 'text')"
        :key="channel.id"
        class="channel-row"
        :class="{ active: channel.id === activeChannelId }"
        type="button"
        @click="$emit('switch', channel.id)"
      >
        <span class="channel-hash">#</span>
        <span>{{ channel.name }}</span>
      </button>
    </div>
  </aside>
</template>

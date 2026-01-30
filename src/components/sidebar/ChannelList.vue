<script lang="ts" setup>
import {ref} from 'vue'
import type {Channel} from '../../types/Channel'
import UserMenuButton from './UserMenuButton.vue'
import UserMenuPanel from './UserMenuPanel.vue'

defineProps<{ channels: Channel[]; activeChannelId: string }>()

defineEmits<{ switch: [channelId: string] }>()

const menuOpen = ref(false)
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <aside class="channels">
    <header class="channels-header">
      <div>
        <div class="server-title">Nebula</div>
        <div class="server-subtitle">Nebula Gateway</div>
      </div>
    </header>

    <div class="channels-body">
      <div class="channel-group">
        <div class="channel-group-title">Text Channels</div>
        <button
            v-for="channel in channels.filter((item) => item.type === 'text')"
            :key="channel.id"
            :class="{ active: channel.id === activeChannelId }"
            class="channel-row"
            type="button"
            @click="$emit('switch', channel.id)"
        >
          <span class="channel-hash">#</span>
          <span>{{ channel.name }}</span>
        </button>
      </div>
    </div>

    <footer class="channels-footer">
      <UserMenuPanel v-if="menuOpen"/>
      <UserMenuButton :open="menuOpen" @toggle="toggleMenu"/>
    </footer>
  </aside>
</template>

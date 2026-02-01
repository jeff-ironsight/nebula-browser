<script lang="ts" setup>
import { onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatHeader from '../components/chat/ChatHeader.vue'
import MessageList from '../components/chat/MessageList.vue'
import MessageComposer from '../components/chat/MessageComposer.vue'
import AppSideBar from '@/components/sidebar/AppSideBar.vue'

const {
  status,
  statusNote,
  statusLabel,
  gatewayLog,
  activeServerId,
  activeChannelId,
  activeChannelName,
  composer,
  servers,
  channels,
  filteredMessages,
  connect,
  disconnect,
  sendMessage,
  switchServer,
  switchChannel,
} = useChat()

onMounted(() => {
  connect()
})
</script>

<template>
  <div
      class="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)] min-h-screen text-[#f4f5f7] animate-[shell-fade_0.6s_ease-out_both]">
    <AppSideBar
        :active-channel-id="activeChannelId"
        :active-server-id="activeServerId"
        :channels="channels"
        :servers="servers"
        class="hidden md:flex"
        @switch-channel="switchChannel"
        @switch-server="switchServer"
    />
    <main class="grid grid-rows-[auto_1fr_auto] bg-[#2c3240]">
      <ChatHeader
          :active-channel-name="activeChannelName"
          :gateway-log="gatewayLog"
          :status="status"
          :status-label="statusLabel"
          :status-note="statusNote"
          @connect="connect"
          @disconnect="disconnect"
      />
      <MessageList :messages="filteredMessages"/>
      <MessageComposer
          v-model="composer"
          :active-channel-name="activeChannelName"
          @submit="sendMessage"
      />
    </main>
  </div>
</template>

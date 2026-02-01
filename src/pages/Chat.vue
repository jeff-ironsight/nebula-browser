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
  <div class="shell">
    <AppSideBar
        :active-channel-id="activeChannelId"
        :active-server-id="activeServerId"
        :channels="channels"
        :servers="servers"
        @switch-channel="switchChannel"
        @switch-server="switchServer"
    />
    <main class="chat">
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

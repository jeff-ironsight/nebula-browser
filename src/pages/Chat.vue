<script lang="ts" setup>
import { onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import ChannelList from '../components/sidebar/ChannelList.vue'
import ChatHeader from '../components/chat/ChatHeader.vue'
import MessageList from '../components/chat/MessageList.vue'
import MessageComposer from '../components/chat/MessageComposer.vue'

const {
  status,
  statusNote,
  statusLabel,
  gatewayLog,
  activeChannelId,
  activeChannelName,
  composer,
  channels,
  filteredMessages,
  connect,
  disconnect,
  sendMessage,
  switchChannel,
} = useChat()

onMounted(() => {
  connect()
})
</script>

<template>
  <div class="shell">
    <ChannelList
        :active-channel-id="activeChannelId"
        :channels="channels"
        @switch="switchChannel"
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

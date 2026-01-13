<script setup lang="ts">
import { useGateway } from './composables/useGateway'
import ChannelList from './components/ChannelList.vue'
import ChatHeader from './components/ChatHeader.vue'
import MessageList from './components/MessageList.vue'
import MessageComposer from './components/MessageComposer.vue'

const {
  status,
  statusNote,
  statusLabel,
  gatewayLog,
  activeChannelId,
  composer,
  channels,
  filteredMessages,
  connectGateway,
  disconnectGateway,
  sendMessage,
  switchChannel,
} = useGateway()
</script>

<template>
  <div class="shell">
    <ChannelList
      :channels="channels"
      :active-channel-id="activeChannelId"
      @switch="switchChannel"
    />
    <main class="chat">
      <ChatHeader
        :active-channel-id="activeChannelId"
        :status="status"
        :status-label="statusLabel"
        :status-note="statusNote"
        :gateway-log="gatewayLog"
        @connect="connectGateway"
        @disconnect="disconnectGateway"
      />
      <MessageList :messages="filteredMessages" />
      <MessageComposer v-model="composer" @submit="sendMessage" />
    </main>
  </div>
</template>

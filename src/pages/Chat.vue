<script lang="ts" setup>
import { useGateway } from '../composables/useGateway.ts'
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
        :active-channel-id="activeChannelId"
        :channels="channels"
        @switch="switchChannel"
    />
    <main class="chat">
      <ChatHeader
          :active-channel-id="activeChannelId"
          :gateway-log="gatewayLog"
          :status="status"
          :status-label="statusLabel"
          :status-note="statusNote"
          @connect="connectGateway"
          @disconnect="disconnectGateway"
      />
      <MessageList :messages="filteredMessages"/>
      <MessageComposer v-model="composer" :active-channel-id="activeChannelId" @submit="sendMessage"/>
    </main>
  </div>
</template>

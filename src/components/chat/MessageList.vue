<script lang="ts" setup>
import type { Message } from '@/types/Message.ts'

defineProps<{ messages: Message[] }>()
</script>

<template>
  <section class="messages">
    <article
        v-for="(message, index) in messages"
        :key="message.id"
        :style="{ '--stagger': `${index * 40}ms` }"
        class="message"
    >
      <div class="message-avatar"/>
      <div class="message-body">
        <div class="message-meta">
          <span class="message-author">{{ message.authorUsername }}</span>
          <span class="message-time">{{ message.time }}</span>
        </div>
        <div class="message-text">{{ message.content }}</div>
      </div>
    </article>
  </section>
</template>

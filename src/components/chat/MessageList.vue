<script lang="ts" setup>
import type { Message } from '../../types/Message'

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
      <div class="message-avatar">
        {{ message.author.slice(0, 1) }}
      </div>
      <div class="message-body">
        <div class="message-meta">
          <span class="message-author">{{ message.author }}</span>
          <span class="message-time">{{ message.time }}</span>
        </div>
        <div class="message-text">{{ message.content }}</div>
      </div>
    </article>
  </section>
</template>

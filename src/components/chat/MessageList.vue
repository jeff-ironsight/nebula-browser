<script lang="ts" setup>
import type { Message } from '@/types/Message.ts'

defineProps<{ messages: Message[] }>()
</script>

<template>
  <section class="px-7 py-6 overflow-y-auto flex flex-col gap-4">
    <article
        v-for="(message, index) in messages"
        :key="message.id"
        :style="{ animationDelay: `${index * 40}ms` }"
        class="grid grid-cols-[40px_1fr] gap-3 animate-[message-in_0.4s_ease_both]"
    >
      <div class="w-[38px] h-[38px] rounded-[14px] bg-[#4b5b7c] grid place-items-center font-semibold"/>
      <div class="bg-[rgba(20,22,29,0.15)] rounded-xl px-3.5 py-2.5">
        <div class="flex items-baseline gap-2.5 mb-1">
          <span class="font-semibold">{{ message.authorUsername }}</span>
          <span class="text-xs text-[#7e8799]">{{ message.createdAt }}</span>
        </div>
        <div class="text-[#a5adbd]">{{ message.content }}</div>
      </div>
    </article>
  </section>
</template>

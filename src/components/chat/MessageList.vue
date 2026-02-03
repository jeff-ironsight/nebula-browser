<script lang="ts" setup>
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref, watch, nextTick } from 'vue'

import type { Message } from '@/types/Message.ts'

const props = defineProps<{
  messages: Message[]
  hasMore: boolean
  isLoadingMore: boolean
}>()

const emit = defineEmits<{
  loadMore: []
}>()

const parentRef = ref<HTMLElement | null>(null)
const previousScrollHeight = ref(0)
const previousMessageCount = ref(0)

const rowVirtualizerOptions = computed(() => ({
  count: props.messages.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 72,
  overscan: 5,
}))

const virtualizer = useVirtualizer(rowVirtualizerOptions)

const virtualItems = computed(() => virtualizer.value.getVirtualItems())
const totalSize = computed(() => virtualizer.value.getTotalSize())

function onScroll() {
  if (!parentRef.value) return
  const { scrollTop } = parentRef.value
  // Trigger load more when scrolled near top (within 200px)
  if (scrollTop < 200 && props.hasMore && !props.isLoadingMore) {
    previousScrollHeight.value = parentRef.value.scrollHeight
    emit('loadMore')
  }
}

// Maintain scroll position when older messages are prepended
watch(
  () => props.messages.length,
  async (newCount, oldCount) => {
    if (!parentRef.value) return

    // If messages were prepended (count increased while loading more)
    if (newCount > oldCount && previousScrollHeight.value > 0) {
      await nextTick()
      const newScrollHeight = parentRef.value.scrollHeight
      const scrollDelta = newScrollHeight - previousScrollHeight.value
      parentRef.value.scrollTop += scrollDelta
      previousScrollHeight.value = 0
    }

    // Scroll to bottom for new messages at the end (real-time)
    if (newCount > previousMessageCount.value && previousMessageCount.value > 0) {
      const lastOldId = previousMessageCount.value > 0 ? props.messages[previousMessageCount.value - 1]?.id : null
      const lastNewId = props.messages[newCount - 1]?.id
      // Only auto-scroll if a new message was added at the end (not prepended)
      if (lastOldId && lastNewId !== lastOldId && previousScrollHeight.value === 0) {
        const isNearBottom =
          parentRef.value.scrollHeight - parentRef.value.scrollTop - parentRef.value.clientHeight < 100
        if (isNearBottom) {
          await nextTick()
          parentRef.value.scrollTop = parentRef.value.scrollHeight
        }
      }
    }

    previousMessageCount.value = newCount
  }
)

// Initial scroll to bottom when messages first load
watch(
  () => props.messages.length > 0,
  async (hasMessages) => {
    if (hasMessages && parentRef.value) {
      await nextTick()
      parentRef.value.scrollTop = parentRef.value.scrollHeight
    }
  },
  { once: true }
)
</script>

<template>
  <section
    ref="parentRef"
    class="px-7 py-6 overflow-y-auto min-h-0"
    @scroll="onScroll"
  >
    <div
      :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }"
    >
      <!-- Loading indicator at top -->
      <div
        v-if="isLoadingMore"
        class="absolute top-0 left-0 right-0 text-center py-2 text-[#7e8799] text-sm"
      >
        Loading older messages...
      </div>

      <article
        v-for="virtualRow in virtualItems"
        :key="messages[virtualRow.index]?.id ?? virtualRow.index"
        :data-index="virtualRow.index"
        :ref="(el) => virtualizer.measureElement(el as HTMLElement)"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }"
        class="grid grid-cols-[40px_1fr] gap-3 pb-4"
      >
        <div class="w-[38px] h-[38px] rounded-[14px] bg-[#4b5b7c] grid place-items-center font-semibold" />
        <div class="bg-[rgba(20,22,29,0.15)] rounded-xl px-3.5 py-2.5">
          <div class="flex items-baseline gap-2.5 mb-1">
            <span class="font-semibold">{{ messages[virtualRow.index]?.authorUsername }}</span>
            <span class="text-xs text-[#7e8799]">{{ messages[virtualRow.index]?.createdAt }}</span>
          </div>
          <div class="text-[#a5adbd]">{{ messages[virtualRow.index]?.content }}</div>
        </div>
      </article>
    </div>
  </section>
</template>

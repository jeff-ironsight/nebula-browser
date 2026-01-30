<script lang="ts" setup>
import { nextTick } from 'vue'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

defineProps<{ modelValue: string }>()

defineEmits<{ 'update:modelValue': [value: string]; submit: [] }>()

const autoResize = async (event: Event) => {
  await nextTick()
  const el = event.target as HTMLTextAreaElement | null
  if (!el) {
    return
  }
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
</script>

<template>
  <form class="flex items-end gap-3 px-7 pb-6 pt-4.5" @submit.prevent="$emit('submit')">
    <Textarea
        :model-value="modelValue"
        class="mr-4 min-h-11 max-h-43.75 flex-1 resize-none break-all whitespace-pre-wrap overflow-y-auto rounded-xl border-white/10 bg-white/5 px-3.5 py-3 text-(--ink-strong) shadow-none placeholder:text-(--ink-faint) focus-visible:border-white/20 focus-visible:ring-white/30"
        placeholder="Message #general"
        rows="1"
        @input="autoResize"
        @update:model-value="$emit('update:modelValue', $event as string)"
    />
    <Button
        class="mb-1 rounded-xl bg-linear-to-br from-[#5ea2ff] to-[#7cc7ff] px-4.5 py-2.5 font-semibold text-[#0b111b] transition hover:from-[#6bb0ff] hover:to-[#88d2ff]"
        type="submit"
    >
      Send
    </Button>
  </form>
</template>

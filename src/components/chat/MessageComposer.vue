<script setup lang="ts">
defineProps<{ modelValue: string }>()

defineEmits<{ 'update:modelValue': [value: string]; submit: [] }>()
</script>

<template>
  <form class="composer" @submit.prevent="$emit('submit')">
    <span class="composer-icon">+</span>
    <input
      :value="modelValue"
      type="text"
      placeholder="Message #general"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button class="composer-action" type="submit">Send</button>
  </form>
</template>

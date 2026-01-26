<script setup lang="ts">
import AuthLayout from '../layouts/AuthLayout.vue'

defineProps<{
  message?: string
}>()
</script>

<template>
  <AuthLayout>
    <div class="error-state">
      <div class="error-title">Oops!</div>
      <div class="error-message">Something went wrong</div>
      <div v-if="message" class="error-sub-message">{{ message }}</div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.error-state {
  background-color: #c53030;
  color: #fff;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  padding: 3rem;
  text-align: center;
}

.error-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.error-sub-message {
  font-size: 1rem;
  opacity: 0.8;
}
</style>

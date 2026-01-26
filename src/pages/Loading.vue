<script setup lang="ts">
import AuthLayout from '../layouts/AuthLayout.vue'
</script>

<template>
  <AuthLayout>
    <div class="loading-state">
      <div class="loading-text">Loading...</div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.loading-state {
  background-color: #2d313c;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  padding: 3rem;
  text-align: center;
}

.loading-text {
  font-size: 1.8rem;
  font-weight: 500;
  color: #a0aec0;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>

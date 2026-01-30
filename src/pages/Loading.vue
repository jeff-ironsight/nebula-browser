<script lang="ts" setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import { Card, CardContent } from '../components/ui/card'
</script>

<template>
  <AuthLayout>
    <Card class="p-10 items-center text-center">
      <CardContent>
        <div class="loading-text">Loading...</div>
      </CardContent>
    </Card>
  </AuthLayout>
</template>
<style scoped>
.loading-text {
  font-size: 1.8rem;
  font-weight: 500;
  color: #a0aec0;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>

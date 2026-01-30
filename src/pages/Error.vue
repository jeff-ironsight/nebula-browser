<script lang="ts" setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import { Card, CardContent } from '../components/ui/card'

defineProps<{
  message?: string
}>()
</script>

<template>
  <AuthLayout>
    <Card class="p-10 items-center text-center bg-destructive text-destructive-foreground">
      <CardContent class="flex flex-col items-center gap-2">
        <div class="text-4xl font-bold">Oops!</div>
        <div class="text-lg">Something went wrong</div>
        <div v-if="message" class="text-sm opacity-80">{{ message }}</div>
      </CardContent>
    </Card>
  </AuthLayout>
</template>

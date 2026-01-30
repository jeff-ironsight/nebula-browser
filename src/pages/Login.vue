<script lang="ts" setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import LoginButton from '../components/auth/LoginButton.vue'
import { Card, CardContent } from '../components/ui/card'
import nebulaLogoNamed from '../assets/nebula-named-900x256.png'

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<template>
  <AuthLayout>
    <Card class="p-10 items-center text-center">
      <img
          :src="nebulaLogoNamed"
          alt="Nebula Logo"
          style="width: 400px; max-width: 100%; height: auto;"
          @error="handleImageError"
      />
      <CardContent class="flex flex-col items-center gap-6">
        <p class="text-lg text-muted-foreground leading-relaxed">
          Get started by signing in to your<br>Nebula account
        </p>
        <LoginButton/>
      </CardContent>
    </Card>
  </AuthLayout>
</template>

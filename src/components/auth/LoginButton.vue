<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { Button } from '@/components/ui/button'

const { loginWithRedirect, isLoading } = useAuth0()

const handleLogin = () => {
  loginWithRedirect()
}
</script>

<template>
  <Button
      :disabled="isLoading"
      class="rounded-xl bg-linear-to-br from-[#5ea2ff] to-[#7cc7ff] px-4.5 py-2.5 font-semibold text-[#0b111b] transition hover:from-[#6bb0ff] hover:to-[#88d2ff]"
      size="lg"
      @click="handleLogin"
  >
    {{ isLoading ? 'Loading...':'Log In' }}
  </Button>
</template>

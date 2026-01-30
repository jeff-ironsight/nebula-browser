<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { Button } from '@/components/ui/button'

const { loginWithRedirect, isLoading } = useAuth0()

const handleLogin = () => {
  loginWithRedirect()
}
</script>

<template>
  <Button :disabled="isLoading" size="lg" @click="handleLogin">
    {{ isLoading ? 'Loading...':'Log In' }}
  </Button>
</template>

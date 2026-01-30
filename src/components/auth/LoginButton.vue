<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'

const { loginWithRedirect, isLoading } = useAuth0()

const handleLogin = () => {
  loginWithRedirect()
}
</script>

<template>
  <button
      :disabled="isLoading"
      class="button login"
      @click="handleLogin"
  >
    {{ isLoading ? 'Loading...':'Log In' }}
  </button>
</template>

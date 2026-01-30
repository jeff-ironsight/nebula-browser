<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'

const { logout, isLoading } = useAuth0()

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
}
</script>

<template>
  <button
      :disabled="isLoading"
      class="button logout"
      @click="handleLogout"
  >
    {{ isLoading ? 'Loading...':'Log Out' }}
  </button>
</template>

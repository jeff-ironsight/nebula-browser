<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { computed, ref, watch } from 'vue'
import { initApiClient } from '@/api/client.ts'
import Chat from './pages/Chat.vue'
import Login from './pages/Login.vue'
import Loading from "./pages/Loading.vue"
import Error from "./pages/Error.vue"
import { Toaster } from "@/components/ui/sonner"

const { user, isAuthenticated, isLoading, error, logout } = useAuth0()
initApiClient()

const emailNotVerifiedMessage = 'Please verify your email address to continue. Check your inbox for a verification link.'
const emailNotVerified = computed(() =>
    isAuthenticated.value && user.value?.email_verified === false
)

const didForceLogout = ref(false)
watch(error, (err) => {
  if (!err || !isAuthenticated.value || didForceLogout.value) return
  if (err.message.includes('Missing Refresh Token')) {
    didForceLogout.value = true
    logout({ logoutParams: { returnTo: window.location.origin } })
  }
})
</script>

<template>
  <Loading v-if="isLoading"/>
  <Error v-else-if="error" :message="error.message"/>
  <Error v-else-if="emailNotVerified" :message="emailNotVerifiedMessage"/>
  <Chat v-else-if="isAuthenticated"/>
  <Login v-else/>
  <Toaster />
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

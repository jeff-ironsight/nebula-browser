<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import { computed } from 'vue'
import Chat from './pages/Chat.vue'
import Login from './pages/Login.vue'
import Loading from "./pages/Loading.vue"
import Error from "./pages/Error.vue"

const { user, isAuthenticated, isLoading, error } = useAuth0()

const emailNotVerifiedMessage = 'Please verify your email address to continue. Check your inbox for a verification link.'
const emailNotVerified = computed(() =>
    isAuthenticated.value && user.value?.email_verified === false
)
</script>

<template>
  <Loading v-if="isLoading"/>
  <Error v-else-if="error" :message="error.message"/>
  <Error v-else-if="emailNotVerified" :message="emailNotVerifiedMessage"/>
  <Chat v-else-if="isAuthenticated"/>
  <Login v-else/>
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

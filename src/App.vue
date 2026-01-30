<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import Chat from './pages/Chat.vue'
import Login from './pages/Login.vue'
import Loading from "./pages/Loading.vue"
import Error from "./pages/Error.vue"

const { isAuthenticated, isLoading, error } = useAuth0()
</script>

<template>
  <Loading v-if="isLoading"/>
  <Error v-else-if="error" :message="error.message"/>
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

import 'pinia-plugin-persistedstate';

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { CurrentUserContext } from '@/types/CurrentUserContext.ts';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<CurrentUserContext | null>(null)

  const isDeveloper = computed(() => currentUser.value?.isDeveloper ?? false)
  const isLoggedIn = computed(() => currentUser.value != null)

  const setCurrentUser = (user: CurrentUserContext) => {
    currentUser.value = user
  }

  return {
    currentUser,
    isDeveloper,
    isLoggedIn,
    setCurrentUser,
  }
}, { persist: true })

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '../auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('isDeveloper', () => {
    it('returns false when no user is set', () => {
      const store = useAuthStore()
      expect(store.isDeveloper).toBe(false)
    })

    it('returns false when user is not a developer', () => {
      const store = useAuthStore()
      store.setCurrentUser({
        id: 'user-1',
        username: 'testuser',
        isDeveloper: false,
      })
      expect(store.isDeveloper).toBe(false)
    })

    it('returns true when user is a developer', () => {
      const store = useAuthStore()
      store.setCurrentUser({
        id: 'user-1',
        username: 'devuser',
        isDeveloper: true,
      })
      expect(store.isDeveloper).toBe(true)
    })
  })

  describe('isLoggedIn', () => {
    it('returns false when no user is set', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('returns true when user is set', () => {
      const store = useAuthStore()
      store.setCurrentUser({
        id: 'user-1',
        username: 'testuser',
        isDeveloper: false,
      })
      expect(store.isLoggedIn).toBe(true)
    })
  })

  describe('setCurrentUser', () => {
    it('sets the current user', () => {
      const store = useAuthStore()
      const user = {
        id: 'user-1',
        username: 'testuser',
        isDeveloper: true,
      }

      store.setCurrentUser(user)

      expect(store.currentUser).toEqual(user)
    })
  })
})

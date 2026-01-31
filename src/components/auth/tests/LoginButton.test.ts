import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import LoginButton from '../LoginButton.vue'

const loginWithRedirect = vi.fn()
const isLoading = ref(false)

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    loginWithRedirect,
    isLoading,
  }),
}))

describe('LoginButton', () => {
  const stubs = {
    Button: {
      template: '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
    },
  }

  it('renders Log In text when not loading', () => {
    isLoading.value = false
    const { getByRole } = render(LoginButton, { global: { stubs } })

    expect(getByRole('button')).toHaveTextContent('Log In')
  })

  it('renders Loading... text when loading', () => {
    isLoading.value = true
    const { getByRole } = render(LoginButton, { global: { stubs } })

    expect(getByRole('button')).toHaveTextContent('Loading...')
  })

  it('disables button when loading', () => {
    isLoading.value = true
    const { getByRole } = render(LoginButton, { global: { stubs } })

    expect(getByRole('button')).toBeDisabled()
  })

  it('calls loginWithRedirect when clicked', async () => {
    isLoading.value = false
    loginWithRedirect.mockClear()
    const { getByRole } = render(LoginButton, { global: { stubs } })

    await fireEvent.click(getByRole('button'))

    expect(loginWithRedirect).toHaveBeenCalled()
  })
})

import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import UserMenuButton from '../UserMenuButton.vue'

const user = ref<{ name?: string; email?: string; picture?: string } | undefined>(undefined)
const isLoading = ref(false)

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    user,
    isLoading,
  }),
}))

describe('UserMenuButton', () => {
  it('renders default text when user is undefined', () => {
    user.value = undefined
    isLoading.value = false

    const { getByText } = render(UserMenuButton)

    expect(getByText('User')).toBeInTheDocument()
    expect(getByText('No email')).toBeInTheDocument()
  })

  it('renders Loading... for email when loading', () => {
    user.value = undefined
    isLoading.value = true

    const { getByText } = render(UserMenuButton)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('renders user name and email when available', () => {
    user.value = {
      name: 'John Doe',
      email: 'john@example.com',
    }
    isLoading.value = false

    const { getByText } = render(UserMenuButton)

    expect(getByText('John Doe')).toBeInTheDocument()
    expect(getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders user picture when available', () => {
    user.value = {
      name: 'Jane',
      picture: 'https://example.com/avatar.jpg',
    }

    const { getByRole } = render(UserMenuButton)
    const img = getByRole('img')

    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(img).toHaveAttribute('alt', 'Jane')
  })

  it('uses placeholder image when no picture', () => {
    user.value = { name: 'Test' }

    const { getByRole } = render(UserMenuButton)
    const img = getByRole('img')

    expect(img.getAttribute('src')).toContain('data:image/svg+xml')
  })

  it('replaces broken image with placeholder on error', async () => {
    user.value = {
      name: 'Test',
      picture: 'https://broken-url.com/avatar.jpg',
    }

    const { getByRole } = render(UserMenuButton)
    const img = getByRole('img')

    await fireEvent.error(img)

    expect(img.getAttribute('src')).toContain('data:image/svg+xml')
  })
})

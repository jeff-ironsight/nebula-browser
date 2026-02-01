import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import UserMenuButton from '../UserMenuButton.vue'

const user = ref<{ name?: string; email?: string; picture?: string } | undefined>(undefined)
const isLoading = ref(false)
const logout = vi.fn()

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => ({
    user,
    isLoading,
    logout,
  }),
}))

describe('UserMenuButton', () => {
  const stubs = {
    DropdownMenu: { template: '<div><slot /></div>' },
    DropdownMenuTrigger: { template: '<div><slot /></div>' },
    DropdownMenuContent: { template: '<div><slot /></div>' },
    DropdownMenuItem: {
      template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
    },
  }

  it('renders default text when user is undefined', () => {
    user.value = undefined
    isLoading.value = false

    const { getByText } = render(UserMenuButton, { global: { stubs } })

    expect(getByText('User')).toBeInTheDocument()
    expect(getByText('No email')).toBeInTheDocument()
  })

  it('renders Loading... for email when loading', () => {
    user.value = undefined
    isLoading.value = true

    const { container } = render(UserMenuButton, { global: { stubs } })

    const emailSpan = container.querySelector('.user-menu-email')
    expect(emailSpan).toHaveTextContent('Loading...')
  })

  it('renders user name and email when available', () => {
    user.value = {
      name: 'John Doe',
      email: 'john@example.com',
    }
    isLoading.value = false

    const { getByText } = render(UserMenuButton, { global: { stubs } })

    expect(getByText('John Doe')).toBeInTheDocument()
    expect(getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders user picture when available', () => {
    user.value = {
      name: 'Jane',
      picture: 'https://example.com/avatar.jpg',
    }

    const { getByRole } = render(UserMenuButton, { global: { stubs } })
    const img = getByRole('img')

    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(img).toHaveAttribute('alt', 'Jane')
  })

  it('uses placeholder image when no picture', () => {
    user.value = { name: 'Test' }

    const { getByRole } = render(UserMenuButton, { global: { stubs } })
    const img = getByRole('img')

    expect(img.getAttribute('src')).toContain('data:image/svg+xml')
  })

  it('replaces broken image with placeholder on error', async () => {
    user.value = {
      name: 'Test',
      picture: 'https://broken-url.com/avatar.jpg',
    }

    const { getByRole } = render(UserMenuButton, { global: { stubs } })
    const img = getByRole('img')

    await fireEvent.error(img)

    expect(img.getAttribute('src')).toContain('data:image/svg+xml')
  })

  it('calls logout from the dropdown item', async () => {
    logout.mockReset()
    user.value = { name: 'Test' }
    isLoading.value = false

    const { getByRole } = render(UserMenuButton, { global: { stubs } })

    await fireEvent.click(getByRole('button', { name: /log out/i }))

    expect(logout).toHaveBeenCalled()
  })
})

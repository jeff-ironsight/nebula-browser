import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Login from '../Login.vue'

const stubs = {
  LoginButton: {
    template: '<button>Log In</button>',
  },
}

describe('Login', () => {
  it('renders the login prompt and button', () => {
    const { getByText, getByRole, getByAltText } = render(Login, {
      global: { stubs },
    })

    expect(
      getByText(/get started by signing in to your/i, { exact: false }),
    ).toBeInTheDocument()
    expect(getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(getByAltText('Nebula Logo')).toBeInTheDocument()
  })

  it('hides image on error', async () => {
    const { getByAltText } = render(Login, {
      global: { stubs },
    })
    const img = getByAltText('Nebula Logo')

    await fireEvent.error(img)

    expect(img).toHaveStyle({ display: 'none' })
  })
})

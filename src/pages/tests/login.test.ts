import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Login from '../Login.vue'

describe('Login', () => {
  it('renders the login prompt and button', () => {
    const { getByText, getByRole, getByAltText } = render(Login, {
      global: {
        stubs: {
          LoginButton: {
            template: '<button>Log In</button>',
          },
        },
      },
    })

    expect(
      getByText(/get started by signing in to your/i, { exact: false }),
    ).toBeInTheDocument()
    expect(getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(getByAltText('Nebula Logo')).toBeInTheDocument()
  })
})

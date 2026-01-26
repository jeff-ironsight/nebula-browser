import { render } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import ErrorPage from '../Error.vue'

describe('Error', () => {
  it('shows a message when provided', () => {
    const { getByText } = render(ErrorPage, {
      props: {
        message: 'Network went dark',
      },
    })

    expect(getByText('Network went dark')).toBeInTheDocument()
  })

  it('omits the message when not provided', () => {
    const { queryByText } = render(ErrorPage)

    expect(queryByText('Network went dark')).not.toBeInTheDocument()
  })
})

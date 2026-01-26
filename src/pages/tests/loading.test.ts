import { render } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import Loading from '../Loading.vue'

describe('Loading', () => {
  it('renders the loading state', () => {
    const { getByText } = render(Loading)

    expect(getByText('Loading...')).toBeInTheDocument()
  })
})

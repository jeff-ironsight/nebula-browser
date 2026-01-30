import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Loading from '../Loading.vue'

describe('Loading', () => {
  it('renders the loading state', () => {
    const { getByText } = render(Loading)

    expect(getByText('Loading...')).toBeInTheDocument()
  })
})

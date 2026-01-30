import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import DebugLogSheet from '../DebugLogSheet.vue'

describe('DebugLogSheet', () => {
  const stubs = {
    Sheet: { template: '<div><slot /></div>' },
    SheetTrigger: { template: '<button><slot /></button>' },
    SheetContent: { template: '<div><slot /></div>' },
    SheetHeader: { template: '<div><slot /></div>' },
    SheetTitle: { template: '<h2><slot /></h2>' },
    SheetDescription: { template: '<p><slot /></p>' },
    Icon: { template: '<span />' },
  }

  it('renders empty state', () => {
    const { getByText } = render(DebugLogSheet, {
      props: { gatewayLog: [] },
      global: { stubs },
    })

    expect(getByText('No log entries yet.')).toBeInTheDocument()
  })

  it('renders log lines', () => {
    const { getByText, queryByText } = render(DebugLogSheet, {
      props: { gatewayLog: ['line one', 'line two'] },
      global: { stubs },
    })

    expect(queryByText('No log entries yet.')).not.toBeInTheDocument()
    expect(getByText('line one')).toBeInTheDocument()
    expect(getByText('line two')).toBeInTheDocument()
  })
})

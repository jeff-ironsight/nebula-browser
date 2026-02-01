import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import MessageComposer from '../MessageComposer.vue'

describe('MessageComposer', () => {
  it('emits update and submit events', async () => {
    const onUpdate = vi.fn()
    const onSubmit = vi.fn()

    const { getByPlaceholderText, getByRole } = render(MessageComposer, {
      props: {
        modelValue: '',
        activeChannelName: 'general',
        'onUpdate:modelValue': onUpdate,
        onSubmit,
      },
    })

    const textarea = getByPlaceholderText('Message #general')
    await fireEvent.update(textarea, 'Hello world')
    expect(onUpdate).toHaveBeenCalledWith('Hello world')

    const button = getByRole('button', { name: /send/i })
    await fireEvent.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('submits on Enter key', async () => {
    const onSubmit = vi.fn()

    const { getByPlaceholderText } = render(MessageComposer, {
      props: {
        modelValue: '',
        activeChannelName: 'general',
        onSubmit,
      },
    })

    const textarea = getByPlaceholderText('Message #general')
    await fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('does not submit on Shift+Enter', async () => {
    const onSubmit = vi.fn()

    const { getByPlaceholderText } = render(MessageComposer, {
      props: {
        modelValue: '',
        activeChannelName: 'general',
        onSubmit,
      },
    })

    const textarea = getByPlaceholderText('Message #general')
    await fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

    expect(onSubmit).not.toHaveBeenCalled()
  })
})

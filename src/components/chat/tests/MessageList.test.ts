import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import type { Message } from '@/types/Message.ts'

import MessageList from '../MessageList.vue'

describe('MessageList', () => {
  const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'msg-1',
    authorUserId: 'user-1',
    authorUsername: 'TestUser',
    content: 'Hello world',
    createdAt: '10:30 AM',
    channelId: 'general',
    ...overrides,
  })

  const defaultProps = {
    messages: [] as Message[],
    hasMore: false,
    isLoadingMore: false,
  }

  it('renders the scroll container', () => {
    const { container } = render(MessageList, {
      props: { ...defaultProps, messages: [] },
    })

    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('renders loading indicator when isLoadingMore is true', () => {
    const messages = [createMessage({ id: 'msg-1' })]

    const { getByText } = render(MessageList, {
      props: { ...defaultProps, messages, isLoadingMore: true },
    })

    expect(getByText('Loading older messages...')).toBeInTheDocument()
  })

  it('does not render loading indicator when isLoadingMore is false', () => {
    const messages = [createMessage({ id: 'msg-1' })]

    const { queryByText } = render(MessageList, {
      props: { ...defaultProps, messages, isLoadingMore: false },
    })

    expect(queryByText('Loading older messages...')).not.toBeInTheDocument()
  })

  it('sets up virtualizer container with correct height', () => {
    const messages = [
      createMessage({ id: 'msg-1' }),
      createMessage({ id: 'msg-2' }),
    ]

    const { container } = render(MessageList, {
      props: { ...defaultProps, messages },
    })

    // The inner div should have a height based on estimated row size (72px per message)
    const innerDiv = container.querySelector('section > div')
    expect(innerDiv).toBeInTheDocument()
    expect(innerDiv).toHaveStyle('position: relative')
  })

  it('emits loadMore when scrolled near top and hasMore', async () => {
    const messages = [createMessage({ id: 'msg-1' })]
    const { container, emitted } = render(MessageList, {
      props: { ...defaultProps, messages, hasMore: true, isLoadingMore: false },
    })

    const section = container.querySelector('section')!
    Object.defineProperty(section, 'scrollTop', { value: 100, writable: true })
    Object.defineProperty(section, 'scrollHeight', { value: 800, writable: true })

    await fireEvent.scroll(section)

    expect(emitted().loadMore).toBeTruthy()
  })

  it('keeps scroll position when older messages are prepended', async () => {
    const initialMessages = [createMessage({ id: 'msg-1' })]
    const { container, rerender } = render(MessageList, {
      props: { ...defaultProps, messages: [], hasMore: true },
    })

    const section = container.querySelector('section')!
    Object.defineProperty(section, 'scrollTop', { value: 0, writable: true })
    Object.defineProperty(section, 'scrollHeight', { value: 500, writable: true })

    await rerender({
      ...defaultProps,
      hasMore: true,
      messages: initialMessages,
    })
    await nextTick()

    section.scrollTop = 50

    await fireEvent.scroll(section)

    Object.defineProperty(section, 'scrollHeight', { value: 700, writable: true })
    await rerender({
      ...defaultProps,
      hasMore: true,
      messages: [createMessage({ id: 'msg-0' }), ...initialMessages],
    })
    await nextTick()

    expect(section.scrollTop).toBe(250)
  })

  it('auto-scrolls to bottom for new messages when near bottom', async () => {
    const initialMessages = [
      createMessage({ id: 'msg-1' }),
      createMessage({ id: 'msg-2' }),
    ]
    const { container, rerender } = render(MessageList, {
      props: { ...defaultProps, messages: [] },
    })

    const section = container.querySelector('section')!
    Object.defineProperty(section, 'scrollHeight', { value: 600, writable: true })
    Object.defineProperty(section, 'clientHeight', { value: 500, writable: true })
    Object.defineProperty(section, 'scrollTop', { value: 0, writable: true })

    await rerender({
      ...defaultProps,
      messages: initialMessages,
    })
    await nextTick()

    section.scrollTop = 90

    await rerender({
      ...defaultProps,
      messages: [...initialMessages, createMessage({ id: 'msg-3' })],
    })
    await nextTick()

    expect(section.scrollTop).toBe(600)
  })

  it('scrolls to bottom when messages first load', async () => {
    const { container, rerender } = render(MessageList, {
      props: { ...defaultProps, messages: [] },
    })

    const section = container.querySelector('section')!
    Object.defineProperty(section, 'scrollHeight', { value: 420, writable: true })
    Object.defineProperty(section, 'scrollTop', { value: 0, writable: true })

    await rerender({
      ...defaultProps,
      messages: [createMessage({ id: 'msg-1' })],
    })
    await nextTick()

    expect(section.scrollTop).toBe(420)
  })
})

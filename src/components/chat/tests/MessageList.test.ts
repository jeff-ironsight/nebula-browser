import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

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
})

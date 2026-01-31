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
    time: '10:30 AM',
    channelId: 'general',
    ...overrides,
  })

  it('renders empty list when no messages', () => {
    const { container } = render(MessageList, {
      props: { messages: [] },
    })

    expect(container.querySelector('.messages')).toBeInTheDocument()
    expect(container.querySelectorAll('.message')).toHaveLength(0)
  })

  it('renders messages with author and content', () => {
    const messages = [
      createMessage({ id: 'msg-1', authorUsername: 'Alice', content: 'Hello!' }),
      createMessage({ id: 'msg-2', authorUsername: 'Bob', content: 'Hi there!' }),
    ]

    const { getByText } = render(MessageList, {
      props: { messages },
    })

    expect(getByText('Alice')).toBeInTheDocument()
    expect(getByText('Hello!')).toBeInTheDocument()
    expect(getByText('Bob')).toBeInTheDocument()
    expect(getByText('Hi there!')).toBeInTheDocument()
  })

  it('renders message time', () => {
    const messages = [createMessage({ time: '2:45 PM' })]

    const { getByText } = render(MessageList, {
      props: { messages },
    })

    expect(getByText('2:45 PM')).toBeInTheDocument()
  })

  it('applies stagger animation style based on index', () => {
    const messages = [
      createMessage({ id: 'msg-1' }),
      createMessage({ id: 'msg-2' }),
      createMessage({ id: 'msg-3' }),
    ]

    const { container } = render(MessageList, {
      props: { messages },
    })

    const messageElements = container.querySelectorAll('.message')
    expect(messageElements[0]).toHaveStyle('--stagger: 0ms')
    expect(messageElements[1]).toHaveStyle('--stagger: 40ms')
    expect(messageElements[2]).toHaveStyle('--stagger: 80ms')
  })
})

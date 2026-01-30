export interface SocketClientOptions<T> {
  url: () => string
  onMessage: (payload: T) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: () => void
}

export const createSocketClient = <T>(options: SocketClientOptions<T>) => {
  let socket: WebSocket | null = null

  const connect = () => {
    socket = new WebSocket(options.url())
    socket.addEventListener('open', () => options.onOpen?.())
    socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data)) as T
      options.onMessage(payload)
    })
    socket.addEventListener('close', () => options.onClose?.())
    socket.addEventListener('error', () => options.onError?.())
  }

  const disconnect = () => {
    if (socket) {
      socket.close()
      socket = null
    }
  }

  const isOpen = () => socket?.readyState===WebSocket.OPEN

  const send = (payload: T) => {
    if (socket?.readyState!==WebSocket.OPEN) {
      return false
    }
    socket.send(JSON.stringify(payload))
    return true
  }

  return {
    connect,
    disconnect,
    isOpen,
    send,
  }
}

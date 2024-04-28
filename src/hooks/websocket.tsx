import { websocketAuthTokenAtom } from '@/stores/user'
import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import io from 'socket.io-client'

export enum WebsocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

export const useWebsocket = (params: {
  onConnected?: (ref: ReturnType<typeof io>) => void
  onDisconnected?: (ref: ReturnType<typeof io>) => void
}) => {
  const [websocketAuthToken, setWebsocketAuthToken] = useAtom(
    websocketAuthTokenAtom
  )
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  const handlePageUnload = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }
  useEffect(() => {
    console.log(websocketAuthToken)
    window.addEventListener('beforeunload', handlePageUnload)
    if (websocketAuthToken) {
      const socket = (socketRef.current = io('http://100.98.108.126:1003', {
        query: {
          token: websocketAuthToken.token
        },
        transports: ['polling']
      }))

      socket.on('connect', () => {
        params.onConnected?.(socket)
      })
      socket.on('connect_error', (err) => {
        if (err.message === 'xhr poll error') {
          // 重新连接
          setTimeout(() => setWebsocketAuthToken(null), 1000)
        }
      })
      socket.on('unauthorized', (error) => {
        console.error('Unauthorized:', error.message) // 打印错误消息
        // 在此处执行处理未经授权的操作，例如重新连接或提示用户重新登录
        setWebsocketAuthToken(null) // 清除令牌
      })
      socket.on('private', (content: unknown) => {
        console.log(content)
      })
      socket.on('disconnect', (reason) => {
        console.log(reason)
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket.connect()
        }
        params.onDisconnected?.(socket)
      })
      socket.connect()
    }
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload)
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [websocketAuthToken])
}

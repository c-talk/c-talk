import { websocketAuthTokenAtom } from '@/stores/user'
import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

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
  const websocketAuthToken = useAtomValue(websocketAuthTokenAtom)
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  useEffect(() => {
    console.log(websocketAuthToken)
    if (websocketAuthToken) {
      const socket = (socketRef.current = io('http://100.98.108.126:1003', {
        query: {
          token: websocketAuthToken.token
        }
      }))
      socket.connect()
      socket.on('connect', () => {
        params.onConnected?.(socket)
      })
      socket.on('disconnect', () => {
        params.onDisconnected?.(socket)
      })
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [websocketAuthToken])
}

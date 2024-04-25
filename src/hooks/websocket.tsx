import { userAtom } from '@/stores/user'
import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export const useWebsocket = (params: {
  onConnected?: (ref: ReturnType<typeof io>) => void
}) => {
  const [token] = useAtom(userAtom)
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  useEffect(() => {
    if (token) {
      socketRef.current = io('http://localhost:3001', {
        auth: {
          token
        }
      })
      params.onConnected?.(socketRef.current)
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [token])
}

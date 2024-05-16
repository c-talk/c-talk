import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { chatListTryUpdateWhileNewMessageAtom } from '@/stores/home'
import { socketIOIndicatorAtom } from '@/stores/socket-io'
import { userAtom, websocketAuthTokenAtom } from '@/stores/user'
import { ChatType, Message } from '@/types/globals'
import { useLatest, useMemoizedFn } from 'ahooks'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { useChatMeta } from './apis/chat'
import useNotification from './use-notification'
import useGlobalMutation from './useGlobalMutation'

export enum SocketIOState {
  CONNECTING,
  CONNECTED, // 用于展示成功连接的状态
  IDLE, // connected
  RECONNECTING,
  CLOSED
}

export type SocketIOInstance = ReturnType<typeof io>

export const useSocketIO = (params: {
  onConnected?: (ref: SocketIOInstance) => void
  onDisconnected?: (ref: SocketIOInstance) => void
}) => {
  const [websocketAuthToken, setWebsocketAuthToken] = useAtom(
    websocketAuthTokenAtom
  )
  const socketRef = useRef<SocketIOInstance | null>(null)
  const setSocketIOState = useSetAtom(socketIOIndicatorAtom)
  const handlePageUnload = useMemoizedFn(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  })

  useEffect(() => {
    window.addEventListener('beforeunload', handlePageUnload)
    if (websocketAuthToken) {
      const socket = (socketRef.current = io(
        import.meta.env.VITE_SOCKET_IO_ENDPOINT,
        {
          query: {
            token: websocketAuthToken.token
          },
          withCredentials: true // 传递 Cookie，用于 K8s Ingress 粘性会话
          // transports: ['polling']
          // transports: ['websocket', 'polling']
        }
      ))

      socket.on('connect', () => {
        setSocketIOState(SocketIOState.CONNECTED)
        params.onConnected?.(socket)
        setTimeout(() => setSocketIOState(SocketIOState.IDLE), 1000)
      })
      socket.on('connect_error', (err) => {
        console.error(`socket.io: connect_error: ${err.message}`)
        if (err.message === 'xhr poll error') {
          // 重新连接
          setTimeout(() => setWebsocketAuthToken(null), 2000)
        }
        setSocketIOState(SocketIOState.CLOSED)
      })
      socket.on('reconnect_attempt', () => {
        setSocketIOState(SocketIOState.RECONNECTING)
      })
      socket.on('unauthorized', (error) => {
        console.error('Unauthorized:', error.message) // 打印错误消息
        // 在此处执行处理未经授权的操作，例如重新连接或提示用户重新登录
        setWebsocketAuthToken(null) // 清除令牌
      })

      socket.on('disconnect', (reason) => {
        console.log(reason)
        setSocketIOState(SocketIOState.CLOSED)
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          setSocketIOState(SocketIOState.CONNECTING)
          socket.connect()
        }
        params.onDisconnected?.(socket)
      })
      setSocketIOState(SocketIOState.CONNECTING)
      socket.connect()
    } else {
      setSocketIOState(SocketIOState.CLOSED)
    }
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload)
      if (socketRef.current) {
        socketRef.current.disconnect()
        setSocketIOState(SocketIOState.CLOSED)
      }
    }
  }, [websocketAuthToken])
}

export function useSocketIOWithHandler() {
  const setSocketIOState = useSetAtom(socketIOIndicatorAtom)
  const newMessageReceived = useSetAtom(chatListTryUpdateWhileNewMessageAtom)
  const mutate = useGlobalMutation()
  const notification = useNotification()
  const user = useAtomValue(userAtom)
  const userLatest = useLatest(user)

  const getChatMeta = useChatMeta()

  const socketRef = useRef<SocketIOInstance | null>(null)
  const toast = useToast()
  const reconnect = useMemoizedFn(() => {
    if (socketRef.current) {
      socketRef.current.connect()
      setSocketIOState(SocketIOState.CONNECTING)
      return
    }
    toast.toast({
      title: 'Socket.IO',
      description: '与服务端的链接未初始化，请重载页面。',
      variant: 'destructive',
      action: (
        <ToastAction
          altText="Try again"
          onClick={() => {
            window.location.reload()
          }}
        >
          重载页面
        </ToastAction>
      )
    })
  })

  // TODO: 为通知获取聊天元数据提供缓存
  useSocketIO({
    onConnected: (socket) => {
      socket.on('private', (content: Message | string) => {
        console.log(content)
        if (typeof content === 'string') {
          content = JSON.parse(content) as Message
        }
        // 处理私有消息
        mutate(
          (key) =>
            typeof key === 'string' &&
            key.includes(`/messages/${content.sender}`) // Sender should be the private chat ID
        )
        newMessageReceived({
          ...content,
          chatType: ChatType.Private
        })
        getChatMeta
          .execute(content.sender, ChatType.Private)
          .then((meta) => {
            notification.showNotification({
              title: meta.name,
              body: content.content,
              icon: getResourceUrl(meta.avatar)
            })
          })
          .catch(console.error)
      })
      socket.on('group', (content: Message | string) => {
        console.log(content)
        if (typeof content === 'string') {
          content = JSON.parse(content) as Message
        }
        // 处理群组消息
        mutate(
          (key) =>
            typeof key === 'string' &&
            key.includes(`/messages/${content.receiver}`) // Receiver should be the group chat ID
        )
        newMessageReceived({
          ...content,
          chatID: content.receiver,
          chatType: ChatType.Group
        })
        Promise.all([
          getChatMeta.execute(content.receiver, ChatType.Group),
          getChatMeta.execute(content.sender, ChatType.Private)
        ])
          .then(([groupMeta, userMeta]) => {
            if (userLatest.current?.id !== content.sender) {
              notification.showNotification({
                title: groupMeta.name,
                body: `${userMeta.name}: ${content.content}`,
                icon: getResourceUrl(groupMeta.avatar)
              })
            }
          })
          .catch(console.error)
      })
    }
  })
  return {
    reconnect
  }
}

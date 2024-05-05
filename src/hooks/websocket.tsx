import { chatListTryUpdateWhileNewMessageAtom } from '@/stores/home'
import { websocketAuthTokenAtom } from '@/stores/user'
import { ChatType, Message } from '@/types/globals'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { useChatMeta } from './apis/chat'
import useNotification from './use-notification'
import useGlobalMutation from './useGlobalMutation'

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
      const socket = (socketRef.current = io(
        import.meta.env.VITE_SOCKET_IO_ENDPOINT,
        {
          query: {
            token: websocketAuthToken.token
          }
          // transports: ['polling']
        }
      ))

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

export function useWebsocketWithHandler() {
  const newMessageReceived = useSetAtom(chatListTryUpdateWhileNewMessageAtom)
  const mutate = useGlobalMutation()
  const notification = useNotification()
  const getChatMeta = useChatMeta()
  // TODO: 为通知获取聊天元数据提供缓存
  useWebsocket({
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
            notification.showNotification({
              title: groupMeta.name,
              body: `${userMeta.name}: ${content.content}`,
              icon: getResourceUrl(groupMeta.avatar)
            })
          })
          .catch(console.error)
      })
    }
  })
}

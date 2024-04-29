import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import dayjs from 'dayjs'
import { useMemo, type MouseEventHandler } from 'react'

import { useFriendsListSWR, useUserById } from '@/hooks/apis/chat'
import {
  chatListAtom,
  chatListTryAddAtom,
  chatRoomIDAtom,
  chatRoomTypeAtom,
  operationItemAtom
} from '@/stores/home'
import { ChatType, Message, MessageType } from '@/types/globals'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import useSWR from 'swr'
import styles from './chat-list.module.scss'
import { OperationType } from './layout'
import UserItem from './user-item'

export type ChatItem = {
  meta: ChatItemChatMeta
  message: Message | null
  ts: number // timestamp
}

export type ChatItemChatMeta = {
  chatID: string
  chatType: ChatType
}

interface ChatItemMeta extends ChatItemChatMeta {
  name: string
  avatar: string
}

export interface ChatItemWithFetcherProps extends ChatItem {
  selected?: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}
export interface ChatItemProps extends ChatItemWithFetcherProps {
  meta: ChatItemMeta
}

export function ChatItemWithFetcher(props: ChatItemWithFetcherProps) {
  const { meta } = props
  // TODO: add group chat
  const { execute } = useUserById()
  const { data, isLoading, error } = useSWR(`/user/${meta.chatID}`, () =>
    execute(meta.chatID)
  )
  if (isLoading)
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        加载中
      </div>
    )
  if (error)
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        加载失败
      </div>
    )
  return (
    <ChatItem
      {...props}
      meta={{
        ...meta,
        name: data!.result.nickName,
        avatar: data!.result.avatar
      }}
    />
  )
}

export function ChatItem(props: ChatItemProps) {
  const { selected = false, meta, ts, message, className, onClick } = props
  const formattedTime = useMemo(() => dayjs(ts).format('HH:mm'), [ts])

  return (
    <div
      className={cn(styles['chat-item'], selected && styles.active, className)}
      onClick={onClick}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={getResourceUrl(meta.avatar)} draggable={false} />
        <AvatarFallback>{meta.name}</AvatarFallback>
      </Avatar>
      <div className="flex-1 flex flex-col">
        <div className="flex w-full justify-between">
          <div className="font-bold text-sm">{meta.name}</div>
          <div className="text-xs text-slate-600">{formattedTime}</div>
        </div>
        <div className="text-xs text-slate-600">
          {message &&
            (message.type === MessageType.Text ? message.content : '[图片]')}
        </div>
      </div>
    </div>
  )
}

export type ChatListProps = {
  className?: string
}

export default function ChatList({ className }: { className?: string }) {
  const type = useAtomValue(operationItemAtom)
  if (type === OperationType.Chat) {
    return <Chats className={className} />
  } else if (type === OperationType.Contacts) {
    return <ContactsList className={className} />
  }
}

export function Chats(props: ChatListProps) {
  const { className } = props
  const chats = useAtomValue(chatListAtom)
  const [chatRoomId, setChatRoomId] = useAtom(chatRoomIDAtom)

  return (
    <ScrollArea className={cn(styles['chat-list'], className)}>
      {chats.map((chat) => (
        <ChatItemWithFetcher
          key={chat.meta.chatID}
          selected={chatRoomId === chat.meta.chatID}
          onClick={() => {
            setChatRoomId(chat.meta.chatID)
          }}
          {...chat}
        />
      ))}
    </ScrollArea>
  )
}

export function ContactsList({ className }: { className?: string }) {
  const { isLoading, data } = useFriendsListSWR()
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const setSelectedOperationItem = useSetAtom(operationItemAtom)
  const tryAddChatToChatList = useSetAtom(chatListTryAddAtom)
  if (isLoading) {
    return <div>加载中</div>
  }
  return (
    <ScrollArea className={cn(styles['chat-list'], className)}>
      {data?.result?.map((item) => (
        <UserItem
          key={item.id}
          userID={item.friendId}
          onClick={(o) => {
            console.log(o)
            setChatRoomID(o.id)
            setChatRoomType(ChatType.Private)
            setSelectedOperationItem(OperationType.Chat)
            tryAddChatToChatList({
              chatID: o.id,
              chatType: ChatType.Private
            })
          }}
        />
      ))}
    </ScrollArea>
  )
}

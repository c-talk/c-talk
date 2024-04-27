import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import dayjs from 'dayjs'
import { useMemo, useState, type MouseEventHandler } from 'react'

import { useFriendsListSWR } from '@/hooks/apis/chat'
import { ChatListAtom, operationItemAtom } from '@/stores/home'
import { useAtomValue } from 'jotai'
import styles from './chat-list.module.scss'
import { OperationType } from './layout'
import UserItem from './user-item'

export type ChatItem = {
  selected?: boolean
  name: string
  avatar?: string
  time: string
  message: string
}

export interface ChatItemProps extends ChatItem {
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function ChatItem(props: ChatItemProps) {
  const {
    selected = false,
    name,
    avatar,
    time,
    message,
    className,
    onClick
  } = props
  const formattedTime = useMemo(() => dayjs(time).format('HH:mm'), [time])

  return (
    <div
      className={cn(styles['chat-item'], selected && styles.active, className)}
      onClick={onClick}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatar} draggable={false} />
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>
      <div className="flex-1 flex flex-col">
        <div className="flex w-full justify-between">
          <div className="font-bold text-sm">{name}</div>
          <div className="text-xs text-slate-600">{formattedTime}</div>
        </div>
        <div className="text-xs text-slate-600">{message}</div>
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
  const chats = useAtomValue(ChatListAtom)
  const [selectedItem, setSelectedItem] = useState<number>(0)

  return (
    <ScrollArea className={cn(styles['chat-list'], className)}>
      {chats.map((chat, index) => (
        <ChatItem
          key={index}
          selected={selectedItem === index}
          onClick={() => {
            setSelectedItem(index)
          }}
          {...chat}
        />
      ))}
    </ScrollArea>
  )
}

export function ContactsList({ className }: { className?: string }) {
  const { isLoading, data } = useFriendsListSWR()
  if (isLoading) {
    return <div>加载中</div>
  }
  return (
    <ScrollArea className={cn(styles['chat-list'], className)}>
      {data?.result.map((item) => (
        <UserItem key={item.id} userID={item.friendId} />
      ))}
    </ScrollArea>
  )
}

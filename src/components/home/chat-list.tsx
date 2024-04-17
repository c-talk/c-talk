import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import dayjs from 'dayjs'
import { useMemo, useState, type MouseEventHandler } from 'react'

import styles from './chat-list.module.scss'

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
  chats: ChatItem[]
  className?: string
}

export default function ChatList(props: ChatListProps) {
  const { className } = props
  const chats = useMemo(() => props.chats, [props.chats])
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

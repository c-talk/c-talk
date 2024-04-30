import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ScrollArea,
  ScrollAreaWithoutViewport
} from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import dayjs from 'dayjs'
import { useMemo, type MouseEventHandler } from 'react'

import {
  useFriendsListSWR,
  useGroupById,
  useJoinedGroups
} from '@/hooks/apis/chat'
import { useUserById } from '@/hooks/apis/users'
import {
  chatListAtom,
  chatListTryAddAtom,
  chatRoomIDAtom,
  chatRoomTypeAtom,
  operationItemAtom
} from '@/stores/home'

import { ChatType, Message, MessageType } from '@/types/globals'
import { ScrollAreaViewport } from '@radix-ui/react-scroll-area'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import useInfiniteScroll from 'react-infinite-scroll-hook'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import styles from './chat-list.module.scss'
import CreateGroupDialog from './group-create-dialog'
import GroupItem from './group-item'
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
  if (meta.chatType === ChatType.Private) {
    return <ChatItemWithUserFetcher {...props} />
  } else if (meta.chatType === ChatType.Group) {
    return <ChatItemWithGroupFetcher {...props} />
  }
}

export function ChatItemWithGroupFetcher(props: ChatItemWithFetcherProps) {
  const { meta } = props
  const { execute } = useGroupById()
  const { data, isLoading, error } = useSWR(`/group/${meta.chatID}`, () =>
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
        name: data!.result.group.name,
        avatar: data!.result.group.avatar
      }}
    />
  )
}

export function ChatItemWithUserFetcher(props: ChatItemWithFetcherProps) {
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
  const getUser = useUserById()
  const { data: userData } = useSWR(
    () =>
      meta.chatType === ChatType.Group && message
        ? `/user/${message.sender}`
        : null,
    () => getUser.execute(message!.sender)
  )
  return (
    <div
      className={cn(styles['chat-item'], selected && styles.active, className)}
      onClick={onClick}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage
          className="object-cover"
          src={getResourceUrl(meta.avatar)}
          draggable={false}
        />
        <AvatarFallback>{meta.name}</AvatarFallback>
      </Avatar>
      <div className="flex-1 flex flex-col">
        <div className="flex w-full justify-between">
          <div className="font-bold text-sm">{meta.name}</div>
          <div className="text-xs text-slate-600">{formattedTime}</div>
        </div>
        <div className="text-xs text-slate-600">
          {message
            ? message.type === MessageType.Text
              ? meta.chatType === ChatType.Group
                ? userData?.result?.nickName
                  ? `${userData?.result?.nickName}: ${message.content}`
                  : message.content
                : message.content
              : '[图片]'
            : '　'}
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
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  return (
    <ScrollArea className={cn(styles['chat-list'], className)}>
      {chats.map((chat) => (
        <ChatItemWithFetcher
          key={chat.meta.chatID}
          selected={chatRoomId === chat.meta.chatID}
          onClick={() => {
            setChatRoomId(chat.meta.chatID)
            setChatRoomType(chat.meta.chatType)
          }}
          {...chat}
        />
      ))}
    </ScrollArea>
  )
}

export function FriendsList({ className }: { className?: string }) {
  const { isLoading, data } = useFriendsListSWR()
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const setSelectedOperationItem = useSetAtom(operationItemAtom)
  const tryAddChatToChatList = useSetAtom(chatListTryAddAtom)
  if (isLoading) {
    return <div>加载中</div>
  }

  return (
    <ScrollArea className={cn(styles['chat-list'], 'flex-1', className)}>
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

export function GroupList({ className }: { className?: string }) {
  const tryAddChatToChatList = useSetAtom(chatListTryAddAtom)
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const setSelectedOperationItem = useSetAtom(operationItemAtom)

  const joinedGroups = useJoinedGroups()
  const pageSize = 20
  const { data, isLoading, error, size, setSize } = useSWRInfinite(
    (index, prev) => {
      if (prev && !prev.result.items?.length) return null
      return `/joined/groups?page=${index + 1}&pageSize=${pageSize}`
    },
    (url) => {
      const parsedURL = new URL(url, window.location.href)
      const page = Number(parsedURL.searchParams.get('page'))
      return joinedGroups.execute({ pageNum: page, pageSize })
    },
    {
      revalidateOnFocus: true,
      revalidateAll: true
    }
  )
  const total = useMemo(() => data?.[0]?.result.total || 0, [data])
  const hasNextPage = useMemo(() => {
    console.log(size)
    return total > size * pageSize
  }, [total, size])
  const onLoadMore = () => {
    setSize((size) => size + 1)
  }
  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    disabled: !!error,
    hasNextPage,
    onLoadMore
    // rootMargin: '400px 0px 0px 0px'
  })
  return (
    <ScrollAreaWithoutViewport
      className={cn(styles['chat-list'], 'flex-1', className)}
    >
      <ScrollAreaViewport ref={rootRef}>
        {error && <div>加载失败</div>}
        {data?.map((page) =>
          page.result.items.map((item) => {
            return (
              <GroupItem
                key={item.id}
                group={item}
                onClick={(group) => {
                  setChatRoomID(group)
                  setChatRoomType(ChatType.Group)
                  tryAddChatToChatList({
                    chatID: group,
                    chatType: ChatType.Group
                  })
                  setSelectedOperationItem(OperationType.Chat)
                }}
              />
            )
          })
        )}
        {hasNextPage && (
          <div className="flex items-center justify-center" ref={infiniteRef}>
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
      </ScrollAreaViewport>
    </ScrollAreaWithoutViewport>
  )
}

export function ContactsList({ className }: { className?: string }) {
  return (
    <Tabs defaultValue="friends" className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="friends">好友</TabsTrigger>
        <TabsTrigger value="groups">群组</TabsTrigger>
      </TabsList>
      <TabsContent value="friends" className="flex-1">
        <FriendsList className={cn(className)} />
      </TabsContent>
      <TabsContent value="groups" className="flex-1 flex flex-col">
        <div className="flex-1">
          <GroupList className={cn(className)} />
        </div>

        <CreateGroupDialog>
          <button className="h-10 text-xs font-semibold bg-slate-100 border-t">
            创建群组
          </button>
        </CreateGroupDialog>
      </TabsContent>
    </Tabs>
  )
}

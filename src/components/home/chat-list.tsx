import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ScrollArea,
  ScrollAreaWithoutViewport
} from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dayjs from 'dayjs'
import { partition } from 'lodash-es'
import {
  useDeferredValue,
  useMemo,
  useState,
  type MouseEventHandler
} from 'react'

import {
  Friend,
  JoinedGroupVo,
  useFriendsList,
  useGroupById,
  useJoinedGroups,
  useLeaveGroup
} from '@/hooks/apis/chat'
import { useUserById } from '@/hooks/apis/users'
import {
  chatListSearchInputAtom,
  chatListTryAddAtom,
  chatRoomIDAtom,
  chatRoomTypeAtom,
  filteredChatListAtom,
  operationItemAtom,
  removeChatItemAtom,
  setChatItemNameAtom,
  setUnreadToReadAtom
} from '@/stores/home'

import { R } from '@/hooks/ofetch'
import { friendsAtom, userAtom } from '@/stores/user'
import { ChatType, Message, MessageType } from '@/types/globals'
import { ScrollAreaViewport } from '@radix-ui/react-scroll-area'
import { useMemoizedFn } from 'ahooks'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Dot, Loader2 } from 'lucide-react'
import useInfiniteScroll from 'react-infinite-scroll-hook'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import isEmail from 'validator/lib/isEmail'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../ui/context-menu'
import {
  AskDismissOrLeaveGroupAlertDialog,
  AskRemoveFriendAlertDialog
} from './chat-list-alert-dialog'
import styles from './chat-list.module.scss'
import CreateGroupDialog from './group-create-dialog'
import GroupItem from './group-item'
import { OperationType } from './layout'
import UserItem from './user-item'

export type ChatItem = {
  meta: ChatItemChatMeta
  name?: string // 当前仅用作排序
  unread: boolean // TODO: It should be number in the future
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
  const setName = useSetAtom(setChatItemNameAtom)
  const removeChatFromChatList = useSetAtom(removeChatItemAtom)
  const { data, isLoading, error } = useSWR(
    `/group/${meta.chatID}`,
    () => execute(meta.chatID),
    {
      onSuccess(data) {
        if (data.result?.group?.name) {
          setName({
            chatID: meta.chatID,
            name: data.result.group.name
          })
        } else {
          removeChatFromChatList(meta.chatID) // Remove the chat if the group does not exist
        }
      }
    }
  )
  if (isLoading)
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        加载中
      </div>
    )
  if (error) {
    console.log(error)
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        加载失败
      </div>
    )
  }
  if (!data?.result) {
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        群组不存在
      </div>
    )
  }
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
  const { execute } = useUserById()
  const setName = useSetAtom(setChatItemNameAtom)
  const removeChatFromChatList = useSetAtom(removeChatItemAtom)
  const { data, isLoading, error } = useSWR(
    `/user/${meta.chatID}`,
    () => execute(meta.chatID),
    {
      onSuccess(data) {
        if (data.result?.nickName) {
          setName({
            chatID: meta.chatID,
            name: data.result.nickName
          })
        } else {
          removeChatFromChatList(meta.chatID) // Remove the chat if the user does not exist
        }
      }
    }
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
  if (!data?.result) {
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        用户不存在
      </div>
    )
  }
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
  const {
    selected = false,
    meta,
    ts,
    message,
    className,
    onClick,
    unread
  } = props
  const formattedTime = useMemo(() => {
    const time = dayjs(ts)
    const now = dayjs()
    if (now.diff(time, 'day') === 0) {
      return time.format('HH:mm')
    } else if (now.diff(time, 'day') < 6) {
      return time.format('ddd')
    }
    return time.format('YYYY/MM/DD')
  }, [ts])
  const user = useAtomValue(userAtom)
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
        <div className="flex gap-2 items-center">
          <span className="flex-1 text-xs text-slate-600 line-clamp-1 text-ellipsis overflow-hidden">
            {message
              ? message.type === MessageType.Text
                ? meta.chatType === ChatType.Group
                  ? userData?.result?.nickName &&
                    userData?.result?.id !== user?.id
                    ? `${userData?.result?.nickName}: ${message.content}`
                    : message.content
                  : message.content
                : '[图片]'
              : '　'}
          </span>
          {unread && (
            <span className="text-[0.5rem]/[1rem] text-red-500">
              <Dot />
            </span>
          )}
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
  // const chats = useAtomValue(chatListAtom)
  const filteredChats = useAtomValue(filteredChatListAtom)
  const [chatRoomId, setChatRoomId] = useAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const setUnreadToRead = useSetAtom(setUnreadToReadAtom)
  const removeChatFromChatList = useSetAtom(removeChatItemAtom)
  return (
    <ScrollArea className={cn(styles['chat-list'], className)}>
      {filteredChats.map((chat) => (
        <ContextMenu key={chat.meta.chatID}>
          <ContextMenuTrigger>
            <ChatItemWithFetcher
              selected={chatRoomId === chat.meta.chatID}
              onClick={() => {
                setChatRoomId(chat.meta.chatID)
                setChatRoomType(chat.meta.chatType)
                setUnreadToRead(chat.meta.chatID)
              }}
              {...chat}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                if (chat.meta.chatID === chatRoomId) {
                  setChatRoomId('')
                  setChatRoomType(ChatType.Private)
                }
                removeChatFromChatList(chat.meta.chatID)
              }}
            >
              删除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </ScrollArea>
  )
}

export function FriendsList({ className }: { className?: string }) {
  const { execute } = useFriendsList()
  const setFriends = useSetAtom(friendsAtom)
  const searchInputValue = useAtomValue(chatListSearchInputAtom)
  const deferredSearchInputValue = useDeferredValue(searchInputValue)
  const { isLoading, data } = useSWR<R<Friend[]>>(
    [`/friends`, deferredSearchInputValue],
    ([, deferredSearchInputValue]) => {
      const params =
        !deferredSearchInputValue ||
        typeof deferredSearchInputValue !== 'string'
          ? undefined
          : isEmail(deferredSearchInputValue)
            ? {
                email: deferredSearchInputValue
              }
            : {
                nickName: deferredSearchInputValue
              }
      return execute(params)
    },
    {
      onSuccess: (data) => {
        setFriends(
          data.result
            ? Array.isArray(data.result)
              ? data.result
              : [data.result]
            : []
        )
      }
    }
  )
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const setSelectedOperationItem = useSetAtom(operationItemAtom)
  const tryAddChatToChatList = useSetAtom(chatListTryAddAtom)

  // 删除好友相关
  const [open, setOpen] = useState(false)
  const [friendIDToRemove, setFriendIDToRemove] = useState<string | null>(null)
  const onTryToRemoveFriend = useMemoizedFn((friendID: string) => {
    setFriendIDToRemove(friendID)
    setOpen(true)
  })

  return (
    <ScrollArea className={cn(styles['chat-list'], 'flex-1', className)}>
      <AskRemoveFriendAlertDialog
        open={open}
        onOpenChange={setOpen}
        friendID={friendIDToRemove}
      />
      {isLoading && (
        <div className="py-2 flex w-full items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
      {data?.result.map((item) => (
        <ContextMenu key={item.friendId}>
          <ContextMenuTrigger>
            <UserItem
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
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onTryToRemoveFriend(item.friendId)}>
              删除好友
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </ScrollArea>
  )
}

export function GroupList({ className }: { className?: string }) {
  const tryAddChatToChatList = useSetAtom(chatListTryAddAtom)
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const setSelectedOperationItem = useSetAtom(operationItemAtom)

  // 獲取群組列表
  const joinedGroups = useJoinedGroups()
  const pageSize = 20
  const filteredText = useAtomValue(chatListSearchInputAtom)
  const deferredFilteredText = useDeferredValue(filteredText)
  const { data, isLoading, error, size, setSize } = useSWRInfinite(
    (index, prev) => {
      if (prev && !prev.result?.items?.length) return null
      return `/joined/groups?page=${index + 1}&pageSize=${pageSize}&keyword=${deferredFilteredText}`
    },
    (url) => {
      const parsedURL = new URL(url, window.location.href)
      const page = Number(parsedURL.searchParams.get('page'))
      const keyword = parsedURL.searchParams.get('keyword')
      return joinedGroups.execute({
        pageNum: page,
        pageSize,
        groupName: keyword || undefined
      })
    },
    {
      revalidateOnFocus: true,
      revalidateAll: true
    }
  )
  const total = useMemo(() => data?.[0]?.result?.total || 0, [data])
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

  // 退群、解散群相關
  const user = useAtomValue(userAtom)
  const [open, setOpen] = useState(false)
  const [groupToLeaveOrDismiss, setGroupToLeaveOrDismiss] =
    useState<JoinedGroupVo | null>(null)
  const onTryToLeaveOrDismissGroup = useMemoizedFn((group: JoinedGroupVo) => {
    setGroupToLeaveOrDismiss(group)
    setOpen(true)
  })
  // NOTE: 本段落只是为了解决后端解散不移除群组的问题，实际上应该由后端解决
  const leaveGroup = useLeaveGroup()
  const onFilterOutGroupToLeave = useMemoizedFn(
    async (filteredOutData: JoinedGroupVo[]) => {
      console.log('开始清除失效群组...')
      const queue: Array<ReturnType<(typeof leaveGroup)['execute']>> = []
      for (const item of filteredOutData) {
        console.log('清除失效群组', item)
        queue.push(leaveGroup.execute(item.gid))
      }
      await Promise.all(queue)
      console.log('清除失效群组完成')
    }
  )
  const filteredData = useMemo(() => {
    if (!data) return []
    const filteredOutData: JoinedGroupVo[] = []
    const res = data.map((page) => {
      const [filtered, filterOut] = partition(
        page.result.items,
        (item) => item && !!item.gid && !!item.group
      )
      filteredOutData.push(...filterOut)
      return {
        ...page,
        result: {
          ...page.result,
          items: filtered
        }
      }
    })
    onFilterOutGroupToLeave(filteredOutData)
    return res
  }, [data])

  return (
    <ScrollAreaWithoutViewport
      className={cn(styles['chat-list'], 'flex-1', className)}
    >
      <ScrollAreaViewport ref={rootRef}>
        <AskDismissOrLeaveGroupAlertDialog
          open={open}
          onOpenChange={setOpen}
          joinedGroupVo={groupToLeaveOrDismiss}
        />
        {error && <div>加载失败</div>}
        {filteredData?.map((page) =>
          page.result?.items
            // .filter((item) => !!item && !!item.gid && !!item.group) // 为了避免出现关系不明的群组
            .map((item) => {
              return (
                <ContextMenu key={item.id}>
                  <ContextMenuTrigger>
                    <GroupItem
                      group={item.group}
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
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => onTryToLeaveOrDismissGroup(item)}
                    >
                      {item.group?.owner === user?.id ? '解散群组' : '退出群组'}
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
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

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import dayjs from 'dayjs'
import { Suspense, useMemo, useState } from 'react'
// Icons
import { chatRoomIDAtom, chatRoomTypeAtom } from '@/stores/home'
import { useAtom, useAtomValue } from 'jotai'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

import GgSpinner from '~icons/gg/spinner'
import SolarCloseCircleBold from '~icons/solar/close-circle-bold'
import SolarGalleryMinimalisticLinear from '~icons/solar/gallery-minimalistic-linear'
import SolarSmileCircleLinear from '~icons/solar/smile-circle-linear'

import { useAddFriend, useChatLogs, useUserSearch } from '@/hooks/apis/chat'
import { friendsAtom, userAtom } from '@/stores/user'
import { MessageType } from '@/types/globals'
import { Loader2 } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import styles from './chat-viewer.module.scss'

export function NoSelectedChat() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <IconSolarInboxArchiveOutline className="text-4xl text-slate-400" />
      <p className="text-xs font-semibold text-slate-400">
        Please select a chat
      </p>
    </div>
  )
}

export function ChatInput() {
  const [message, setMessage] = useState('')
  return (
    <div className="h-full flex flex-col">
      <div className="h-8 flex items-center gap-2 px-2">
        <SolarSmileCircleLinear className="text-lg text-slate-400" />
        <SolarGalleryMinimalisticLinear className="text-lg text-slate-400" />
      </div>
      <div className="flex-1 flex flex-col">
        <textarea
          className="flex-1 w-full h-full px-2 py-1 text-sm text-slate-900 rounded-none resize-none outline-0"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="h-10 flex justify-end items-center gap-2 pt-3 pb-6 px-4">
          <button
            className="text-sm text-slate-900 bg-slate-100 px-4 py-1 rounded-sm"
            disabled={!message.length}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export function DateDivider(props: { date: string }) {
  const date = useMemo(() => dayjs(props.date), [props.date])
  return (
    <div className="flex w-full py-1 text-[0.7rem] font-semibold justify-center">
      {date.format('YYYY/MM/DD')}
    </div>
  )
}

type ChatLogProps = {
  isMe?: boolean
  withoutHeader?: boolean
  name: string
  time: string
  message: string
  avatar?: string
  type?: MessageType
}

export function ChatLog(props: ChatLogProps) {
  const {
    isMe = false,
    withoutHeader = false,
    name,
    avatar,
    time,
    message
  } = props
  const date = useMemo(() => dayjs(time), [time])
  return (
    <div
      className={cn(
        'flex',
        isMe && 'flex-row-reverse',
        'items-center',
        'gap-3',
        'relative',
        styles['chat-log']
      )}
    >
      {withoutHeader ? (
        <div
          className={cn(
            styles['date-info'],
            'text-[0.6rem]/[0.6rem] text-slate-500',
            'absolute top-0',
            'w-10 h-4',
            isMe ? 'right-0' : 'left-0',
            'justify-center items-center' // display: flex/none should controlled by scss module
          )}
        >
          {date.format('HH:mm')}
        </div>
      ) : (
        <Avatar className="w-10 h-10">
          <AvatarImage src={avatar} draggable={false} />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'flex-1 flex flex-col',
          withoutHeader ? (isMe ? 'pe-[3.25em]' : 'ps-[3.25em]') : 'px-0 py-0'
        )}
      >
        {!withoutHeader && (
          <div
            className={cn(
              'flex w-full gap-2 items-center',
              isMe ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className="font-semibold text-slate-800 text-xs/[1.5]">
              {name}
            </div>
            <div className="text-[0.6rem]/[0.6rem] text-slate-500">
              {date.format('HH:mm')}
            </div>
          </div>
        )}
        <div
          className={cn(
            styles.message,
            'text-xs',
            isMe ? 'text-right' : 'text-left'
          )}
        >
          {message}
        </div>
      </div>
      <div className="w-10"></div>
    </div>
  )
}

export function ChatLogWithFetcher(
  props: { userID: string } & Required<Omit<ChatLogProps, 'name' | 'avatar'>>
) {
  const { execute } = useUserSearch()
  const { isLoading, error, data } = useSWR(
    `/user/${props.userID}`,
    () => execute(props.userID),
    { revalidateOnFocus: false }
  )
  if (isLoading) {
    return <Loading />
  }
  if (error) {
    throw error
  }
  return (
    <ChatLog
      {...props}
      isMe={false}
      name={data!.result.items[0].nickName}
      avatar={data!.result.items[0].avatar}
    />
  )
}

export function ChatLogsViewer() {
  const chatID = useAtomValue(chatRoomIDAtom)
  const chatType = useAtomValue(chatRoomTypeAtom)
  const user = useAtomValue(userAtom)

  const { execute } = useChatLogs()
  const { isLoading, error, data } = useSWR(
    !!chatID ? `/messages/${chatID}` : null,
    () => execute(chatType, chatID),
    { revalidateOnFocus: false }
  )
  return (
    <ScrollArea
      className={cn(
        'h-full flex flex-col gap-3 px-3 py-2',
        styles['chat-viewer']
      )}
    >
      {/* <DateDivider date="2024/4/17" />
      <ChatLog
        name="Shad"
        time="2024/4/17 10:00:00"
        message="Hey! How are you?"
        avatar="https://github.com/shadcn.png"
      />
      <ChatLog
        name="Shad"
        time="2024/4/17 10:00:01"
        message="Hey! How are you?"
        avatar="https://github.com/shadcn.png"
        withoutHeader
      />
      <ChatLog
        name="a632079"
        time="2024/4/17 10:01:20"
        message="I'm fine. Thank you."
        avatar="https://github.com/greenhat616.png"
        isMe
      />
      <ChatLog
        name="a632079"
        time="2024/4/17 10:01:32"
        message="What about you?"
        avatar="https://github.com/greenhat616.png"
        withoutHeader
        isMe
      /> */}
      {isLoading && <Loading />}
      {error && (
        <div className="h-full flex items-center justify-center">
          <SolarCloseCircleBold className="text-4xl text-slate-400" />
          <p className="text-xs font-semibold text-slate-400">
            {error.message}
          </p>
        </div>
      )}
      {data &&
        data.result.items.map((item) => {
          // TODO: 支持图片消息
          // TODO: 添加一种算法自动插入日期分割线以及合并相邻发送者的消息
          if (item.sender === user!.id) {
            return (
              <ChatLog
                key={item.id}
                name={user!.nickName}
                time={item.createTime}
                message={item.content}
                isMe
              />
            )
          }
          return (
            <ChatLogWithFetcher
              key={item.id}
              userID={item.sender}
              isMe={false}
              time={item.createTime}
              message={item.content}
              type={item.type}
              withoutHeader={false}
            />
          )
        })}
    </ScrollArea>
  )
}

export function ChatViewerPanel() {
  const friends = useAtomValue(friendsAtom)
  const chatID = useAtomValue(chatRoomIDAtom)
  const isFriend = useMemo(
    () => !!friends.find((o) => o.friendId === chatID),
    [friends]
  )

  // TODO: add a api to get group or friend info by id!

  return (
    <>
      <div className="h-14 border-b border-inherit border-solid flex items-center justify-between px-5">
        <span className="text-lg font-semibold">Shad</span>
      </div>
      <div className="flex-1">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={75}>
            <ChatLogsViewer />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25}>
            {isFriend ? <ChatInput /> : <JoinChatButton />}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}

export function JoinChatButton() {
  const chatID = useAtomValue(chatRoomIDAtom)
  // const chatType = useAtomValue(chatRoomTypeAtom)
  // TODO: add add group api
  const { execute } = useAddFriend()
  const [loading, setLoading] = useState(false)
  return (
    <div className="h-full flex items-center justify-center">
      <button
        className="text-sm text-slate-900 bg-slate-100 px-4 py-1 rounded-sm"
        onClick={async () => {
          setLoading(true)
          try {
            await execute(chatID)
            mutate('/friends')
          } finally {
            setLoading(false)
          }
        }}
      >
        加入聊天{' '}
        {loading && <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />}
      </button>
    </div>
  )
}

function Loading() {
  return (
    <div className="h-full flex flex-col gap-2 items-center justify-center">
      <GgSpinner className="text-4xl text-slate-300 animate-spin" />
      <p className="text-xs font-semibold text-slate-300">Loading...</p>
    </div>
  )
}

function CatchError({ error }: FallbackProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <SolarCloseCircleBold className="text-4xl text-slate-400" />
      <p className="text-xs font-semibold text-slate-400">{error.message}</p>
    </div>
  )
}

// 聊天界面
export function ChatViewer() {
  const [chatID] = useAtom(chatRoomIDAtom)
  // TODO: here should fetch data from upstream
  // const messages = useMemo<Message[]>(() => [], [])
  return (
    <div className="flex flex-col h-full">
      {!chatID ? (
        <NoSelectedChat />
      ) : (
        <ErrorBoundary FallbackComponent={CatchError}>
          <Suspense fallback={<Loading />}>
            <ChatViewerPanel />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}

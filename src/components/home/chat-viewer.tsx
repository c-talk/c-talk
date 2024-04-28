import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import dayjs from 'dayjs'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
// Icons
import {
  ChatLogsViewerIsBottomAtom,
  chatRoomIDAtom,
  chatRoomTypeAtom,
  profileDialogAtom,
  profileDialogPropsAtom
} from '@/stores/home'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

import GgSpinner from '~icons/gg/spinner'
import SolarCloseCircleBold from '~icons/solar/close-circle-bold'
import SolarGalleryMinimalisticLinear from '~icons/solar/gallery-minimalistic-linear'
import SolarSmileCircleLinear from '~icons/solar/smile-circle-linear'

import {
  useAddFriend,
  useChatLogs,
  useSendMessage,
  useUserById
} from '@/hooks/apis/chat'
import { friendsAtom, userAtom } from '@/stores/user'
import { Message, MessageType } from '@/types/globals'
import { Loader2 } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { ScrollAreaWithoutViewport } from '../ui/scroll-area'
import styles from './chat-viewer.module.scss'
import { ProfileDialogProps } from './profile-dialog'
import StickerPopover from './sticker-popover'

export function NoSelectedChat() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <IconSolarInboxArchiveOutline className="text-4xl text-slate-400" />
      <p className="text-xs font-semibold text-slate-400">
        请选择一个聊天开始对话
      </p>
    </div>
  )
}

type ChatInputProps = {
  onMessageSend?: (message: string) => void
}

export function ChatInput(props: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const chatID = useAtomValue(chatRoomIDAtom)
  const chatType = useAtomValue(chatRoomTypeAtom)
  const { execute } = useSendMessage()
  const sendMessage = useCallback(async () => {
    setLoading(true)
    try {
      // TODO: 支持发送图片
      await execute(chatType, MessageType.Text, message, chatID)
      setMessage('')
      mutate('/messages/' + chatID)
      props.onMessageSend?.(message)
    } finally {
      setLoading(false)
    }
  }, [message, chatID, chatType])
  return (
    <div className="h-full flex flex-col">
      <div className="h-8 flex items-center gap-2 px-2">
        <StickerPopover
          onStickerSelect={(sticker) => {
            setMessage((prev) => prev + sticker)
          }}
        >
          <SolarSmileCircleLinear className="text-lg text-slate-400" />
        </StickerPopover>
        <SolarGalleryMinimalisticLinear className="text-lg text-slate-400" />
      </div>
      <div className="flex-1 flex flex-col">
        <textarea
          className="flex-1 w-full h-full px-2 py-1 text-sm text-slate-900 rounded-none resize-none outline-0 relative"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          disabled={loading}
        />

        <div className="h-10 flex justify-end items-center gap-2 pt-3 pb-6 px-4">
          <button
            className="text-sm text-slate-900 bg-slate-100 px-4 py-1 rounded-sm"
            disabled={!message.length || loading}
            onClick={sendMessage}
          >
            发送
          </button>
        </div>
        {loading && (
          <Loader2 className="absolute right-2 bottom-2 w-5 h-5 animate-spin" />
        )}
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
        'my-1.5',
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
  const { execute } = useUserById()
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
      name={data!.result.nickName}
      avatar={data!.result.avatar}
    />
  )
}

export function ChatLogsViewer(props: {
  viewpointRef?: React.RefObject<HTMLDivElement>
  scrollToBottom?: () => void
}) {
  const chatID = useAtomValue(chatRoomIDAtom)
  const chatType = useAtomValue(chatRoomTypeAtom)
  const user = useAtomValue(userAtom)
  const [isBottom, setIsBottom] = useAtom(ChatLogsViewerIsBottomAtom)
  useEffect(() => {
    setIsBottom(true)
  }, [chatID])
  const [messages, setMessage] = useState<Message[]>([])
  const { execute } = useChatLogs()
  const { isLoading, error, data } = useSWR(
    !!chatID ? `/messages/${chatID}` : null,
    () =>
      execute(chatType, chatID, {
        pageSize: 50
      }),
    {
      revalidateOnFocus: false,

      onSuccess: (data) => {
        setMessage(data?.result?.items.reverse() || [])
      }
    }
  )
  useEffect(() => {
    if (isBottom) {
      props.scrollToBottom?.()
    }
  }, [isBottom, messages])

  return (
    <ScrollAreaWithoutViewport
      className={cn('px-3 my-2 flex-1', styles['chat-viewer'])}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn('h-full w-full rounded-[inherit]')}
        ref={props.viewpointRef}
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
          messages.map((item) => {
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
      </ScrollAreaPrimitive.Viewport>
    </ScrollAreaWithoutViewport>
  )
}

export function ChatViewerPanel() {
  const friends = useAtomValue(friendsAtom)
  const chatID = useAtomValue(chatRoomIDAtom)
  const setProfileDialogOpen = useSetAtom(profileDialogAtom)
  const setProfileDialogProps = useSetAtom(profileDialogPropsAtom)
  const isFriend = useMemo(
    () => !!friends.find((o) => o.friendId === chatID),
    [friends, chatID]
  )

  // TODO: add a api to get group info by id!
  const { execute } = useUserById()
  const { isLoading, error, data } = useSWR(`/user/${chatID}`, () =>
    execute(chatID)
  )

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const [isBottom, setIsBottom] = useAtom(ChatLogsViewerIsBottomAtom)
  const [scrollHeight, setScrollHeight] = useState(0)
  const scrollToBottom = useCallback(() => {
    scrollAreaRef.current?.scrollTo({
      top: scrollHeight,
      behavior: 'smooth'
    })
  }, [scrollAreaRef, scrollHeight])
  // const scroll = useScroll(scrollAreaRef)
  useEffect(() => {
    const el = scrollAreaRef.current
    const handler = (handler: Event) => {
      const { scrollTop, scrollHeight, clientHeight } =
        handler.target as HTMLDivElement
      setScrollHeight(scrollHeight)
      setIsBottom(Math.abs(scrollTop) + clientHeight >= scrollHeight - 1)
    }
    if (el) {
      el.addEventListener('scroll', handler)
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', handler)
      }
    }
  }, [scrollAreaRef])

  useEffect(() => {
    console.log(isBottom, scrollHeight)
    if (isBottom) {
      scrollToBottom()
    }
  }, [isBottom, scrollHeight])

  return (
    <>
      <div className="h-14 border-b border-inherit border-solid flex items-center justify-between px-5 relative">
        <span
          className="text-lg font-semibold"
          onClick={() => {
            setProfileDialogProps({
              userID: chatID
            } as ProfileDialogProps)
            setProfileDialogOpen(true)
          }}
        >
          {isLoading ? '加载中...' : error ? '加载失败' : data?.result.nickName}
        </span>
      </div>
      <div className="flex-1">
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId="chat-viewer-layout"
        >
          <ResizablePanel defaultSize={75} className="flex flex-col">
            <ChatLogsViewer
              viewpointRef={scrollAreaRef}
              scrollToBottom={scrollToBottom}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25}>
            {isFriend ? (
              <ChatInput onMessageSend={scrollToBottom} />
            ) : (
              <JoinChatButton />
            )}
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
        className="w-full mx-8 py-3 text-sm text-slate-900 bg-slate-100 px-4 rounded-sm"
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
        加入聊天
        {loading && (
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin inline-block" />
        )}
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

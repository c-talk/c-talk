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
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
// Icons
import {
  ChatLogsViewerIsBottomAtom,
  chatListTryUpdateWhileNewMessageAtom,
  chatRoomIDAtom,
  chatRoomTypeAtom,
  isChatJoinAtom,
  profileDialogAtom,
  profileDialogPropsAtom,
  uploadImageDialogAtom,
  uploadImageDialogPropsAtom
} from '@/stores/home'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import useInfiniteScroll from 'react-infinite-scroll-hook'

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
import { Resource } from '@/hooks/apis/resource'
import useGlobalMutation from '@/hooks/useGlobalMutation'
import { userAtom } from '@/stores/user'
import { ChatType, Message, MessageType } from '@/types/globals'
import { useMemoizedFn } from 'ahooks'
import { Loader2 } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import useSWRInfinite from 'swr/infinite'
import { ScrollAreaWithoutViewport } from '../ui/scroll-area'
import styles from './chat-viewer.module.scss'
import { ProfileDialogProps } from './profile-dialog'
import StickerPopover from './sticker-popover'
import UploadImageConfirmDialog from './upload-image-confirm-dialog'

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

function UploadImageButton({
  onImageUploaded
}: {
  onImageUploaded: (resource: Resource) => void
}) {
  const imageUploaderRef = useRef<HTMLInputElement>(null)
  const setUploadImageConfirmDialogOpen = useSetAtom(uploadImageDialogAtom)
  const setUploadImageDialogProps = useSetAtom(uploadImageDialogPropsAtom)
  useEffect(() => {
    const el = imageUploaderRef.current
    const handler = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      // TODO: support multiple files
      if (files && files.length) {
        setUploadImageDialogProps({
          image: files[0],
          onUploaded: (resource) => onImageUploaded(resource)
        })
        setUploadImageConfirmDialogOpen(true)
      }
    }
    el?.addEventListener('change', handler)
    return () => {
      el?.removeEventListener('change', handler)
    }
  }, [imageUploaderRef])
  return (
    <>
      <input
        ref={imageUploaderRef}
        type="file"
        accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      <SolarGalleryMinimalisticLinear
        className="text-lg text-slate-400"
        onClick={() => imageUploaderRef.current?.click()}
      />
    </>
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
  const [openUploadPreview, setOpenUploadPreview] = useAtom(
    uploadImageDialogAtom
  )
  const uploadImageConfirmDialogProps = useAtomValue(uploadImageDialogPropsAtom)

  const newMessageReceived = useSetAtom(chatListTryUpdateWhileNewMessageAtom)
  const { execute } = useSendMessage()
  const mutate = useGlobalMutation()
  const sendMessage = useMemoizedFn(
    async (messageType: MessageType = MessageType.Text, content?: string) => {
      setLoading(true)
      try {
        // TODO: 支持发送图片
        const msg = content || message
        const res = await execute(chatType, messageType, msg, chatID)
        setMessage('')
        mutate(
          (key) =>
            typeof key === 'string' && key.includes(`/messages/${chatID}`)
        )
        props.onMessageSend?.(msg)
        newMessageReceived({
          ...res.result,
          chatID: chatID,
          chatType: ChatType.Private // TODO: support group chat
        })
      } finally {
        setLoading(false)
      }
    }
  )
  const onImageUploaded = useMemoizedFn((resource: Resource) => {
    sendMessage(MessageType.Image, resource.id)
  })

  return (
    <div className="h-full flex flex-col">
      <UploadImageConfirmDialog
        open={openUploadPreview}
        setOpen={setOpenUploadPreview}
        {...uploadImageConfirmDialogProps}
      />
      <div className="h-8 flex items-center gap-2 px-2">
        <StickerPopover
          onStickerSelect={(sticker) => {
            setMessage((prev) => prev + sticker)
          }}
        >
          <SolarSmileCircleLinear className="text-lg text-slate-400" />
        </StickerPopover>
        <UploadImageButton onImageUploaded={onImageUploaded} />
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
            onClick={() => sendMessage()}
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
  userID: string
  isMe?: boolean
  withoutHeader?: boolean
  name: string
  time: string
  message: string
  avatar?: string
  type?: MessageType
}

export function ChatLog(props: ChatLogProps) {
  const setProfileDialogOpen = useSetAtom(profileDialogAtom)
  const setProfileDialogProps = useSetAtom(profileDialogPropsAtom)
  const {
    userID,
    isMe = false,
    withoutHeader = false,
    name,
    avatar,
    time,
    message,
    type
  } = props
  const date = useMemo(() => dayjs(time), [time])
  return (
    <div
      className={cn(
        'flex',
        'my-1.5',
        isMe && 'flex-row-reverse',
        // 'items-center',
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
        <Avatar
          className="w-10 h-10"
          onClick={() => {
            setProfileDialogProps({
              userID: userID
            } as ProfileDialogProps)
            setProfileDialogOpen(true)
          }}
        >
          <AvatarImage
            src={avatar ? getResourceUrl(avatar) : undefined}
            draggable={false}
          />
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
            'text-sm mt-1',
            isMe ? 'text-right' : 'text-left',
            type === MessageType.Image && isMe && 'flex flex-row-reverse'
          )}
        >
          {type === MessageType.Text ? (
            message
          ) : (
            <img
              src={getResourceUrl(message)}
              className="max-w-[23rem] rounded-sm"
            />
          )}
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
    { revalidateOnFocus: true }
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
  viewpointRef?: React.RefCallback<HTMLDivElement>
  scrollToBottom?: () => void
}) {
  const chatID = useAtomValue(chatRoomIDAtom)
  const chatType = useAtomValue(chatRoomTypeAtom)
  const user = useAtomValue(userAtom)
  const [isBottom, setIsBottom] = useAtom(ChatLogsViewerIsBottomAtom)
  useEffect(() => {
    setIsBottom(true)
  }, [chatID])

  // 消息获取部分
  const PAGE_SIZE = 20
  const { execute } = useChatLogs()
  const { isLoading, error, data, setSize, size } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!chatID) return null
      if (previousPageData && !previousPageData.result.items?.length)
        return null
      return `/messages/${chatID}?page=${pageIndex + 1}&pageSize=${PAGE_SIZE}`
    },
    (url) => {
      console.log(url)
      const parsedURL = new URL(url, window.location.href)
      return execute(chatType, chatID, {
        pageNum: Number(parsedURL.searchParams.get('page') || 1),
        pageSize: PAGE_SIZE
      })
    },
    {
      revalidateOnFocus: true,
      revalidateAll: true
    }
  )

  // 实现无限滚动
  const total = useMemo(() => data?.[0].result.total || 0, [data])
  const hasNextPage = useMemo(() => {
    console.log(size)
    return total > size * PAGE_SIZE
  }, [total, size])
  const onLoadMore = () => {
    setSize((size) => size + 1)
  }
  const [, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    disabled: !!error,
    hasNextPage,
    onLoadMore
    // rootMargin: '400px 0px 0px 0px'
  })
  const scrollableRootRef = useRef<HTMLDivElement | null>(null)
  const lastScrollDistanceToBottomRef = useRef<number>()

  const messages = useMemo(() => {
    return [...(data || [])].reverse()?.map((page) => {
      console.log(page)
      return [...(page.result.items || [])].reverse()
    })
  }, [data])
  useLayoutEffect(() => {
    const scrollableRoot = scrollableRootRef.current
    const lastScrollDistanceToBottom =
      lastScrollDistanceToBottomRef.current ?? 0
    if (scrollableRoot) {
      scrollableRoot.scrollTop =
        scrollableRoot.scrollHeight - lastScrollDistanceToBottom
    }
  }, [messages, rootRef])
  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      rootRef(node)
      props.viewpointRef?.(node)
      scrollableRootRef.current = node
    },
    [rootRef]
  )
  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop
      lastScrollDistanceToBottomRef.current = scrollDistanceToBottom
    }
  }, [])
  // const combinedRef = useForkRef(rootRefSetter, props.viewpointRef)

  // 自动滚动到底部
  useEffect(() => {
    if (isBottom) {
      props.scrollToBottom?.()
    }
  }, [isBottom, messages])

  const items = useMemo(() => {
    if (!messages.length) return null
    let current = ''
    let previousNode: Message | null = null
    return messages.map((page) => {
      return page.map((item) => {
        const items = (
          <>
            {current !== dayjs(item.createTime).format('YYYY-MM-DD') && (
              <DateDivider key={item.createTime} date={item.createTime} />
            )}
            {item.sender === user!.id ? (
              <ChatLog
                key={item.id}
                name={user!.nickName}
                time={item.createTime}
                message={item.content}
                withoutHeader={previousNode?.sender === item.sender}
                type={item.type}
                avatar={user!.avatar}
                userID={item.sender}
                isMe
              />
            ) : (
              <ChatLogWithFetcher
                key={item.id}
                userID={item.sender}
                isMe={false}
                time={item.createTime}
                message={item.content}
                type={item.type}
                withoutHeader={previousNode?.sender === item.sender}
              />
            )}
          </>
        )
        current = dayjs(item.createTime).format('YYYY-MM-DD')
        previousNode = item
        return items
      })
    })
  }, [messages])
  return (
    <ScrollAreaWithoutViewport
      className={cn('px-3 my-2 flex-1', styles['chat-viewer'])}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn('h-full w-full rounded-[inherit]')}
        ref={rootRefSetter}
        onScroll={handleRootScroll}
      >
        {isLoading && <Loading />}
        {error && (
          <div className="h-full flex items-center justify-center">
            <SolarCloseCircleBold className="text-4xl text-slate-400" />
            <p className="text-xs font-semibold text-slate-400">
              {error.message}
            </p>
          </div>
        )}
        {items}
      </ScrollAreaPrimitive.Viewport>
    </ScrollAreaWithoutViewport>
  )
}

export function ChatViewerPanel() {
  const chatID = useAtomValue(chatRoomIDAtom)
  const setProfileDialogOpen = useSetAtom(profileDialogAtom)
  const setProfileDialogProps = useSetAtom(profileDialogPropsAtom)
  const isFriend = useAtomValue(isChatJoinAtom)

  // TODO: add a api to get group info by id!
  const { execute } = useUserById()
  const { isLoading, error, data } = useSWR(`/user/${chatID}`, () =>
    execute(chatID)
  )

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const [isBottom, setIsBottom] = useAtom(ChatLogsViewerIsBottomAtom)
  const [scrollHeight, setScrollHeight] = useState(0)
  const scrollToBottom = (height?: number) => {
    scrollAreaRef.current?.scrollTo({
      top: height || scrollHeight,
      behavior: 'smooth'
    })
  }
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
              viewpointRef={(ref) => (scrollAreaRef.current = ref)}
              scrollToBottom={() => {
                scrollToBottom(scrollAreaRef.current?.scrollHeight)
              }}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25}>
            {isFriend ? (
              <ChatInput onMessageSend={() => scrollToBottom()} />
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

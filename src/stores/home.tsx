import { ChatItem } from '@/components/home/chat-list'
import { GroupProfileDialogProps } from '@/components/home/group-profile-dialog'
import { OperationType } from '@/components/home/layout'
import { ProfileDialogProps } from '@/components/home/profile-dialog'
import { UploadImageConfirmProps } from '@/components/home/upload-image-confirm-dialog'
import { ChatType, Message } from '@/types/globals'
import dayjs from 'dayjs'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { friendsAtom, userAtom } from './user'

// Chats
export const chatRoomIDAtom = atom<string>('')
export const chatRoomTypeAtom = atom<ChatType>(ChatType.Private)
export const isChatJoinAtom = atom((get) => {
  // TODO: add a check for a group
  const chatID = get(chatRoomIDAtom)
  const friends = get(friendsAtom)
  console.log(chatID, friends)
  return !!friends.find((friend) => friend.friendId === chatID)
})

export const operationItemAtom = atom<OperationType>(OperationType.Chat)
export const ChatLogsViewerIsBottomAtom = atom<boolean>(true)

// Chat Lists
export const chatListSyncCursorAtom = atomWithStorage<number>(
  'chat_list_sync_cursor',
  0
) // 持有最后一次同步的时间戳，用于判断服务端消息是否需要插入到列表中
export const chatListAtom = atomWithStorage<ChatItem[]>('chat_list', []) // save the chat list in storage
export const chatListTryAddAtom = atom(
  null,
  (
    get,
    set,
    params: {
      chatID: string
      chatType: ChatType
    }
  ) => {
    const list = get(chatListAtom)
    if (list.find((chat) => chat.meta.chatID === params.chatID)) {
      return
    }
    set(chatListAtom, (prev) => [
      {
        meta: {
          chatID: params.chatID,
          chatType: params.chatType
        },
        message: null,
        unread: false, // If the chat is new, it should not be unread
        ts: Date.now()
      },
      ...prev
    ])
  }
)
export const chatListTryUpdateWhileNewMessageAtom = atom(
  null,
  (
    get,
    set,
    message: Message & {
      chatType: ChatType
      chatID?: string
    }
  ) => {
    const list = get(chatListAtom)
    const user = get(userAtom)
    if (
      list.find((chat) =>
        message.chatID
          ? chat.meta.chatID === message.chatID
          : chat.meta.chatID === message.sender
      )
    ) {
      set(chatListAtom, (prev) =>
        prev
          .map((chat) => {
            if (
              message.chatID
                ? chat.meta.chatID === message.chatID
                : chat.meta.chatID === message.sender
            ) {
              return {
                ...chat,
                unread: user?.id !== message.sender,
                message,
                ts: dayjs(message.createTime).valueOf()
              }
            }
            return chat
          })
          .sort((a, b) => b.ts - a.ts)
      )
    } else {
      set(chatListAtom, (prev) => [
        {
          meta: {
            chatID: message.chatID || message.sender,
            chatType: message.chatType
          },
          message,
          unread: user?.id !== message.sender,
          ts: dayjs(message.createTime).valueOf()
        },
        ...prev
      ])
    }
  }
)
export const setUnreadToReadAtom = atom(null, (_, set, chatID: string) => {
  set(chatListAtom, (prev) =>
    prev.map((chat) => {
      if (chat.meta.chatID === chatID) {
        return {
          ...chat,
          unread: false
        }
      }
      return chat
    })
  )
})
export const removeChatItemAtom = atom(null, (_, set, chatID: string) => {
  set(chatListAtom, (prev) =>
    prev.filter((chat) => chat.meta.chatID !== chatID)
  )
})

// Profiles
export const profileDialogAtom = atom<boolean>(false)
export const profileDialogPropsAtom = atom<ProfileDialogProps>(
  {} as ProfileDialogProps
)
export const groupProfileDialogAtom = atom<boolean>(false)
export const groupProfileDialogPropsAtom = atom<GroupProfileDialogProps>(
  {} as ProfileDialogProps
)

// Upload Image Dialog
export const uploadImageDialogAtom = atom<boolean>(false)
export const uploadImageDialogPropsAtom = atom<UploadImageConfirmProps>(
  {} as UploadImageConfirmProps
)

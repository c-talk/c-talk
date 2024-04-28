import { ChatItem } from '@/components/home/chat-list'
import { OperationType } from '@/components/home/layout'
import { ProfileDialogProps } from '@/components/home/profile-dialog'
import { ChatType, Message } from '@/types/globals'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Chats
export const chatRoomIDAtom = atom<string>('')
export const chatRoomTypeAtom = atom<ChatType>(ChatType.Private)

export const operationItemAtom = atom<OperationType>(OperationType.Chat)
export const ChatLogsViewerIsBottomAtom = atom<boolean>(true)

// Chat Lists
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
                message,
                ts: Date.now()
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
          ts: Date.now()
        },
        ...prev
      ])
    }
  }
)

// Profiles
export const profileDialogAtom = atom<boolean>(false)
export const profileDialogPropsAtom = atom<ProfileDialogProps>(
  {} as ProfileDialogProps
)

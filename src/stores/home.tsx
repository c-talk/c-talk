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
type ChatStoreItem = {
  chat_list: ChatItem[]
  chat_list_sync_cursor: number
}
// TODO: chat_map 应该保存到 Tauri 的数据库中，理想情况下应该是 RocksDB
export const chatMapInStore = atomWithStorage<Record<string, ChatStoreItem>>(
  'chat_map',
  {}
)

export const chatListSyncCursorAtom = atom(
  (get) => {
    const user = get(userAtom)
    const chatMap = get(chatMapInStore)
    return chatMap[user?.id || '0']?.chat_list_sync_cursor || 0
  },
  (get, set, newCursor: number) => {
    const user = get(userAtom)
    const chatMap = get(chatMapInStore)
    if (!user) {
      return
    }
    set(chatMapInStore, {
      ...chatMap,
      [user.id]: {
        ...chatMap[user.id],
        chat_list_sync_cursor: newCursor
      }
    })
  }
) // 持有最后一次同步的时间戳，用于判断服务端消息是否需要插入到列表中

// export const chatListAtom = atomWithStorage<ChatItem[]>('chat_list', []) // save the chat list in storage
export const chatListAtom = atom(
  (get) => {
    const user = get(userAtom)
    const chatMap = get(chatMapInStore)
    return chatMap[user?.id || '0']?.chat_list || []
  },
  (get, set, newChatList: ChatItem[]) => {
    const user = get(userAtom)
    if (!user) {
      return
    }
    set(chatMapInStore, (prev) => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        chat_list: newChatList
      }
    }))
  }
) // save the chat list in storage

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
    set(chatListAtom, [
      {
        meta: {
          chatID: params.chatID,
          chatType: params.chatType
        },
        message: null,
        unread: false, // If the chat is new, it should not be unread
        ts: Date.now()
      },
      ...list
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
      set(
        chatListAtom,
        list
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
      set(chatListAtom, [
        {
          meta: {
            chatID: message.chatID || message.sender,
            chatType: message.chatType
          },
          message,
          unread: user?.id !== message.sender,
          ts: dayjs(message.createTime).valueOf()
        },
        ...list
      ])
    }
  }
)
export const setUnreadToReadAtom = atom(null, (get, set, chatID: string) => {
  const prev = get(chatListAtom)
  set(
    chatListAtom,
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
export const removeChatItemAtom = atom(null, (get, set, chatID: string) => {
  const prev = get(chatListAtom)
  set(
    chatListAtom,
    prev.filter((chat) => chat.meta.chatID !== chatID)
  )
})
export const setChatItemNameAtom = atom(
  null,
  (get, set, params: { chatID: string; name: string }) => {
    const prev = get(chatListAtom)
    set(
      chatListAtom,
      prev.map((chat) => {
        if (chat.meta.chatID === params.chatID) {
          return {
            ...chat,
            name: params.name
          }
        }
        return chat
      })
    )
  }
)

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

export const chatListSearchInputAtom = atom<string>('')
export const filteredChatListAtom = atom((get) => {
  const filterText = get(chatListSearchInputAtom)
  const list = get(chatListAtom)
  return list.filter((chat) =>
    !!filterText && chat.name ? chat.name.includes(filterText) : true
  )
})

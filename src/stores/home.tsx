import { ChatItem } from '@/components/home/chat-list'
import { OperationType } from '@/components/home/layout'
import { ProfileDialogProps } from '@/components/home/profile-dialog'
import { ChatType } from '@/types/globals'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Chats
export const chatRoomIDAtom = atom<string>('')
export const chatRoomTypeAtom = atom<ChatType>(ChatType.Private)

export const operationItemAtom = atom<OperationType>(OperationType.Chat)

export const ChatListAtom = atomWithStorage<ChatItem[]>('chat_list', []) // save the chat list in storage

export const ChatLogsViewerIsBottomAtom = atom<boolean>(true)

// Profiles
export const profileDialogAtom = atom<boolean>(false)
export const profileDialogPropsAtom = atom<ProfileDialogProps>(
  {} as ProfileDialogProps
)

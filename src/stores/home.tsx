import { ChatItem } from '@/components/home/chat-list'
import { OperationType } from '@/components/home/layout'
import { ProfileDialogProps } from '@/components/home/profile-dialog'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const chatIDAtom = atom<number>(0)

export const operationItemAtom = atom<OperationType>(OperationType.Chat)

export const ChatListAtom = atomWithStorage<ChatItem[]>('chat_list', []) // save the chat list in storage

// Profiles

export const profileDialogAtom = atom<boolean>(false)
export const profileDialogPropsAtom = atom<ProfileDialogProps>(
  {} as ProfileDialogProps
)

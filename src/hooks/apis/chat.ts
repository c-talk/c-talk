/* eslint-disable @typescript-eslint/no-explicit-any */
import { userAtom } from '@/stores/user'
import { ChatType, Message, MessageType } from '@/types/globals'
import { useLatest } from 'ahooks'
import { useAtomValue } from 'jotai'
import useSWR, { SWRConfiguration, mutate } from 'swr'
import isEmail from 'validator/es/lib/isEmail'
import { Page, R } from '../ofetch'
import { User } from './users'

export type Friend = {
  id: string
  name: string
  avatar: string
  friendId: string
}

export function useFriendsList() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const latestUserRef = useLatest(user)

  const execute = async () => {
    return ofetch<R<Friend[]>>(`/friend/list/${latestUserRef.current?.id}`)
  }
  return {
    execute
  }
}

export function useFriendsListSWR(opts: SWRConfiguration<R<Friend[]>> = {}) {
  const { execute } = useFriendsList()
  return useSWR<R<Friend[]>>(`/friend/list`, execute, opts)
}

export function useAddFriend() {
  const ofetch = useFetch()

  const execute = async (userID: string) => {
    const res = await ofetch<R<Friend[]>>(`/friend/add/`, {
      method: 'POST',
      body: {
        id: userID
      }
    })
    mutate('/friend/list')
    return res
  }
  return {
    execute
  }
}

export function useUserSearch() {
  const ofetch = useFetch()

  const execute = async (keyword: string) => {
    const query: {
      email?: string
      nickname?: string
    } = {}
    if (isEmail(keyword)) {
      query.email = keyword
    } else {
      query.nickname = keyword
    }
    return ofetch<R<Page<User>>>(`/user/page`, {
      method: 'POST',
      body: query
    })
  }
  return {
    execute
  }
}

export function useChatLogs() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const latestUserRef = useLatest(user)
  const execute = async (chatType: ChatType, chatID: string) => {
    switch (chatType) {
      case ChatType.Private:
        return ofetch<R<Page<Message>>>(`/message/history/private`, {
          method: 'POST',
          body: {
            receiver: chatID,
            sender: latestUserRef.current!.id
          }
        })
      case ChatType.Group:
        // TODO: Implement group chat logs
        return ofetch<R<Page<Message>>>(`/message/history/group`, {
          method: 'POST',
          body: {
            receiver: chatID,
            sender: latestUserRef.current!.id
          }
        })
    }
  }
  return {
    execute
  }
}

export function useSendMessage() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const latestUserRef = useLatest(user)
  const execute = async (
    chatType: ChatType,
    messageType: MessageType,
    content: string,
    chatID: string
  ) => {
    switch (chatType) {
      case ChatType.Private:
        return ofetch<R<Message>>(`/message/send/private`, {
          method: 'POST',
          body: {
            content,
            messageType,
            receiver: chatID,
            sender: latestUserRef.current!.id
          }
        })
      case ChatType.Group:
        // TODO: Implement group chat
        return ofetch<R<Message>>(`/message/send/group`, {
          method: 'POST',
          body: {
            content,
            messageType,
            receiver: chatID,
            sender: latestUserRef.current!.id
          }
        })
    }
  }
  return {
    execute
  }
}

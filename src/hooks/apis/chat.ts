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

type PageParams = {
  pageNum: number
  pageSize: number
}

const basePageParams: PageParams = {
  pageNum: 1,
  pageSize: 10
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
  return useSWR<R<Friend[]>>(`/friends`, execute, {
    // refreshInterval: 1000 * 2,
    ...opts
  })
}

export function useAddFriend() {
  const ofetch = useFetch()

  const execute = async (userID: string) => {
    const formData = new FormData()
    formData.append('id', userID)
    const res = await ofetch<R<Friend[]>>(`/friend/add/`, {
      method: 'POST',
      body: formData
    })
    mutate('/friends')
    return res
  }
  return {
    execute
  }
}

export function useUserSearch() {
  const ofetch = useFetch()

  const execute = async (
    keyword: string,
    pageParams: Partial<PageParams> = {}
  ) => {
    const query: {
      email?: string
      nickName?: string
    } & PageParams = { ...basePageParams, ...pageParams }
    if (isEmail(keyword)) {
      query.email = keyword
    } else {
      query.nickName = keyword
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

export function useUserById() {
  const ofetch = useFetch()
  const execute = async (userID: string) => {
    return ofetch<R<User>>(`/user/get/${userID}`)
  }
  return {
    execute
  }
}

export function useChatLogs() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const latestUserRef = useLatest(user)
  const execute = async (
    chatType: ChatType,
    chatID: string,
    pageParams: Partial<PageParams> = {}
  ) => {
    switch (chatType) {
      case ChatType.Private:
        return ofetch<R<Page<Message>>>(`/message/history/private`, {
          method: 'POST',
          body: {
            receiver: chatID,
            sender: latestUserRef.current!.id,
            ...basePageParams,
            ...pageParams
          }
        })
      case ChatType.Group:
        // TODO: Implement group chat logs
        return ofetch<R<Page<Message>>>(`/message/history/group`, {
          method: 'POST',
          body: {
            receiver: chatID,
            sender: latestUserRef.current!.id,
            ...basePageParams,
            ...pageParams
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
            type: messageType,
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
            type: messageType,
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

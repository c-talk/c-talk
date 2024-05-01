import { chatListTryAddAtom } from './../../../stores/home'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page, R } from '@/hooks/ofetch'
import useGlobalMutation from '@/hooks/useGlobalMutation'
import { userAtom } from '@/stores/user'
import { ChatType, Message, MessageType, PageParams } from '@/types/globals'
import { useLatest } from 'ahooks'
import { useAtomValue, useSetAtom } from 'jotai'
import { basePageParams } from '../shared'
import { useUserById, useUserSearch } from '../users'
import { useAddFriend } from './friends'
import { useGroupById, useGroupSearch, useJoinGroup } from './group'

export * from './friends'
export * from './group'

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

export function useChatSearch() {
  const groupSearch = useGroupSearch()
  const userSearch = useUserSearch()
  const execute = async (search: string) => {
    const result = await Promise.all([
      groupSearch.execute({ code: search }),
      groupSearch.execute({ name: search }),
      userSearch.execute(search)
    ])
    return result.map((r) => r.result.items)
  }
  return {
    execute
  }
}

export type ChatMeta = {
  id: string
  name: string
  desc?: string
  avatar?: string
  banner?: string
  type: ChatType
  joined: boolean
}

export function useChatMeta() {
  const getUser = useUserById()
  const getGroup = useGroupById()
  const execute = async (chatID: string, chatType: ChatType) => {
    const meta = {} as ChatMeta
    switch (chatType) {
      case ChatType.Private:
        const user = await getUser.execute(chatID)
        meta.id = user.result.id
        meta.name = user.result.nickName
        meta.avatar = user.result.avatar
        meta.type = ChatType.Private
        meta.joined = user.result.friend
        break
      case ChatType.Group:
        const group = await getGroup.execute(chatID)
        Object.assign(meta, group.result.group)
        meta.joined = group.result.member
        break
    }
    return meta
  }
  return {
    execute
  }
}

export function useJoinChat() {
  const addFriend = useAddFriend()
  const joinGroup = useJoinGroup()
  const tryAddChatList = useSetAtom(chatListTryAddAtom)
  const mutate = useGlobalMutation()
  const execute = async (chatID: string, chatType: ChatType) => {
    switch (chatType) {
      case ChatType.Private:
        await addFriend.execute(chatID)
        mutate('/friends') // TODO: replace with infinite query
        mutate(`/user/${chatID}`)
        break
      case ChatType.Group:
        await joinGroup.execute(chatID)
        mutate(`/group/${chatID}`)
        mutate(
          (key) => typeof key === 'string' && key.includes('/joined/groups')
        )
        break
    }
    tryAddChatList({
      chatID,
      chatType
    })
    mutate(`/chat/${chatID}`)
  }
  return {
    execute
  }
}

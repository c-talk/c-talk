/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page, R } from '@/hooks/ofetch'
import { userAtom } from '@/stores/user'
import { ChatType, Message, MessageType, PageParams } from '@/types/globals'
import { useLatest } from 'ahooks'
import { useAtomValue } from 'jotai'
import { basePageParams } from '../shared'
import { useUserSearch } from '../users'
import { useGroupSearch } from './group'

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

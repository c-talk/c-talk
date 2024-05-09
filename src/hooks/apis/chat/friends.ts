import { Page, R } from '@/hooks/ofetch'
import useGlobalMutation from '@/hooks/useGlobalMutation'
import { userAtom } from '@/stores/user'
import { Message, PageParams } from '@/types/globals'
import { useLatest, useMemoizedFn } from 'ahooks'
import { useAtomValue } from 'jotai'
import { mutate } from 'swr'
import { User } from '../users'
import { basePageParams } from './../shared'

export type Friend = {
  id: string
  uid: string
  friendId: string
  friend: User
  message?: Message
}
export function useFriendsList() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const latestUserRef = useLatest(user)

  const execute = async (
    params: Partial<
      PageParams & {
        nickName: string
        email: string
      }
    > = {}
  ) => {
    return ofetch<R<Friend[]>>(`/friend/list/${latestUserRef.current?.id}`, {
      method: 'POST',
      body: { ...params }
    })
  }
  return {
    execute
  }
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

export function useRemoveFriend() {
  const ofetch = useFetch()
  const mutate = useGlobalMutation()
  const execute = async (userId: string) => {
    const res = await ofetch<R<Friend[]>>(`/friend/remove/${userId}`, {
      method: 'POST'
    })
    mutate('/friends')
    return res
  }
  return {
    execute
  }
}

export function useFriendListWithMessage() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const execute = useMemoizedFn(async (page: PageParams) => {
    return ofetch<
      R<
        Page<
          Friend & {
            message: Message
          }
        >
      >
    >(`/friend/page/${user!.id}/with/message`, {
      method: 'POST',
      body: { ...basePageParams, ...page }
    })
  })
  return {
    execute
  }
}

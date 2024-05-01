import { R } from '@/hooks/ofetch'
import useGlobalMutation from '@/hooks/useGlobalMutation'
import { friendsAtom, userAtom } from '@/stores/user'
import { useLatest } from 'ahooks'
import { useAtomValue, useSetAtom } from 'jotai'
import useSWR, { SWRConfiguration, mutate } from 'swr'

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
  const setFriends = useSetAtom(friendsAtom)
  return useSWR<R<Friend[]>>(`/friends`, execute, {
    onSuccess: (data) => {
      setFriends(
        data.result
          ? Array.isArray(data.result)
            ? data.result
            : [data.result]
          : []
      )
    },
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

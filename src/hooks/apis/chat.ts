import { userAtom } from '@/stores/user'
import { useLatest } from 'ahooks'
import { useAtomValue } from 'jotai'
import useSWR, { mutate } from 'swr'
import isEmail from 'validator/es/lib/isEmail'
import { Page, R } from '../ofetch'
import { User } from './users'

type Friends = {
  id: string
  name: string
  avatar: string
}

export function useFriendsList() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const latestUserRef = useLatest(user)

  const execute = async () => {
    return ofetch<R<Friends[]>>(`/friend/list/${latestUserRef.current?.id}`)
  }
  return {
    execute
  }
}

export function useFriendsListSWR() {
  const { execute } = useFriendsList()
  return useSWR<R<Friends[]>>(`/friend/list`, execute)
}

export function useAddFriend() {
  const ofetch = useFetch()

  const execute = async (userID: string) => {
    const res = await ofetch<R<Friends[]>>(`/friend/add/`, {
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

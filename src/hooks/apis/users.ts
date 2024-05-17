import { userAtom } from '@/stores/user'
import { PageParams } from '@/types/globals'
import { useLatest } from 'ahooks'
import { useAtomValue, useSetAtom } from 'jotai'
import useSWR, { mutate } from 'swr'
import isEmail from 'validator/es/lib/isEmail'
import { Page, R, useFetch } from '../ofetch'
import { basePageParams } from './shared'

export interface User {
  id: string
  email: string
  nickName: string
  avatar: string
  verify: boolean
  token: string
}

export interface WebSocketToken {
  token: string // websocket token
  expire: number
}

export function useLogin() {
  const ofetch = useFetch()
  const execute = async (email: string, password: string) => {
    return ofetch<R<User>>('/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    }).finally(() => {
      mutate('/token')
    })
  }
  return {
    execute
  }
}

export function useToken() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const latestUser = useLatest(user)
  const execute = async () => {
    if (!latestUser.current) {
      throw new Error('no user')
    }
    return ofetch<R<WebSocketToken>>('/token/get', {
      // credentials: 'include'
    })
  }
  return {
    execute
  }
}
export function useTokenSWR() {
  const { execute } = useToken()
  return useSWR<R<WebSocketToken>>('/token', execute)
}

export type UserRegisterParams = {
  email: string
  password: string
  rePassword: string
  nickName: string
}

export function useRegister() {
  const ofetch = useFetch()
  const execute = async (params: UserRegisterParams) => {
    return ofetch<R<User>>('/register', {
      method: 'POST',
      body: params
    })
  }
  return {
    execute
  }
}

export type UserUpdateForm = {
  nickName: string
  avatar: string
}

export function useUpdateUser() {
  const ofetch = useFetch()
  const setUser = useSetAtom(userAtom)
  const execute = async (params: Partial<UserUpdateForm>) => {
    if (Object.keys(params).length === 0) {
      throw new Error('no data to update')
    }
    await ofetch<R<void>>('/user/set', {
      method: 'POST',
      body: params
    })
    // TODO: maybe mutate /me is better?
    setUser((prev) => ({
      ...prev!,
      ...params
    }))
  }
  return {
    execute
  }
}

export type ChangePasswordForm = {
  oriPassword: string
  password: string
  rePassword: string
}

export function useChangePassword() {
  const ofetch = useFetch()
  const execute = async (params: ChangePasswordForm) => {
    return ofetch<R<void>>('/user/changePassword', {
      method: 'POST',
      body: params
    })
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
    if (!userID) {
      throw new Error('no user id')
    }
    return ofetch<R<User & { friend: boolean }>>(`/user/get/${userID}`)
  }
  return {
    execute
  }
}

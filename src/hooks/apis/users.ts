import useSWR, { mutate } from 'swr'
import { R, useFetch } from '../ofetch'

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
  const execute = async () => {
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

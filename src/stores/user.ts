import { User } from '@/hooks/apis/users'
import { atom } from 'jotai'

export const userAtom = atom<User | null>(null)
export const isUserExpiredAtom = atom((get) => {
  const user = get(userAtom)
  return !user || !user.auth_token
})

export const websocketAuthTokenAtom = atom<string | null>(null)

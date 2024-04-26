import { User, WebSocketToken } from '@/hooks/apis/users'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const userAtom = atomWithStorage<User | null>('users', null)
export const isUserExpiredAtom = atom((get) => {
  const user = get(userAtom)
  return !user || !user.token
})

export const websocketAuthTokenAtom = atomWithStorage<WebSocketToken | null>(
  'websocket_authtoken',
  null
)

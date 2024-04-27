import { Friend } from '@/hooks/apis/chat'
import { User, WebSocketToken } from '@/hooks/apis/users'
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storage = createJSONStorage<any>(() => sessionStorage)

export const userAtom = atomWithStorage<User | null>('users', null, storage)
export const isUserExpiredAtom = atom((get) => {
  const user = get(userAtom)
  return !user || !user.token
})
export const friendsAtom = atomWithStorage<Friend[]>('friends', [], storage)

export const websocketAuthTokenAtom = atomWithStorage<WebSocketToken | null>(
  'websocket_authtoken',
  null,
  storage
)

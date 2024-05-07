import { atom } from 'jotai'
import { SocketIOState } from '../hooks/socket-io'

export const socketIOIndicatorAtom = atom<SocketIOState>(2)

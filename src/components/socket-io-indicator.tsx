import { useToken } from '@/hooks/apis/users'
import { SocketIOState, useSocketIOWithHandler } from '@/hooks/socket-io'
import { socketIOIndicatorAtom } from '@/stores/socket-io'
import { userAtom, websocketAuthTokenAtom } from '@/stores/user'
import { useAsyncEffect } from 'ahooks'
import { AnimatePresence, motion } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { Check, CircleX, Loader2 } from 'lucide-react'

export default function SocketIOIndicator() {
  const [websocketToken, setWebsocketToken] = useAtom(websocketAuthTokenAtom)
  const user = useAtomValue(userAtom)
  const { execute: executeGetWebsocketToken } = useToken()
  useAsyncEffect(async () => {
    if (websocketToken === null && !!user) {
      const token = await executeGetWebsocketToken()
      console.log(token.result)
      setWebsocketToken(token.result)
    }
  }, [websocketToken, user])
  const socketIOState = useAtomValue(socketIOIndicatorAtom)
  const { reconnect } = useSocketIOWithHandler()

  return (
    // should move from bottom to
    <AnimatePresence>
      {socketIOState !== SocketIOState.IDLE && (
        <motion.div
          className="fixed p-1.5 rounded-full right-5 bg-slate-200 border border-slate-300"
          initial={{ opacity: 0, scale: 0.1, bottom: '-1.25rem' }}
          animate={{ opacity: 1, scale: 1, bottom: '1.25rem' }}
          exit={{ opacity: 0, scale: 0.1, bottom: '-1.25rem' }}
        >
          <SocketIOStateIndicator
            reconnect={reconnect}
            socketIOState={socketIOState}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SocketIOStateIndicator({
  reconnect,
  socketIOState
}: {
  reconnect: () => void
  socketIOState: SocketIOState
}) {
  // Should be a animated icon
  switch (socketIOState) {
    case SocketIOState.CONNECTING:
    case SocketIOState.RECONNECTING:
      return <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
    case SocketIOState.CONNECTED:
      return <Check className="w-5 h-5 text-green-500" />
    case SocketIOState.CLOSED:
      return (
        <CircleX
          className="w-5 h-5 text-red-500 cursor-pointer"
          onClick={reconnect}
        />
      )
    default:
      return null
  }
}

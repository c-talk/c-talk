import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useToken } from '@/hooks/apis/users'
import { SocketIOState, useSocketIOWithHandler } from '@/hooks/socket-io'
import { socketIOIndicatorAtom } from '@/stores/socket-io'
import { userAtom, websocketAuthTokenAtom } from '@/stores/user'
import { useAsyncEffect } from 'ahooks'
import { AnimatePresence, motion } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { Check, CircleX, Loader2 } from 'lucide-react'
import { useMemo } from 'react'

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
  const toolTipText = useMemo(() => {
    switch (socketIOState) {
      case SocketIOState.CONNECTING:
        return 'Connecting...'
      case SocketIOState.RECONNECTING:
        return 'Reconnecting...'
      case SocketIOState.CONNECTED:
        return 'Connected'
      case SocketIOState.CLOSED:
        return 'Connection closed'
      default:
        return ''
    }
  }, [socketIOState])
  return (
    // should move from bottom to
    <AnimatePresence>
      {socketIOState !== SocketIOState.IDLE && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className="fixed w-8 h-8 flex items-center justify-center rounded-full right-7 bg-slate-200 border border-slate-300"
                initial={{ opacity: 0, scale: 0.1, bottom: '-1.25rem' }}
                animate={{ opacity: 1, scale: 1, bottom: '3rem' }}
                exit={{ opacity: 0, scale: 0.1, bottom: '-1.25rem' }}
              >
                <AnimatePresence mode="wait">
                  <SocketIOStateIndicator
                    key={socketIOState}
                    reconnect={reconnect}
                    socketIOState={socketIOState}
                  />
                </AnimatePresence>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>{toolTipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </AnimatePresence>
  )
}

const props = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
  transition: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
    duration: 0.05
  }
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
      return (
        <motion.div {...props}>
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        </motion.div>
      )
    case SocketIOState.CONNECTED:
      return (
        <motion.div {...props}>
          <Check className="w-5 h-5 text-green-500" />{' '}
        </motion.div>
      )
    case SocketIOState.CLOSED:
      return (
        <motion.div {...props}>
          <CircleX
            className="w-5 h-5 text-red-500 cursor-pointer"
            onClick={reconnect}
          />
        </motion.div>
      )
    default:
      return null
  }
}

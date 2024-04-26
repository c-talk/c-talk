import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { useState, type MouseEventHandler } from 'react'
import SolarChatDotsLinear from '~icons/solar/chat-dots-linear'
import SolarSettingsOutline from '~icons/solar/settings-outline'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

import { useNavigate } from '@/router'
import { userAtom, websocketAuthTokenAtom } from '@/stores/user'
import { useAtom, useSetAtom } from 'jotai'
import styles from './layout.module.scss'

type OperationItemProps = {
  children: React.ReactNode
  active?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function OperationItem({
  active = false,
  children,
  onClick
}: OperationItemProps) {
  return (
    <div
      className={cn(styles['operation-item'], active && styles.active)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export enum OperationType {
  Chat = 'chat'
}

export function OperationsPanel() {
  const [user, setUser] = useAtom(userAtom)
  const setWebsocketAuthToken = useSetAtom(websocketAuthTokenAtom)
  const navigate = useNavigate()
  const [selected, setSelected] = useState<null | OperationType>(
    OperationType.Chat
  )

  return (
    <div
      className={cn(
        'w-[3.75em] h-full bg-slate-700',
        styles['operations-panel']
      )}
    >
      <div className="h-full flex flex-col pt-5 pb-3 gap-3 items-center">
        <div className="flex w-full items-center justify-center">
          <ContextMenu>
            <ContextMenuTrigger>
              <Avatar className="w-10 h-10 cursor-default">
                {user?.avatar && (
                  <AvatarImage src={user?.avatar} draggable={false} />
                )}
                <AvatarFallback>{user?.nickName}</AvatarFallback>
              </Avatar>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>信息</ContextMenuItem>
              <ContextMenuItem>修改密码</ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  setUser(null)
                  setWebsocketAuthToken(null)
                  navigate('/')
                }}
              >
                登出
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
        <OperationItem
          active={selected === OperationType.Chat}
          onClick={() => setSelected(OperationType.Chat)}
        >
          <SolarChatDotsLinear className="text-2xl text-white" />
        </OperationItem>
        <div className="flex-1" />
        <div className="flex items-center justify-center w-full h-10 ">
          <SolarSettingsOutline className="text-2xl text-white" />
        </div>
      </div>
    </div>
  )
}

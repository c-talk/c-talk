import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { type MouseEventHandler } from 'react'
import SolarChatDotsLinear from '~icons/solar/chat-dots-linear'
import SolarSettingsOutline from '~icons/solar/settings-outline'
import SolarUsersGroupTwoRoundedLinear from '~icons/solar/users-group-two-rounded-linear'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

import { User } from '@/hooks/apis/users'
import { useNavigate } from '@/router'
import {
  chatRoomIDAtom,
  operationItemAtom,
  profileDialogAtom,
  profileDialogPropsAtom
} from '@/stores/home'
import { userAtom, websocketAuthTokenAtom } from '@/stores/user'
import { useAtom, useSetAtom } from 'jotai'
import styles from './layout.module.scss'
import { ProfileDialogProps } from './profile-dialog'

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
  Chat = 'chat',
  Contacts = 'contacts'
}

export function OperationsPanel() {
  const [user, setUser] = useAtom(userAtom)
  const setWebsocketAuthToken = useSetAtom(websocketAuthTokenAtom)
  const navigate = useNavigate()
  const [selectedOperationItem, setSelectedOperationItem] =
    useAtom(operationItemAtom)
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setProfileDialogProps = useSetAtom(profileDialogPropsAtom)
  const setProfileDialogOpen = useSetAtom(profileDialogAtom)

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
                  <AvatarImage
                    src={getResourceUrl(user?.avatar)}
                    draggable={false}
                  />
                )}
                <AvatarFallback>{user?.nickName}</AvatarFallback>
              </Avatar>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setProfileDialogProps({
                    user: user as User
                  } as ProfileDialogProps)
                  setProfileDialogOpen(true)
                }}
              >
                信息
              </ContextMenuItem>
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
          active={selectedOperationItem === OperationType.Chat}
          onClick={() => setSelectedOperationItem(OperationType.Chat)}
        >
          <SolarChatDotsLinear className="text-2xl text-white" />
        </OperationItem>
        <OperationItem
          active={selectedOperationItem === OperationType.Contacts}
          onClick={() => {
            setChatRoomID('')
            setSelectedOperationItem(OperationType.Contacts)
          }}
        >
          <SolarUsersGroupTwoRoundedLinear className="text-2xl text-white" />
        </OperationItem>
        <div className="flex-1" />
        <div className="flex items-center justify-center w-full h-10">
          <SolarSettingsOutline className="text-2xl text-white" />
        </div>
      </div>
    </div>
  )
}

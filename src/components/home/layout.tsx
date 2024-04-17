import { useState, type MouseEventHandler } from 'react'
import SolarChatDotsLinear from '~icons/solar/chat-dots-linear'
import SolarSettingsOutline from '~icons/solar/settings-outline'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

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
          <Avatar className="w-10 h-10">
            <AvatarImage
              src="https://github.com/shadcn.png"
              draggable={false}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
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

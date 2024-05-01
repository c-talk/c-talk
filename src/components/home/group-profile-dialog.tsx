import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { GroupVo, useGroupById, useGroupUpdate } from '@/hooks/apis/chat'
import { useResourceUpload } from '@/hooks/apis/resource'
import { User } from '@/hooks/apis/users'
import {
  chatRoomIDAtom,
  chatRoomTypeAtom,
  groupProfileDialogAtom
} from '@/stores/home'
import { userAtom } from '@/stores/user'
import { ChatType } from '@/types/globals'
import { useMemoizedFn } from 'ahooks'
import dayjs from 'dayjs'
import { useAtomValue, useSetAtom } from 'jotai'
import { CheckIcon, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Input } from '../ui/input'
import { UserItemWithFetcher } from './user-item'

type GroupItemInnerProps = {
  groupVo: GroupVo
}

type GroupItemWithFetcherProps = {
  groupID: string
}

type ExtendedProps = {
  onChatButtonClick?: (user: User) => void
}

export type GroupProfileDialogProps = Partial<
  GroupItemInnerProps & GroupItemWithFetcherProps & ExtendedProps
> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GroupProfileDialog(props: GroupProfileDialogProps) {
  console.log(props)
  if (!props.groupID && !props.groupVo) {
    return null
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.groupID ? (
        <GroupProfileContentWithFetcher groupID={props.groupID} />
      ) : (
        <GroupProfileContent groupVo={props.groupVo!} />
      )}
    </Dialog>
  )
}

function GroupProfileContentWithFetcher(props: GroupItemWithFetcherProps) {
  const { execute } = useGroupById()
  const { isLoading, data, error } = useSWR(`/group/${props.groupID}`, () =>
    execute(props.groupID)
  )
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error...</div>
  }
  return <GroupProfileContent groupVo={data!.result} />
}

function GroupProfileContent(props: GroupItemInnerProps) {
  const { groupVo } = props
  const user = useAtomValue(userAtom)
  const setGroupProfileDialogOpen = useSetAtom(groupProfileDialogAtom)
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const avatarUploaderRef = useRef<HTMLInputElement>(null)
  const isOwner = useMemo(
    () => props.groupVo.group.owner === user?.id,
    [groupVo, user]
  )

  const uploadUserAvatar = useMemoizedFn(async () => {
    if (!isOwner) {
      return
    }
    // open a file dialog to upload avatar
    avatarUploaderRef.current?.click()
    // TODO: finish the resource upload logic
  })
  // TODO: add password, email, nickname change logic
  const { execute: executeUploadResource } = useResourceUpload()
  const updateGroup = useGroupUpdate()
  useEffect(() => {
    const el = avatarUploaderRef.current
    const handleFileChange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        const res = await executeUploadResource([file])
        const avatar = res.result[0].id
        await updateGroup.execute({ id: groupVo.group.id, avatar })
      }
    }

    el?.addEventListener('change', handleFileChange)
    return () => {
      el?.removeEventListener('change', handleFileChange)
    }
  }, [avatarUploaderRef])

  // Editable nickname
  const [editableName, setEditableName] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [name, setName] = useState(groupVo.group.name || '')
  const handleUpdateGroupName = useMemoizedFn(async () => {
    if (name === groupVo.group.name) {
      setEditableName(false)
      return
    }
    setButtonLoading(true)
    try {
      await updateGroup.execute({ id: groupVo.group.id, name })
      setEditableName(false)
    } finally {
      setButtonLoading(false)
    }
  })

  return (
    <DialogContent className="w-[28rem]">
      <DialogHeader>
        <DialogTitle>群组信息</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 relative w-full">
        <input
          type="file"
          className="hidden"
          accept="image/png,image/jpg,image/jpeg,image/webp"
          ref={avatarUploaderRef}
        />
        <Avatar className="w-24 h-24 cursor-default" onClick={uploadUserAvatar}>
          <AvatarImage
            className="object-cover"
            src={getResourceUrl(groupVo.group.avatar)}
            draggable={false}
          />
          <AvatarFallback>{groupVo.group.name}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-3 w-full">
          {editableName ? (
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateGroupName()
                  }
                }}
              />

              <Button
                onClick={handleUpdateGroupName}
                variant="outline"
                size="icon"
                disabled={buttonLoading}
              >
                {buttonLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <div
              className="text-lg font-semibold"
              onClick={() => {
                if (isOwner) {
                  setEditableName(true)
                }
              }}
            >
              {groupVo.group.name}
            </div>
          )}
          <div className="font-mono text-sm">{groupVo.group.desc}</div>
          <div className="w-[80%] grid gap-2">
            <div className="text-xs font-semibold">成员</div>
            <div className="flex gap-1 flex-shrink-0">
              {groupVo.memberList.slice(0, 5).map((member) => (
                <div key={member.uid} className="font-mono text-sm">
                  <UserItemWithFetcher userID={member.uid} hideInfo />
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs font-semibold w-[80%]">
            创建时间：{' '}
            <span className="font-mono text-xs font-normal">
              {dayjs(groupVo.group.createTime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </div>
        </div>
        <Button
          onClick={() => {
            setChatRoomID(props.groupVo.group.id)
            setChatRoomType(ChatType.Group)
            setGroupProfileDialogOpen(false)
          }}
        >
          聊天
        </Button>
      </div>
    </DialogContent>
  )
}

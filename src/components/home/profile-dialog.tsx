import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useUserById } from '@/hooks/apis/chat'
import { useResourceUpload } from '@/hooks/apis/resource'
import { User, useUpdateUser } from '@/hooks/apis/users'
import {
  chatRoomIDAtom,
  chatRoomTypeAtom,
  profileDialogAtom
} from '@/stores/home'
import { userAtom } from '@/stores/user'
import { ChatType } from '@/types/globals'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

type UserItemInnerProps = {
  user: User
}

type UserItemWithFetcherProps = {
  userID: string
}

type ExtendedProps = {
  onChatButtonClick?: (user: User) => void
}

export type ProfileDialogProps = Partial<
  UserItemInnerProps & UserItemWithFetcherProps & ExtendedProps
> & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileDialog(props: ProfileDialogProps) {
  if (!props.userID && !props.user) {
    return null
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.userID ? (
        <ProfileContentWithFetcher userID={props.userID} />
      ) : (
        <ProfileContent user={props.user as User} />
      )}
    </Dialog>
  )
}

function ProfileContentWithFetcher(props: UserItemWithFetcherProps) {
  const { execute } = useUserById()
  const { isLoading, data, error } = useSWR(`/user/${props.userID}`, () =>
    execute(props.userID)
  )
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error...</div>
  }
  return <ProfileContent user={data!.result} />
}

function ProfileContent(props: UserItemInnerProps) {
  const user = useAtomValue(userAtom)
  const setProfileDialogOpen = useSetAtom(profileDialogAtom)
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const avatarUploaderRef = useRef<HTMLInputElement>(null)
  const uploadUserAvatar = useCallback(async () => {
    if (user?.id !== props.user.id) {
      return
    }
    // open a file dialog to upload avatar
    avatarUploaderRef.current?.click()
    // TODO: finish the resource upload logic
  }, [user, props.user])
  // TODO: add password, email, nickname change logic
  const { execute: executeUploadResource } = useResourceUpload()
  const { execute: executeUpdateUser } = useUpdateUser()
  useEffect(() => {
    const el = avatarUploaderRef.current
    const handleFileChange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        const res = await executeUploadResource([file])
        const avatar = res.result[0].id
        await executeUpdateUser({ avatar })
      }
    }

    el?.addEventListener('change', handleFileChange)
    return () => {
      el?.removeEventListener('change', handleFileChange)
    }
  }, [avatarUploaderRef])

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>用户信息</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 relative">
        <input
          type="file"
          className="hidden"
          accept="image/png,image/jpg,image/jpeg,image/webp"
          ref={avatarUploaderRef}
        />
        <Avatar className="w-24 h-24 cursor-default" onClick={uploadUserAvatar}>
          {props.user.avatar && (
            <AvatarImage
              src={
                props.user.avatar
                  ? getResourceUrl(props.user.avatar)
                  : undefined
              }
              draggable={false}
            />
          )}
          <AvatarFallback>{props.user.nickName}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold">{props.user.nickName}</div>
          <div className="font-mono text-sm">{props.user.email}</div>
        </div>
        {user?.id !== props.user.id && (
          <Button
            onClick={() => {
              setChatRoomID(props.user.id)
              setChatRoomType(ChatType.Private)
              setProfileDialogOpen(false)
            }}
          >
            聊天
          </Button>
        )}
        {user?.id === props.user.id && (
          <Button onClick={() => {}}>修改密码</Button>
        )}
      </div>
    </DialogContent>
  )
}

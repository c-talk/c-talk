import { useUserById } from '@/hooks/apis/chat'
import { User } from '@/hooks/apis/users'
import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export type UserItemProps = {
  userID?: string
  user?: User
  onClick?: (user: User) => void
}

export default function UserItem(props: UserItemProps) {
  if (!props.user && !props.userID) {
    return null
  }
  if (props.userID) {
    return <UserItemWithFetcher userID={props.userID} onClick={props.onClick} />
  }
  return <UserItemInner {...(props.user as User)} onClick={props.onClick} />
}

export function UserItemWithFetcher(
  props: Required<Omit<UserItemProps, 'user' | 'onClick'>> & {
    onClick?: (user: User) => void
  }
) {
  const { execute } = useUserById()
  const { data, isLoading, error } = useSWR(`/user/${props.userID}`, () =>
    execute(props.userID)
  )
  if (isLoading)
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        加载中
      </div>
    )
  if (error)
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        加载失败
      </div>
    )
  return <UserItem user={data?.result} />
}

export function UserItemInner(
  props: User & { onClick?: (user: User) => void }
) {
  return (
    <div
      className="h-14 w-full flex gap-4 items-center hover:bg-slate-100/60 p-3 rounded-md"
      onClick={() => props.onClick?.(props)}
    >
      <div className="w-12 h-12 bg-slate-200 rounded-full">
        <Avatar className="w-12 h-12 cursor-default">
          {props?.avatar && (
            <AvatarImage
              src={props?.avatar ? getResourceUrl(props?.avatar) : undefined}
              draggable={false}
            />
          )}
          <AvatarFallback>{props?.nickName}</AvatarFallback>
        </Avatar>
      </div>
      <div className="text-base font-semibold">{props.nickName}</div>
    </div>
  )
}

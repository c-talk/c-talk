import { useUserSearch } from '@/hooks/apis/chat'
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
  const { execute } = useUserSearch()
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
  return <UserItem user={data?.result.items[0]} />
}

export function UserItemInner(
  props: User & { onClick?: (user: User) => void }
) {
  return (
    <div
      className="h-14 flex gap-2 items-center"
      onClick={() => props.onClick?.(props)}
    >
      <div className="w-10 h-10 bg-slate-200 rounded-full">
        <Avatar className="w-10 h-10 cursor-default">
          {props?.avatar && (
            <AvatarImage
              src={props?.avatar ? getResourceUrl(props?.avatar) : undefined}
              draggable={false}
            />
          )}
          <AvatarFallback>{props?.nickName}</AvatarFallback>
        </Avatar>
      </div>
      <div>{props.nickName}</div>
    </div>
  )
}

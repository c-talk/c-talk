import { User, useUserById } from '@/hooks/apis/users'
import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export type UserItemProps = {
  userID?: string
  user?: User
  hideInfo?: boolean
  onClick?: (user: User) => void
}

export default function UserItem(props: UserItemProps) {
  if (!props.user && !props.userID) {
    return null
  }
  if (props.userID) {
    return <UserItemWithFetcher userID={props.userID} {...props} />
  }
  return <UserItemInner user={props.user!} {...props} />
}

export function UserItemWithFetcher(
  props: Required<Pick<UserItemProps, 'userID'>> & Omit<UserItemProps, 'userID'>
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
  if (!data)
    return (
      <div className="h-14 flex items-center justify-center text-slate-500">
        无数据
      </div>
    )
  return <UserItemInner user={data.result} {...props} />
}

export function UserItemInner(
  props: Required<Pick<UserItemProps, 'user'>> & Omit<UserItemProps, 'user'>
) {
  const { user, hideInfo = false, onClick } = props
  return (
    <div
      className={cn(
        'flex items-center h-14 hover:bg-slate-100/60',
        hideInfo &&
          'w-14 hover:cursor-pointer justify-center hover:rounded-full',
        !hideInfo && 'w-full gap-4  rounded-md p-3'
      )}
      onClick={() => onClick?.(user)}
    >
      <div className="w-12 h-12 bg-slate-200 rounded-full">
        <Avatar className="w-12 h-12 cursor-default">
          {user.avatar && (
            <AvatarImage
              className="object-cover"
              src={user.avatar ? getResourceUrl(user.avatar) : undefined}
              draggable={false}
            />
          )}
          <AvatarFallback>{user.nickName}</AvatarFallback>
        </Avatar>
      </div>
      {!hideInfo && (
        <div>
          <div className="text-sm font-semibold">{user.nickName}</div>
          <div className="text-xs text-slate-500 line-clamp-1 text-ellipsis overflow-hidden">
            {user.email}
          </div>
        </div>
      )}
    </div>
  )
}

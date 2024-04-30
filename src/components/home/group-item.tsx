import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Group, useGroupById } from '@/hooks/apis/chat'
import useSWR from 'swr'

type GroupItemExtendProps = {
  onClick?: (groupID: string) => void
}

export default function GroupItem(
  props: { group: Group } & GroupItemExtendProps
) {
  const { group, onClick } = props
  return (
    <div
      className="h-14 w-full flex gap-4 items-center hover:bg-slate-100/60 p-3 rounded-md"
      onClick={() => onClick?.(group.id)}
    >
      <div className="w-12 h-12 bg-slate-200 rounded-full">
        <Avatar className="w-12 h-12 cursor-default">
          {group.avatar && (
            <AvatarImage
              className="object-cover"
              src={getResourceUrl(group.avatar)}
              draggable={false}
            />
          )}
          <AvatarFallback>{group.name}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col">
        <div className="text-sm text-slate-900">{group.name}</div>
        <div className="text-xs text-slate-500 line-clamp-1 text-ellipsis overflow-hidden">
          {group.desc}
        </div>
      </div>
    </div>
  )
}

export function GroupItemWithFetcher(
  props: { groupID: string } & GroupItemExtendProps
) {
  const { execute } = useGroupById()
  const { data, isLoading, error } = useSWR(`/group/${props.groupID}`, () =>
    execute(props.groupID)
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
  return !data ? (
    <div className="h-14 flex items-center justify-center text-slate-500">
      群组不存在
    </div>
  ) : (
    <GroupItem group={data!.result.group} {...props} />
  )
}

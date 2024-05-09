import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  JoinedGroupVo,
  useDismissGroup,
  useGroupById,
  useLeaveGroup
} from '@/hooks/apis/chat'
import { removeChatItemAtom } from '@/stores/home'
import { userAtom } from '@/stores/user'
import { useMemoizedFn } from 'ahooks'
import { useAtomValue, useSetAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'

export type AskDismissOrLeaveGroupAlertDialog = {
  joinedGroupVo: JoinedGroupVo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AskDismissOrLeaveGroupAlertDialog(
  props: AskDismissOrLeaveGroupAlertDialog
) {
  const { joinedGroupVo, open, onOpenChange } = props
  const user = useAtomValue(userAtom)
  const leaveGroup = useLeaveGroup()
  const dismissGroup = useDismissGroup()
  const isOwner = joinedGroupVo?.group.owner === user?.id
  const [loading, setLoading] = useState(false)
  const mutate = useGlobalMutation()
  const removeChatItemFromList = useSetAtom(removeChatItemAtom)
  const onLeaveOrDismissGroup = useMemoizedFn(async (group: JoinedGroupVo) => {
    if (!group) return
    setLoading(true)
    try {
      if (isOwner) {
        await dismissGroup.execute(group.group.id)
      }
      console.log(await leaveGroup.execute(group.group.id))
      removeChatItemFromList(group.group.id)
      mutate((key) => typeof key === 'string' && key.includes('/joined/groups'))
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  })

  const getGroupInfo = useGroupById()
  const { data } = useSWR(
    () => (!joinedGroupVo ? null : `/group/${joinedGroupVo.group.id}`),
    () => getGroupInfo.execute(joinedGroupVo!.group.id)
  )

  if (!joinedGroupVo || !data) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            你确定要{isOwner ? '解散' : '退出'}群组&nbsp;
            <i>{data?.result.group.name}</i> 吗？
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isOwner
              ? '世上没有后悔药，请三思而行。一旦解散，群组将永久消失，所有成员都会被移出。'
              : '退出后将无法再接收到群组消息。'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              onLeaveOrDismissGroup(joinedGroupVo)
            }}
          >
            {loading && <Loader2 className="animate-spin" />} 确认
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import {
  Drawer,
  DrawerContentWithRight,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGroupById } from '@/hooks/apis/chat'
import { chatRoomIDAtom } from '@/stores/home'
import { useAtomValue } from 'jotai'
import useSWR from 'swr'
import { UserItemWithFetcher } from './user-item'

export default function GroupListViewerDrawer({
  children
}: {
  children: React.ReactNode
}) {
  const group = useGroupById()
  const chatID = useAtomValue(chatRoomIDAtom)
  // TODO: It should be replaced with Group members page api
  const { data } = useSWR(`/chat/group/${chatID}`, () => group.execute(chatID))

  return (
    <Drawer direction="right">
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContentWithRight>
        <DrawerHeader>
          <DrawerTitle>成员列表</DrawerTitle>
        </DrawerHeader>
        <ScrollArea>
          <div className="grid gap-1 pl-0.25 pr-5">
            {data?.result.memberList.map((member) => (
              <UserItemWithFetcher key={member.uid} userID={member.uid} />
            ))}
          </div>
        </ScrollArea>
      </DrawerContentWithRight>
    </Drawer>
  )
}

import ChatList from '@/components/home/chat-list'
import { ChatViewer } from '@/components/home/chat-viewer'
import GroupProfileDialog from '@/components/home/group-profile-dialog'
import { OperationsPanel } from '@/components/home/layout'
import ProfileDialog from '@/components/home/profile-dialog'
import SearchDialog from '@/components/home/search-dialog'
import SocketIOIndicator from '@/components/socket-io-indicator'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { useSyncChatList } from '@/hooks/apis/chat/sync'
import useNotification from '@/hooks/use-notification'
import { useNavigate } from '@/router'
import {
  chatListSearchInputAtom,
  groupProfileDialogAtom,
  groupProfileDialogPropsAtom,
  profileDialogAtom,
  profileDialogPropsAtom
} from '@/stores/home'
import { isUserExpiredAtom } from '@/stores/user'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'

export default function DashboardPage() {
  const [isUserExpired] = useAtom(isUserExpiredAtom)

  const navigate = useNavigate()
  useNotification() // Just for requesting notification permission

  // Dialogs
  const [profileDialog, setProfileDialog] = useAtom(profileDialogAtom)
  const profileDialogProps = useAtomValue(profileDialogPropsAtom)
  const [groupProfileDialog, setGroupProfileDialog] = useAtom(
    groupProfileDialogAtom
  )
  const groupProfileDialogProps = useAtomValue(groupProfileDialogPropsAtom)
  const [searchInput, setSearchInput] = useAtom(chatListSearchInputAtom)
  const syncList = useSyncChatList()
  useEffect(() => {
    if (isUserExpired) {
      navigate('/')
    } else {
      syncList.execute()
    }
  }, [isUserExpired])

  if (isUserExpired) {
    return null
  }

  return (
    <div className="flex h-[100vh]">
      <GroupProfileDialog
        {...groupProfileDialogProps}
        open={groupProfileDialog}
        onOpenChange={setGroupProfileDialog}
      />
      <ProfileDialog
        {...profileDialogProps}
        open={profileDialog}
        onOpenChange={setProfileDialog}
      />
      <OperationsPanel />
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[100vh] flex-1"
        autoSaveId="chat-main-layout"
      >
        <ResizablePanel defaultSize={25} className="bg-slate-50">
          <div className="flex flex-col h-full">
            <div className="h-14 px-2 flex items-center bg-slate-200 gap-2">
              <Input
                placeholder="Search"
                className="h-2/3 w-full"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <SearchDialog />
            </div>
            <ChatList className="flex-1" />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <ChatViewer />
        </ResizablePanel>
      </ResizablePanelGroup>

      <SocketIOIndicator />
    </div>
  )
}

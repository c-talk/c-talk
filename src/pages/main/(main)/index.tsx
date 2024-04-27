import ChatList from '@/components/home/chat-list'
import { ChatViewer } from '@/components/home/chat-viewer'
import { OperationsPanel } from '@/components/home/layout'
import ProfileDialog from '@/components/home/profile-dialog'
import SearchDialog from '@/components/home/search-dialog'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { useFriendsListSWR } from '@/hooks/apis/chat'
import { useToken } from '@/hooks/apis/users'
import { useNavigate } from '@/router'
import { profileDialogAtom, profileDialogPropsAtom } from '@/stores/home'
import {
  friendsAtom,
  isUserExpiredAtom,
  userAtom,
  websocketAuthTokenAtom
} from '@/stores/user'
import { useAsyncEffect } from 'ahooks'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

export default function DashboardPage() {
  const [isUserExpired] = useAtom(isUserExpiredAtom)
  const [websocketToken, setWebsocketToken] = useAtom(websocketAuthTokenAtom)
  const user = useAtomValue(userAtom)
  const { execute: executeGetWebsocketToken } = useToken()
  const navigate = useNavigate()
  useAsyncEffect(async () => {
    if (websocketToken === null && !!user) {
      const token = await executeGetWebsocketToken()
      console.log(token.result)
      setWebsocketToken(token.result)
    }
  }, [websocketToken, user])
  useWebsocket({
    onConnected: (socket) => {
      console.log(socket)
    }
  })

  // Friends
  const setFriendsList = useSetAtom(friendsAtom)
  useFriendsListSWR({
    onSuccess: (data) => {
      setFriendsList(data.result)
    }
  })

  // Dialogs
  const [profileDialog, setProfileDialog] = useAtom(profileDialogAtom)
  const profileDialogProps = useAtomValue(profileDialogPropsAtom)

  useEffect(() => {
    if (isUserExpired) {
      navigate('/')
    }
  }, [isUserExpired])

  if (isUserExpired) {
    return null
  }

  // const chats = [
  //   {
  //     name: 'Shad',
  //     avatar: 'https://github.com/shadcn.png',
  //     time: '2024/4/17 10:00:00',
  //     message: 'Hey! How are you?'
  //   },
  //   {
  //     name: 'Shad',
  //     avatar: 'https://github.com/shadcn.png',
  //     time: '2024/4/17 10:00:00',
  //     message: 'Hey! How are you?'
  //   },
  //   {
  //     name: 'Shad',
  //     avatar: 'https://github.com/shadcn.png',
  //     time: '2024/4/17 10:00:00',
  //     message: 'Hey! How are you?'
  //   }
  // ] satisfies ChatItem[]

  return (
    <div className="flex h-[100vh]">
      <ProfileDialog
        {...profileDialogProps}
        open={profileDialog}
        onOpenChange={setProfileDialog}
      />
      <OperationsPanel />
      <ResizablePanelGroup direction="horizontal" className="h-[100vh] flex-1">
        <ResizablePanel defaultSize={25} className="bg-slate-50">
          <div className="flex flex-col max-h-full h-fit">
            <div className="h-14 px-2 flex items-center bg-slate-200 gap-2">
              <Input placeholder="Search" className="h-2/3 w-full" />
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
    </div>
  )
}

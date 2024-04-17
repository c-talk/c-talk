import ChatList, { ChatItem } from '@/components/home/chat-list'
import { ChatViewer } from '@/components/home/chat-viewer'
import { OperationsPanel } from '@/components/home/layout'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'

export default function DashboardPage() {
  const chats = [
    {
      name: 'Shad',
      avatar: 'https://github.com/shadcn.png',
      time: '2024/4/17 10:00:00',
      message: 'Hey! How are you?'
    },
    {
      name: 'Shad',
      avatar: 'https://github.com/shadcn.png',
      time: '2024/4/17 10:00:00',
      message: 'Hey! How are you?'
    },
    {
      name: 'Shad',
      avatar: 'https://github.com/shadcn.png',
      time: '2024/4/17 10:00:00',
      message: 'Hey! How are you?'
    }
  ] satisfies ChatItem[]

  return (
    <div className="flex h-[100vh]">
      <OperationsPanel />
      <ResizablePanelGroup direction="horizontal" className="h-[100vh] flex-1">
        <ResizablePanel defaultSize={25} className="bg-slate-50">
          <div className="flex flex-col max-h-full h-fit">
            <div className="h-14 px-2 flex items-center bg-slate-200 gap-2">
              <Input placeholder="Search" className="h-2/3 w-full" />
            </div>
            <ChatList className="flex-1" chats={chats} />
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

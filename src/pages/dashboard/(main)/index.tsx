import { ChatViewer } from '@/components/dashboard/chat-viewer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import SolarChatDotsLinear from '~icons/solar/chat-dots-linear'
import SolarSettingsOutline from '~icons/solar/settings-outline'

export default function DashboardPage() {
  return (
    <div className="flex h-[100vh]">
      <div className="w-[3.75em] h-full bg-slate-700">
        <div className="h-full flex flex-col pt-5 pb-3 gap-5">
          <div className="flex w-full items-center justify-center">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-center justify-center w-full h-10">
            <SolarChatDotsLinear className="text-2xl text-white" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center justify-center w-full h-10">
            <SolarSettingsOutline className="text-2xl text-white" />
          </div>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="h-[100vh] flex-1">
        <ResizablePanel defaultSize={25} className="bg-slate-50">
          <div className="flex flex-col max-h-full h-fit">
            <div className="h-14 px-2 flex items-center bg-slate-200 gap-2">
              <Input placeholder="Search" className="h-2/3 w-full" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex flex-col">
                    <div className="flex w-full justify-between">
                      <div className="font-bold text-sm">Shad</div>
                      <div className="text-xs text-slate-600">10:00</div>
                    </div>
                    <div className="text-xs text-slate-600">
                      Hey! How are you?
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex flex-col">
                    <div className="flex w-full justify-between">
                      <div className="font-bold text-sm">Shad</div>
                      <div className="text-xs text-slate-600">10:00</div>
                    </div>
                    <div className="text-xs text-slate-600">
                      Hey! How are you?
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex flex-col">
                    <div className="flex w-full justify-between">
                      <div className="font-bold text-sm">Shad</div>
                      <div className="text-xs text-slate-600">10:00</div>
                    </div>
                    <div className="text-xs text-slate-600">
                      Hey! How are you?
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export function NoSelectedChat() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <IconSolarInboxArchiveOutline className="text-4xl text-slate-400" />
      <p className="text-xs font-semibold text-slate-400">
        Please select a chat
      </p>
    </div>
  )
}

// 聊天界面
export function ChatViewer() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-20">测试名字</div>
    </div>
  )
}

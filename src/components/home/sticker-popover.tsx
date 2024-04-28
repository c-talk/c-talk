import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import emojis from 'emoji.json'
import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Popover } from '../ui/popover'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
const emojiMapping = emojis.reduce(
  (acc, emoji) => {
    acc[emoji.group] = [...(acc[emoji.group] || []), emoji.char]
    return acc
  },
  {} as Record<string, string[]>
)

type StickerPopoverProps = {
  children: React.ReactNode
  onStickerSelect?: (sticker: string) => void
}

export default function StickerPopover(props: StickerPopoverProps) {
  const [group, setGroup] = useState('Smileys & Emotion')
  const [isLoading, startTransition] = useTransition()
  return (
    <Popover>
      <PopoverTrigger>{props.children}</PopoverTrigger>
      <PopoverContent className="w-80 z-10 bg-slate-100 rounded-md">
        {/* add emojis card */}
        <ScrollArea className="h-[11rem] px-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {emojiMapping[group].map((item) => {
                return (
                  <div
                    key={item}
                    className="text-2xl cursor-pointer"
                    onClick={() => {
                      props.onStickerSelect?.(item)
                    }}
                  >
                    {item}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        <ScrollArea>
          <div className="flex w-max space-x-4 p-2">
            {Object.keys(emojiMapping).map((item) => {
              return (
                <div
                  key={item}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    startTransition(() => {
                      setGroup(item)
                    })
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

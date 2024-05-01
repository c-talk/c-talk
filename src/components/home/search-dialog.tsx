import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Group, useChatSearch } from '@/hooks/apis/chat'
import { useDebounce } from 'ahooks'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Input } from '../ui/input'

import { User } from '@/hooks/apis/users'
import { chatRoomIDAtom, chatRoomTypeAtom } from '@/stores/home'
import { userAtom } from '@/stores/user'
import { ChatType } from '@/types/globals'
import { useAtomValue, useSetAtom } from 'jotai'
import { ScrollArea } from '../ui/scroll-area'
import GroupItem from './group-item'
import styles from './search-dialog.module.scss'
import UserItem from './user-item'

// TODO: add group 搜索
function SearchDialogContent(props: {
  onUserSelect?: (user: User) => void
  onGroupSelect?: (group: string) => void
}) {
  const user = useAtomValue(userAtom)
  const [searchKeyword, setSearchKeyword] = useState('')
  const deferredSearchKeyword = useDebounce(searchKeyword)
  const [searchList, setSearchList] = useState<[Group[], Group[], User[]]>(
    Array(3).fill([]) as [Group[], Group[], User[]]
  )
  const { execute: executeChatSearch } = useChatSearch()
  const { isLoading } = useSWR(
    !!deferredSearchKeyword ? ['/chat/search', deferredSearchKeyword] : null,
    () => executeChatSearch(deferredSearchKeyword),
    {
      onSuccess: (data) => {
        setSearchList(data as [Group[], Group[], User[]])
      }
    }
  )

  const total = useMemo(
    () => searchList.reduce((acc, cur) => acc + (cur?.length || 0), 0),
    [searchList]
  )

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>发现</DialogTitle>
        <div className="grid gap-2">
          <div className="relative h-14 flex items-center gap-2">
            <Input
              placeholder="搜索内容……"
              className="h-2/3 w-full"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
              }}
            />
            {isLoading && (
              <div className="absolute right-2">
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <ScrollArea className="h-80">
              {total === 0 && (
                <div className="h-14 flex items-center justify-center text-slate-500">
                  无搜索结果
                </div>
              )}
              {searchList[2]?.length > 0 && (
                <div className="grid gap-2">
                  <div className="text-slate-800 text-sm ml-3">用户</div>
                  {searchList[2]
                    .filter((o) => o.id !== user!.id)
                    .map((item) => (
                      <UserItem
                        key={item.id}
                        user={item}
                        onClick={props.onUserSelect}
                      />
                    ))}
                </div>
              )}
              {searchList[0]?.length > 0 ||
                (searchList[1]?.length > 0 && (
                  <div className="grid gap-2">
                    <div className="text-slate-800 text-sm ml-3">群组</div>
                    {(searchList[0] || [])
                      .concat(searchList[1] || [])
                      .map((item) => (
                        <GroupItem
                          key={item.id}
                          group={item}
                          onClick={(group) => {
                            props.onGroupSelect?.(group)
                          }}
                        />
                      ))}
                  </div>
                ))}
            </ScrollArea>
          </div>
        </div>
      </DialogHeader>
    </DialogContent>
  )
}

export default function SearchDialog(props: {
  onUserSelect?: (user: User) => void
}) {
  const [open, setOpen] = useState(false)
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={clsx(styles['search-button'])}>
        <IconSolarAddCircleLinear
          className={clsx('w-5 h-5 text-slate-500', styles.icon)}
        />
      </DialogTrigger>
      <SearchDialogContent
        onUserSelect={(user) => {
          setOpen(false)
          setChatRoomID(user.id)
          setChatRoomType(ChatType.Private)
          props.onUserSelect?.(user)
        }}
        onGroupSelect={(group) => {
          setOpen(false)
          setChatRoomID(group)
          setChatRoomType(ChatType.Group)
        }}
      />
    </Dialog>
  )
}

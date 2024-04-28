import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useUserSearch } from '@/hooks/apis/chat'
import { useDebounce } from 'ahooks'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'
import { Input } from '../ui/input'

import { User } from '@/hooks/apis/users'
import { chatRoomIDAtom, chatRoomTypeAtom } from '@/stores/home'
import { userAtom } from '@/stores/user'
import { ChatType } from '@/types/globals'
import { useAtomValue, useSetAtom } from 'jotai'
import styles from './search-dialog.module.scss'
import UserItem from './user-item'

// TODO: add group 搜索
function SearchDialogContent(props: { onUserSelect?: (user: User) => void }) {
  const user = useAtomValue(userAtom)
  const [searchKeyword, setSearchKeyword] = useState('')
  const deferredSearchKeyword = useDebounce(searchKeyword)
  const [searchList, setSearchList] = useState<User[]>([])
  const { execute: executeUserSearch } = useUserSearch()
  const { isLoading } = useSWR(
    !!deferredSearchKeyword ? ['/user/search', deferredSearchKeyword] : null,
    () => executeUserSearch(deferredSearchKeyword),
    {
      onSuccess: (data) => {
        console.log(data)
        setSearchList(data.result.items)
      }
    }
  )

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>搜索</DialogTitle>
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
          {searchList.length > 0 ? (
            <div className="grid gap-2">
              {searchList
                .filter((o) => o.id !== user!.id)
                .map((item) => (
                  <UserItem
                    key={item.id}
                    user={item}
                    onClick={props.onUserSelect}
                  />
                ))}
            </div>
          ) : (
            <div className="h-14 flex items-center justify-center text-slate-500">
              无搜索结果
            </div>
          )}
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
      />
    </Dialog>
  )
}

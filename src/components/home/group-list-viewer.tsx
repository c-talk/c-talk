import {
  Drawer,
  DrawerContentWithRight,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { ScrollAreaWithoutViewport } from '@/components/ui/scroll-area'
import { useGroupMemberList } from '@/hooks/apis/chat'
import { chatRoomIDAtom } from '@/stores/home'
import { ScrollAreaViewport } from '@radix-ui/react-scroll-area'
import { useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import useInfiniteScroll from 'react-infinite-scroll-hook'
import useSWRInfinite from 'swr/infinite'
import { UserItemWithFetcher } from './user-item'

const PAGE_SIZE = 20

export default function GroupListViewerDrawer({
  children
}: {
  children: React.ReactNode
}) {
  const groupMemberList = useGroupMemberList()
  const chatID = useAtomValue(chatRoomIDAtom)
  // TODO: It should be replaced with Group members page api
  const { data, isLoading, error, size, setSize } = useSWRInfinite(
    (index, prev) => {
      if (prev && !prev.result?.items?.length) return null
      return `/chat/group/${chatID}?page=${index + 1}&pageSize=${PAGE_SIZE}`
    },
    (url) => {
      const parsedURL = new URL(url, window.location.href)
      const page = Number(parsedURL.searchParams.get('page'))
      return groupMemberList.execute(chatID, {
        pageNum: page,
        pageSize: PAGE_SIZE
      })
    },
    {
      revalidateOnFocus: true,
      revalidateAll: true
    }
  )
  const total = useMemo(() => data?.[0]?.result?.total || 0, [data])
  const hasNextPage = useMemo(() => {
    console.log(size)
    return total > size * PAGE_SIZE
  }, [total, size])
  const onLoadMore = () => {
    setSize((size) => size + 1)
  }
  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    disabled: !!error,
    hasNextPage,
    onLoadMore
    // rootMargin: '400px 0px 0px 0px'
  })

  return (
    <Drawer direction="right">
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContentWithRight>
        <DrawerHeader>
          <DrawerTitle>成员列表</DrawerTitle>
        </DrawerHeader>
        <ScrollAreaWithoutViewport>
          <ScrollAreaViewport ref={rootRef}>
            {error && <div>加载失败</div>}
            {isLoading && (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            <div className="grid gap-1 pl-0.25 pr-5">
              {data?.map((page) =>
                page.result?.items?.map((member) => (
                  <UserItemWithFetcher key={member.uid} userID={member.uid} />
                ))
              )}
            </div>
            {hasNextPage && (
              <div
                className="flex items-center justify-center"
                ref={infiniteRef}
              >
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </ScrollAreaViewport>
        </ScrollAreaWithoutViewport>
      </DrawerContentWithRight>
    </Drawer>
  )
}

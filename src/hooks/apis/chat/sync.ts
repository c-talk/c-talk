import {
  chatListAtom,
  chatListSyncCursorAtom,
  chatListTryUpdateWhileNewMessageAtom
} from '@/stores/home'
import { ChatType } from '@/types/globals'
import { useMemoizedFn } from 'ahooks'
import dayjs from 'dayjs'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useFriendListWithMessage } from './friends'
import { useJoinedGroupWithMessage } from './group'

const PAGE_SIZE = 5

export function useSyncChatList() {
  const [chatListCursor, setChatListCursor] = useAtom(chatListSyncCursorAtom)
  const friendPageWithMessage = useFriendListWithMessage()
  const groupPageWithMessage = useJoinedGroupWithMessage()
  const tryAddChatOrMessage = useSetAtom(chatListTryUpdateWhileNewMessageAtom)
  const chatList = useAtomValue(chatListAtom)
  const execute = useMemoizedFn(async () => {
    let userTotal = 0
    let userPage = 0
    let groupTotal = 0
    let groupPage = 0
    const syncCursor = Date.now()
    console.log('sync chat list start')
    do {
      const queue: [
        ReturnType<(typeof friendPageWithMessage)['execute']> | undefined,
        ReturnType<(typeof groupPageWithMessage)['execute']> | undefined
      ] = new Array(2).fill(undefined) as [undefined, undefined]
      if (userTotal === 0 || userPage * PAGE_SIZE < userTotal) {
        console.log(`syncing friends page ${userPage + 1}, total ${userTotal}`)
        queue[0] = friendPageWithMessage.execute({
          pageNum: userPage + 1,
          pageSize: PAGE_SIZE
        })
      }
      if (groupTotal === 0 || groupPage * PAGE_SIZE < groupTotal) {
        console.log(`syncing groups page ${groupPage + 1}, total ${groupTotal}`)
        queue[1] = groupPageWithMessage.execute({
          pageNum: groupPage + 1,
          pageSize: PAGE_SIZE
        })
      }
      const res = await Promise.all(queue)
      if (res[0]) {
        userTotal = res[0].result?.total || 0
        userPage++
        for (const item of res[0].result?.items || []) {
          const chat = chatList.find(
            (chat) => chat.meta.chatID === item.friendId
          )
          if (
            !item.message ||
            (!chat &&
              chatListCursor > dayjs(item.message?.createTime).valueOf()) || // 跳过同步，理由为聊天队列手动移除操作
            (chat && chat.message?.id === item.message?.id)
          ) {
            console.log(
              `skip friend ${item.friendId} message ${item.message?.id}`
            )
            continue // 跳过同步，理由为聊天队列手动移除操作
          }
          console.log(item)
          tryAddChatOrMessage({
            chatType: ChatType.Private,
            chatID: item.friendId,
            ...item.message!
          })
        }
      }
      if (res[1]) {
        groupTotal = res[1].result?.total || 0
        groupPage++
        for (const item of res[1].result?.items || []) {
          const chat = chatList.find((chat) => chat.meta.chatID === item.gid)
          if (
            !item.message ||
            (!chat &&
              chatListCursor > dayjs(item.message?.createTime).valueOf()) || // 跳过同步，理由为聊天队列手动移除操作
            (chat && chat.message?.id === item.message?.id)
          ) {
            console.log(`skip group ${item.gid} message ${item.message?.id}`)
            continue
          }
          console.log(item)
          tryAddChatOrMessage({
            chatType: ChatType.Group,
            chatID: item.gid,
            ...item.message!
          })
        }
      }
    } while (
      groupPage * PAGE_SIZE < groupTotal ||
      userPage * PAGE_SIZE < userTotal
    )
    console.log('sync chat list done')
    setChatListCursor(syncCursor)
  })
  return {
    execute
  }
}

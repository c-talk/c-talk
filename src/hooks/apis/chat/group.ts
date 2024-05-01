import { Page, R } from '@/hooks/ofetch'
import { userAtom } from '@/stores/user'
import { BasePo, PageParams } from '@/types/globals'
import { useAtomValue } from 'jotai'
import { basePageParams } from '../shared'

export type GroupSearchForm = {
  name: string
  code: string
}

export interface Group extends BasePo {
  name: string
  code: string
  desc: string
  avatar: string
  banner: string
  owner: string
}

export function useGroupSearch() {
  const ofetch = useFetch()
  const execute = async (
    searchParams: Partial<GroupSearchForm>,
    pageParams: Partial<PageParams> = {}
  ) => {
    if (!Object.keys(searchParams)) return Promise.reject('搜索参数不能为空')
    pageParams = { ...basePageParams, ...pageParams } as PageParams
    return ofetch<R<Page<Group>>>('/group/page', {
      method: 'POST',
      body: { ...searchParams, ...pageParams }
    })
  }
  return {
    execute
  }
}

export type Member = {
  gid: string
  uid: string
  role: string[]
  alias: string | null
}

export type GetGroupVo = {
  group: Group
  member: boolean
  memberList: Member[]
}

export function useGroupById() {
  const ofetch = useFetch()
  const execute = async (groupID: string) => {
    return ofetch<R<GetGroupVo>>(`/group/get/${groupID}`)
  }
  return {
    execute
  }
}

export type CreateGroupForm = {
  name: string
  desc: string
  avatar?: string
  banner?: string
}

export function useCreateGroup() {
  const ofetch = useFetch()
  const execute = async (params: CreateGroupForm) => {
    return ofetch<R<Group>>('/group/create', {
      method: 'POST',
      body: params
    })
  }
  return {
    execute
  }
}

export function useJoinGroup() {
  const ofetch = useFetch()
  const execute = async (groupID: string) => {
    return ofetch<R<void>>(`/group/join`, {
      method: 'POST',
      body: { id: groupID }
    })
  }
  return {
    execute
  }
}

export type GroupUpdateForm = {
  id: string
  name: string
  code: string
  desc: string
  avatar: string
  banner: string
}

export function useGroupUpdate() {
  const ofetch = useFetch()
  const execute = async (
    params: Omit<Partial<GroupUpdateForm>, 'id'> & Pick<GroupUpdateForm, 'id'>
  ) => {
    if (Object.keys(params).length === 1) return Promise.reject('参数不能为空')
    return ofetch<R<Group>>('/group/set', {
      method: 'POST',
      body: params
    })
  }
  return {
    execute
  }
}

export function useJoinedGroups() {
  const ofetch = useFetch()
  const user = useAtomValue(userAtom)
  const execute = async (page: Partial<PageParams> = {}) => {
    const pageParams = { ...basePageParams, ...page } as PageParams
    return ofetch<R<Page<Group>>>(`/group/page/joined`, {
      method: 'POST',
      body: {
        ...pageParams,
        uid: user!.id
      }
    })
  }
  return {
    execute
  }
}

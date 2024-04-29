export enum MessageType {
  Text = 1,
  Image,
  Voice
}

export enum ChatType {
  Private = 1,
  Group = 2
}

export enum ResourceType {
  Image = 1,
  Voice = 2,
  File = 3
}

export type BasePo = {
  id: string
  createTime: string
  updateTime: string
}

export interface Message extends BasePo {
  content: string
  type: MessageType
  receiver: string
  sender: string
}

export type Chat = {
  id: string
  type: ChatType
  name: string
  avatar?: string // group avatar or user avatar
  last_message: Message
  unread_count: number
}

export type UserDetail = {
  id: string
  name: string
  avatar: string
  status: string
  created_at: string // Join time
}

export type GroupDetail = {
  id: string
  name: string
  avatar: string
  description: string
  created_at: string
  members: UserDetail[]
}

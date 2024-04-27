export enum MessageType {
  Text = 1,
  Image,
  Voice
}

export enum ChatType {
  Group = 1,
  Private
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

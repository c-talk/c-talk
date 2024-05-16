import { invoke } from '@tauri-apps/api/tauri'

export type SendNotificationParams = {
  title: string
  body: string
  icon?: string
}

export function sendNotification(params: SendNotificationParams) {
  return invoke<void>('send_notification', params)
}

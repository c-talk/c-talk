import { isTauri } from '@/utils/env'

export type NotificationMessage = {
  title: string
  body: string
  icon?: string
}

let permissionGranted = false

export function useTauriNotification() {
  const checkPermission = async () => {
    const { isPermissionGranted, requestPermission } = await import(
      '@tauri-apps/api/notification'
    )
    permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }
    return permissionGranted
  }
  const showNotification = async (message: NotificationMessage) => {
    if (!(await checkPermission())) {
      return
    }
    const { sendNotification } = await import('@/libs/cmds')
    const params = {
      title: message.title,
      body: message.body
    } as NotificationMessage
    if (message.icon) {
      params.icon = message.icon
    }
    await sendNotification(params)
  }
  return {
    checkPermission,
    showNotification
  }
}

export function useBrowserNotification() {
  const checkPermission = async () => {
    permissionGranted = Notification.permission === 'granted'
    if (!permissionGranted) {
      await Notification.requestPermission()
      permissionGranted = Notification.permission === 'granted'
    }
    return permissionGranted
  }
  const showNotification = async (message: NotificationMessage) => {
    if (await checkPermission()) {
      new Notification(message.title, {
        body: message.body,
        icon: message.icon
      })
    }
  }
  return {
    checkPermission,
    showNotification
  }
}

export default function useNotification() {
  if (isTauri()) {
    return useTauriNotification()
  }
  return useBrowserNotification()
}

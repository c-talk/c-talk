import { useToast } from '@/components/ui/use-toast'
import { userAtom, websocketAuthTokenAtom } from '@/stores/user'
import { useLatest } from 'ahooks'
import { useAtom, useSetAtom } from 'jotai'
import { ofetch } from 'ofetch'

export interface R<T> {
  code: number
  message: string
  result: T
  ts: number
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export const useFetch = () => {
  const [user, setUser] = useAtom(userAtom)
  const setWebsocketAuthToken = useSetAtom(websocketAuthTokenAtom)
  const latestUserRef = useLatest(user)
  const { toast } = useToast()
  // console.log(user)

  return ofetch.create({
    baseURL: import.meta.env.VITE_HTTP_ENDPOINT,
    // timeout: 5000,
    retry: 5,
    async onRequest({ request, options }) {
      // Log request
      console.log('[fetch request]', request, options)
      console.log(latestUserRef.current?.token)
      if (latestUserRef.current?.token) {
        options.headers = options.headers || {}
        if (Array.isArray(options.headers)) {
          options.headers.push([
            'Authorization',
            `Bearer ${latestUserRef.current.token}`
          ])
        } else {
          // @ts-expect-error Authorization header
          options.headers.Authorization = `Bearer ${latestUserRef.current.token}`
        }
      }

      // Add `?t=1640125211170` to query search params
      options.query = options.query || {}
      options.query.t = Date.now()
    },

    async onRequestError({ request, response, error }) {
      console.log('[fetch request error]', request, error)
      if (response?.status === 401) {
        setUser(null)
        setWebsocketAuthToken(null)
        return
      }
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request. Please try again.'
        // action: <ToastAction altText="Try again">Try again</ToastAction>
      })
      return Promise.reject(error)
    },

    async onResponse({ request, response, options }) {
      // Log response
      console.log('[fetch response]', request, response.status, response.body)

      // if json
      if (options.responseType === 'json') {
        const data = await response.json()
        if (data.code !== 0) {
          console.log(
            '[fetch response error]',
            request,
            response.status,
            response.body
          )
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description:
              'There was a problem with your request. Please try again.'
            // action: <ToastAction altText="Try again">Try again</ToastAction>
          })
          return Promise.reject(data)
        }
      }
    },
    async onResponseError({ request, response }) {
      // Log error
      console.log(
        '[fetch response error]',
        request,
        response.status,
        response.body
      )
      if (response.status === 401) {
        setUser(null)
        setWebsocketAuthToken(null)
        return
      }
      if (response._data) {
        console.error(response._data)
        if (response._data.code && response._data.message) {
          if (response._data.message.includes('锁获取失败')) {
            console.warn('锁获取失败')
          } else {
            toast({
              variant: 'destructive',
              title: '请求错误',
              description: `${response._data.code}: ${response._data.message}`
              // action: <ToastAction altText="Try again">Try again</ToastAction>
            })
          }
          return Promise.reject(response._data)
        }
      }
      return Promise.reject(response)
    }
  })
}

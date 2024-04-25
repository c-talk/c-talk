import { useToast } from '@/components/ui/use-toast'
import { userAtom } from '@/stores/user'
import { useAtom } from 'jotai'
import { ofetch } from 'ofetch'

export interface R<T> {
  code: number
  message: string
  result: T
  ts: number
}

export const useFetch = () => {
  const [user] = useAtom(userAtom)

  const { toast } = useToast()

  return ofetch.create({
    baseURL: `http://100.98.108.126:1002`,
    // timeout: 5000,
    retry: 5,
    async onRequest({ request, options }) {
      // Log request
      console.log('[fetch request]', request, options)

      if (user?.auth_token) {
        options.headers = options.headers || {}
        if (Array.isArray(options.headers)) {
          options.headers.push(['Authorization', `Bearer ${user.auth_token}`])
        } else {
          // @ts-expect-error Authorization header
          options.headers.Authorization = `Bearer ${user.auth_token}`
        }
      }

      // Add `?t=1640125211170` to query search params
      options.query = options.query || {}
      options.query.t = new Date()
    },

    async onRequestError({ request, error }) {
      console.log('[fetch request error]', request, error)
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request. Please try again.'
        // action: <ToastAction altText="Try again">Try again</ToastAction>
      })
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
      if (response._data) {
        console.error(response._data)
        if (response._data.code && response._data.message) {
          toast({
            variant: 'destructive',
            title: '请求错误',
            description: `${response._data.code}: ${response._data.message}`
            // action: <ToastAction altText="Try again">Try again</ToastAction>
          })
        }
      }
    }
  })
}

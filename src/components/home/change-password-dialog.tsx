import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useChangePassword } from '@/hooks/apis/users'
import { userAtom, websocketAuthTokenAtom } from '@/stores/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSetAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Input } from '../ui/input'

const formSchema = z
  .object({
    oriPassword: z.string().min(1),
    password: z.string().min(8),
    rePassword: z.string().min(8)
  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Passwords do not match',
    path: ['rePassword']
  })

export default function ChangePasswordDialog({
  children,
  isMenu = false
}: {
  children: React.ReactNode
  isMenu?: boolean
}) {
  const { execute } = useChangePassword()
  const setUser = useSetAtom(userAtom)
  const setWebsocketAuthToken = useSetAtom(websocketAuthTokenAtom)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oriPassword: '',
      password: '',
      rePassword: ''
    }
  })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      await execute(values)
      setOpen(false)
      setWebsocketAuthToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }
  // TODO: disable the overlay when the dialog is open
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isMenu ? (
        <>{children}</>
      ) : (
        <DialogTrigger asChild>{children}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="oriPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当前密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="请输入当前密码……"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    请输入您的当前密码以验证您的身份
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="请输入新密码……"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>请设置 8 位以上的密码</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rePassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认新密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="请再次输入新密码……"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>请与新密码保持一致</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row-reverse gap-3">
              <Button type="submit" disabled={loading}>
                更新密码{' '}
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

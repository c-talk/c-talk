import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { useRegister } from '@/hooks/apis/users'
import { useNavigate } from '@/router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FormSchema = z
  .object({
    email: z.string().email(),
    nickName: z.string().min(3),
    password: z.string().min(8),
    rePassword: z.string().min(8)
  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Passwords do not match',
    path: ['confirm_password']
  })

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { execute } = useRegister()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      nickName: '',
      password: '',
      rePassword: ''
    }
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true)
    try {
      await execute(data)
      toast({
        title: '注册成功',
        description: '请登录'
      })
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="w-4/5 sm:w-3/5 md:w-[42.85%] lg:w-2/5 xl:w-1/3 2xl:w-[22.2%]"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle>创建账号 😎</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="请输入邮箱……"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>昵称</FormLabel>
                    <FormControl>
                      <Input
                        type="nickName"
                        placeholder="请输入昵称……"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入密码……"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rePassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请再次输入密码……"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-3">
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              拥有账号？
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 注
              册
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

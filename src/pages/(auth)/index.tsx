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
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/hooks/apis/users'
import { useNavigate } from '@/router'
import { isUserExpiredAtom, userAtom } from '@/stores/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom, useSetAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export default function Index() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { execute: executeLogin } = useLogin()
  const setUser = useSetAtom(userAtom)
  const [isUserExpired] = useAtom(isUserExpiredAtom)

  if (!isUserExpired) {
    navigate('/main')
    return null
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  async function onSubmit(values: z.infer<typeof FormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setLoading(true)
    try {
      const user = await executeLogin(values.email, values.password)
      setUser(user.result)
      navigate('/main')
    } catch (e) {
      console.error(e)
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
            <CardTitle>Hello 👋</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
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
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
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
                navigate('/register')
              }}
            >
              没有账号？
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 登
              录
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

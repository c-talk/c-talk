import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCreateGroup } from '@/hooks/apis/chat'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useResourceUpload } from '@/hooks/apis/resource'
import {
  chatListTryAddAtom,
  chatRoomIDAtom,
  chatRoomTypeAtom
} from '@/stores/home'
import { ChatType } from '@/types/globals'
import { useSetAtom } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Textarea } from '../ui/textarea'

const formSchema = z.object({
  name: z.string().min(1).max(50),
  desc: z.string().min(1).max(100),
  avatar: z.instanceof(File).optional(),
  banner: z.instanceof(File).optional()
})

export default function CreateGroupDialog(props: {
  children: React.ReactNode
}) {
  const { children } = props
  const setChatRoomID = useSetAtom(chatRoomIDAtom)
  const setChatRoomType = useSetAtom(chatRoomTypeAtom)
  const tryAddChatToChatList = useSetAtom(chatListTryAddAtom)
  const [open, setOpen] = useState(false)
  const createGroup = useCreateGroup()
  const addResource = useResourceUpload()
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      desc: '',
      avatar: undefined,
      banner: undefined
    }
  })
  const watchName = form.watch('name')
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      let resourceId: string | undefined = undefined
      if (values.avatar) {
        const resource = await addResource.execute([values.avatar])
        resourceId = resource.result[0].id
      }
      const group = await createGroup.execute({
        ...values,
        banner: undefined, // TODO: Add banner
        avatar: resourceId
      })
      tryAddChatToChatList({
        chatID: group.result.id,
        chatType: ChatType.Group
      })
      setChatRoomID(group.result.id)
      setChatRoomType(ChatType.Group)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建群组</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex justify-center">
                      <Avatar className="w-[8rem] h-[8rem]">
                        <AvatarImage
                          src={
                            field.value
                              ? URL.createObjectURL(field.value)
                              : undefined
                          }
                        />
                        <AvatarFallback>{watchName}</AvatarFallback>
                      </Avatar>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpg,image/jpeg,image/webp"
                      value={undefined}
                      onChange={(e) => {
                        field.onChange(e.target.files?.[0])
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>群名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入群名……" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请输入群描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="float-end mt-2"
              disabled={!form.formState.isValid || loading}
            >
              创建群组{' '}
              {loading && (
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

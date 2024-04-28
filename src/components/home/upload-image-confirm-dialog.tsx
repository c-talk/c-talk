import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Resource, useResourceUpload } from '@/hooks/apis/resource'
import { useEffect, useState } from 'react'

export type UploadImageConfirmProps = {
  image: File
  onUploaded: (resource: Resource) => void
}

export interface UploadImageConfirmDialogProps extends UploadImageConfirmProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function UploadImageConfirmDialog(
  props: UploadImageConfirmDialogProps
) {
  const { open, setOpen } = props

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[25rem]">
        <DialogHeader>
          <DialogTitle>发送图片</DialogTitle>
        </DialogHeader>
        <UploadImageConfirmDialogContent {...props} />
      </DialogContent>
    </Dialog>
  )
}

export function UploadImageConfirmDialogContent(
  props: UploadImageConfirmProps &
    Pick<UploadImageConfirmDialogProps, 'setOpen'>
) {
  const { image, onUploaded, setOpen } = props
  const [isLoading, setLoading] = useState(false)
  const [objectURL, setObjectURL] = useState<string | null>(null)
  const { execute } = useResourceUpload()
  useEffect(() => {
    if (objectURL) URL.revokeObjectURL(objectURL)
    setObjectURL(URL.createObjectURL(image))
    return () => {
      if (objectURL) URL.revokeObjectURL(objectURL)
    }
  }, [image])
  return (
    <>
      <div className="flex justify-center">
        <img
          className="max-h-[30rem] rounded-sm"
          src={objectURL!}
          alt="preview"
          draggable={false}
        />
      </div>
      <DialogFooter className="mt-3 flex flex-row-reverse gap-2">
        <Button
          variant="secondary"
          onClick={() => setOpen(false)}
          disabled={isLoading}
        >
          取 消
        </Button>
        <Button
          onClick={async () => {
            setLoading(true)
            try {
              const res = await execute([image])
              onUploaded(res.result[0])
            } finally {
              setOpen(false)
            }
          }}
          disabled={isLoading}
        >
          发 送 {isLoading && '中……'}
        </Button>
      </DialogFooter>
    </>
  )
}

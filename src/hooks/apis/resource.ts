import { ResourceType } from '@/types/globals'
import { R } from '../ofetch'

export type Resource = {
  id: string
  name: string
  mime: string
  type: ResourceType
  created_at: string
}

export function useResourceUpload() {
  const ofetch = useFetch()
  const execute = async (files: File[]) => {
    // request files should be MultiPart
    const formData = new FormData()
    files.forEach((f) => {
      formData.append('files', f)
    })
    return ofetch<R<Resource[]>>('/resources/', {
      method: 'POST',
      body: formData
    })
  }
  return { execute }
}

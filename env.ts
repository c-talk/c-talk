import { defineConfig } from '@julr/vite-plugin-validate-env'
import { z } from 'zod'

export default defineConfig({
  validator: 'zod',
  schema: {
    VITE_HTTP_ENDPOINT: z.string().url().min(1),
    VITE_SOCKET_IO_ENDPOINT: z.string().url().min(1)
  }
})

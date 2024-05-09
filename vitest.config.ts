import { merge } from 'lodash-es'
import { defaultExclude, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'
export default defineConfig((env) => {
  console.log(env.mode)
  return merge(
    viteConfig(env),
    defineConfig({
      // optimizeDeps: {
      //   entries: []
      // },
      test: {
        testTimeout: 30_000,
        name: 'unit',
        // setupFiles: ['./test/setup.ts'],
        exclude: [...defaultExclude, '**/target/**', '**/dist/**']
      }
    })
  )
})

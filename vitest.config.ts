import { defaultExclude, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
export default mergeConfig(
  viteConfig,
  defineConfig({
    optimizeDeps: {
      entries: []
    },
    test: {
      testTimeout: 30_000,
      name: 'unit',
      // setupFiles: ['./test/setup.ts'],
      exclude: [...defaultExclude, '**/target/**', '**/dist/**']
    }
  })
)

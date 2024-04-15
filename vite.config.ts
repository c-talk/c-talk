import Generouted from '@generouted/react-router/plugin'
import React from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import I18nextLoader from 'vite-plugin-i18next-loader'
import SassDts from 'vite-plugin-sass-dts'
import Svgr from 'vite-plugin-svgr'
import TsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TsconfigPaths(),
    React(),
    Svgr(),
    Generouted(),
    SassDts(),
    I18nextLoader({
      paths: ['./locales']
    }),
    AutoImport({
      resolvers: [
        IconsResolver({
          prefix: 'Icon',
          extension: 'jsx'
        })
      ],
      dirs: ['src/hooks', 'src/components', 'src/utils'],
      dts: 'src/types/auto-imports.d.ts'
    }),
    Icons({
      compiler: 'jsx' // or 'solid'
    })
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 12321,
    strictPort: true
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.app/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_']
})

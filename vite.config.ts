import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import Pages from 'vite-plugin-pages'
import pkg from './package.json'

const external = Object.keys('dependencies' in pkg ? pkg.dependencies : {})

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@/': `/${path.resolve(__dirname, 'src')}/`,
      },
    },
    plugins: [
      vue(),
      Pages(),
      electron([
        {
          entry: 'electron/main/index.ts',
          onstart(options) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            options.startup()
          },
          vite: {
            build: {
              outDir: 'dist-electron/main',
              rollupOptions: {
                external,
              },
            },
          },
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(options) {
            options.reload()
          },
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external,
              },
            },
          },
        },
      ]),
      renderer(),
    ],
  }
})

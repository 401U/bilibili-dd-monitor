import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'
import pkg from './package.json'

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@/': `/${path.resolve(__dirname, 'src')}/`
      }
    },
    plugins: [
      vue(),
      electron([
        {
          entry: 'src/electron/main/index.ts',
          onstart (options) {
            options.startup()
          },
          vite: {
            build: {
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
              }
            }
          }
        },
        {
          entry: 'src/electron/preload/index.ts',
          onstart (options) {
            options.reload()
          },
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
              }
            }
          }
        }
      ]),
      renderer()
    ],
    clearScreen: false
  }
})

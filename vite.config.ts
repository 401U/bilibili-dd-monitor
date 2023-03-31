import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

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
          vite: {
            build: {
              outDir: 'dist-electron/main'
            }
          }
        }
      ]),
      renderer()
    ],
    clearScreen: false
  }
})

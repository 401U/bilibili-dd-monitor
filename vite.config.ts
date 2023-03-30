import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import pkg from './package.json'
import path from 'path'

export default defineConfig(({ command }) => {
  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  return {
    resolve: {
      alias: {
        '@/': `/${path.resolve(__dirname, 'src')}/`
      }
    },
    plugins: [
      vue(),
      electron({
        entry: 'src/electron/mainWindow.ts',
        vite: {
          build: {
            sourcemap: sourcemap ? 'inline' : undefined,
            minify: isBuild,
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
            }
          }
        }
      }),
      renderer()
    ],
    clearScreen: false
  }
})

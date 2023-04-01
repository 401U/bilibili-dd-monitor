import { join } from 'node:path'
import { BrowserWindow, Menu } from 'electron'
import { createMainWindowMenu } from './mainWindowMenu'
import type ContextMap from './utils/ContextMap'

process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
if (process.env.VITE_DEV_SERVER_URL && process.env.DIST_ELECTRON)
  process.env.PUBLIC = join(process.env.DIST_ELECTRON, '../public')
else if (process.env.DIST_ELECTRON)
  process.env.PUBLIC = process.env.DIST

process.env.PUBLIC = (!process.env.VITE_DEV_SERVER_URL || !process.env.DIST_ELECTRON)
  ? process.env.DIST
  : join(process.env.DIST_ELECTRON, '../public')

const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

export async function createMainWindow(app: Electron.App, playerObjMap: ContextMap) {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    maximizable: true,
    fullscreen: false,
    fullscreenable: true,
    resizable: true,
    icon: join(process.env.PUBLIC, 'icons/icon.ico'),
    title: 'bilibili-dd-monitor',
    webPreferences: {
      preload,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      contextIsolation: true,
      webSecurity: true, // fix connect_error Error: websocket error
    },
  })
  if (process.env.VITE_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(url!)
    win.webContents.openDevTools()
  }
  else {
    // Load the index.html when not in development
    await win.loadFile(indexHtml)
  }

  // menu
  const menu = createMainWindowMenu(app, playerObjMap)
  if (process.platform === 'darwin')
    Menu.setApplicationMenu(menu)
  else
    win.setMenu(menu)

  // todo to fix: window resize will flash screen
  // solution: debounce resize event at a fixed rate, when resize finished, do resize
  // win.on('resize', ()=>{})

  playerObjMap.attachContext(win)

  return win
}

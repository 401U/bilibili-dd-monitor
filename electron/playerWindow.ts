import fs, { createWriteStream } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { pipeline } from 'node:stream'
import { BrowserWindow, nativeImage } from 'electron'

import fetch from 'node-fetch'
import { log } from './utils/logger'
import type ContextMap from './utils/ContextMap'
import type { PlayerObj, VtbInfo } from '@/interfaces'
const streamPipeline = promisify(pipeline)

function downloadAndSetWindowIcon(vtbInfo: VtbInfo, tempPath: string, win: Electron.BrowserWindow) {
  if (vtbInfo.face) {
    fetch(`${vtbInfo.face}`).then((response) => {
      if (!response.ok)
        throw new Error(`Invalid status code <${response.status}>`)

      streamPipeline(response.body, createWriteStream(join(tempPath, `./faces/${vtbInfo.roomid!}.jpg`)))
        .catch((error) => {
          log.error(JSON.stringify(error))
        })
    }).finally(() => {
      win.setIcon(nativeImage.createFromPath(join(tempPath, `./faces/${vtbInfo.roomid!}.jpg`)))
    })
  }
}

export function createPlayerWindow(app: Electron.App, vtbInfo: VtbInfo, playerObjMap: ContextMap): PlayerObj {
  const tempPath = app.getPath('temp')
  // C:\Users\{your-name}\AppData\Local\Temp in windows 10

  // region window options
  const win = new BrowserWindow({
    width: 640,
    height: 360,
    enableLargerThanScreen: true,
    useContentSize: true,
    title: vtbInfo.title || '',
    webPreferences: {},
  })
  // endregion

  // region window icon
  // download vtbInfo.face => ./faces/${vtbInfo.roomid}.jpg
  if (fs.existsSync(join(tempPath, `./faces/${vtbInfo.roomid!}.jpg`))) {
    win.setIcon(nativeImage.createFromPath(join(tempPath, `./faces/${vtbInfo.roomid!}.jpg`)))
  }
  else {
    if (fs.existsSync(join(tempPath, './faces'))) {
      downloadAndSetWindowIcon(vtbInfo, tempPath, win)
    }
    else {
      fs.mkdir(join(tempPath, './faces'), () => {
        downloadAndSetWindowIcon(vtbInfo, tempPath, win)
      })
    }
  }
  // endregion

  // Emitted when the document changed its title, calling `event.preventDefault()`
  // will prevent the native window's title from changing
  win.on('page-title-updated', (event: Electron.Event) => {
    event.preventDefault()
  })

  // region load live stream url
  // example https://www.bilibili.com/blackboard/live/live-activity-player.html?enterTheRoom=0&cid=21320551
  win.loadURL(`https://www.bilibili.com/blackboard/live/live-activity-player.html?enterTheRoom=0&cid=${vtbInfo.roomid!}`)
    .then(() => {
      // inject custom CSS rules
      win.webContents.insertCSS('.bilibili-live-player-video-logo{display:none}')
        .catch((_err) => {
          log.error(`failed to inject custom CSS rules: ${vtbInfo.roomid!}`)
        })
    }).catch((_err) => {
      log.error(`failed to load live stream url: ${vtbInfo.roomid!}`)
    })
  // endregion

  // win.webContents.openDevTools()
  win.setMenu(null)

  win.on('close', () => {
    log.debug(`try to close player window(roomid): ${vtbInfo.roomid!}`)
    if (vtbInfo.roomid) {
      if (playerObjMap && playerObjMap.size > 0)
        playerObjMap.deleteAndNotify(vtbInfo.roomid)
    }
  })

  return {
    roomid: vtbInfo.roomid,
    playerWindow: win,
  }
}

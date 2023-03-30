import { BrowserWindow, nativeImage } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { PlayerObj, VtbInfo } from '@/interfaces'
import { promisify } from 'node:util'
import { pipeline } from 'node:stream'
import { createWriteStream } from 'node:fs'

import fetch from 'node-fetch'
import ContextMap from '@/electron/utils/ContextMap'
const streamPipeline = promisify(pipeline)

const downloadAndSetWindowIcon = (vtbInfo: VtbInfo, tempPath: string, win: Electron.BrowserWindow) => {
  if (vtbInfo.face) {
    fetch('' + vtbInfo.face).then((response) => {
      if (!response.ok) {
        throw new Error('Invalid status code <' + response.status + '>')
      }
      streamPipeline(response.body, createWriteStream(join(tempPath, `./faces/${vtbInfo.roomid}.jpg`)))
    }).finally(() => {
      win.setIcon(nativeImage.createFromPath(join(tempPath, `./faces/${vtbInfo.roomid}.jpg`)))
    })
  }
}

export const createPlayerWindow = (app: Electron.App, vtbInfo: VtbInfo, playerObjMap: ContextMap<number, PlayerObj>): PlayerObj => {
  const tempPath = app.getPath('temp')
  // C:\Users\{your-name}\AppData\Local\Temp in windows 10

  // region window options
  const win = new BrowserWindow({
    width: 640,
    height: 360,
    enableLargerThanScreen: true,
    useContentSize: true,
    title: vtbInfo.title || '',
    webPreferences: {}
  })
  // endregion

  // region window icon
  // download vtbInfo.face => ./faces/${vtbInfo.roomid}.jpg
  if (fs.existsSync(join(tempPath, `./faces/${vtbInfo.roomid}.jpg`))) {
    win.setIcon(nativeImage.createFromPath(join(tempPath, `./faces/${vtbInfo.roomid}.jpg`)))
  } else {
    if (fs.existsSync(join(tempPath, './faces'))) {
      downloadAndSetWindowIcon(vtbInfo, tempPath, win)
    } else {
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
  win.loadURL(`https://www.bilibili.com/blackboard/live/live-activity-player.html?enterTheRoom=0&cid=${vtbInfo.roomid}`)
    .then(() => {
      // inject custom CSS rules
      win.webContents.insertCSS('.bilibili-live-player-video-logo{display:none}')
    })
  // endregion

  // win.webContents.openDevTools()
  win.setMenu(null)

  win.on('close', () => {
    console.log('try to close player window(roomid):', vtbInfo.roomid)
    if (vtbInfo.roomid) {
      if (playerObjMap && playerObjMap.size > 0) {
        playerObjMap.deleteAndNotify(vtbInfo.roomid)
      }
    }
  })

  return {
    roomid: vtbInfo.roomid,
    playerWindow: win
  }
}

import path from 'node:path'
import type { IpcMainEvent } from 'electron'
import { BrowserWindow, Menu, Tray, app, ipcMain, protocol } from 'electron'
import { autoUpdater } from 'electron-updater'
import { configureSettings } from '../utils/OldGlobalSettings'

import { FollowListService, RoomService, SettingService, VtbInfoService } from '../services'
import { createPlayerWindow } from '../playerWindow'
import { createMainWindow } from '../mainWindow'
import ContextMap from '../utils/ContextMap'
import { log } from '../utils/logger'
import CDN from '../utils/CDN'
import type { FollowListItem, PlayerObj, VtbInfo } from '@/interfaces'

let vtbInfosService: VtbInfoService
let mainWindow: BrowserWindow
let bestCDN: string
const playerObjMap = new ContextMap()
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
    },
  },
])

function initSettingsConfiguration() {
  log.debug('INIT SettingsConfiguration')

  configureSettings()
  // init follow setting
  FollowListService.initFollowListsSync()
}

function initServices() {
  log.debug('INIT Services')

  if (bestCDN && mainWindow)
    mainWindow.webContents.send('updateCurrentCDN', bestCDN)

  vtbInfosService = new VtbInfoService(bestCDN)

  // register live change notifications
  // 上次记录的vtbs（已经处理上播和下播提醒）
  let lastLiveVtbs: number[] = []
  vtbInfosService.onUpdate((allVtbInfos, updatedVtbInfos: VtbInfo[], averageUpdateInterval: number) => {
    if (mainWindow) {
      mainWindow.webContents.send('updateVtbInfos', updatedVtbInfos, averageUpdateInterval)

      const followVtbs = FollowListService.getFollowedVtbMidsSync()
      // 现在正在直播的vtbs
      const nowLiveFollowedVtbs
        = allVtbInfos
          .filter((vtbInfo: VtbInfo) => (followVtbs.includes(vtbInfo.mid) && !!vtbInfo.liveStatus))
          .map((vtbInfo: VtbInfo) => vtbInfo.mid)

      // 上播vtbs
      const upLiveFollowedVtbs: number[] = []
      // 下播vtbs
      const downLiveFollowedVtbs: number[] = []

      // 对于lastLiveVtbs，使用【现在正在直播的vtbs】更新【上播vtbs】
      nowLiveFollowedVtbs.forEach((nowLiveFollowedVtb) => {
        if (!lastLiveVtbs.includes(nowLiveFollowedVtb))
          upLiveFollowedVtbs.push(nowLiveFollowedVtb)
      })

      // 对于lastLiveVtbs，使用【现在正在直播的vtbs】更新【下播vtbs】
      lastLiveVtbs.forEach((lastLiveVtb) => {
        // 边缘情况：如果A正在直播，用户点击关注A，那么 lastLiveVtbs含有A，触发上播提醒。
        // 接着用户马上取消关注A，此时lastLiveVtbs含有A。而nowLiveFollowedVtbs不再含有A，会进入if判断，触发BUG：A下播提醒。事实上，A没有下播。
        // BUG fix: 增加判断该vtbInfo是否真正下播，如果是，那么可以将A加入下播提醒
        if (!nowLiveFollowedVtbs.includes(lastLiveVtb) && !vtbInfosService.getVtbLiveStatusByMid(lastLiveVtb))
          downLiveFollowedVtbs.push(lastLiveVtb)
      })

      // 当前记录的vtbs数量不为0，或者设置启动时接受通知为true。派发上播和下播提醒。
      // optimize：使用debounce避免某个时刻通知过多而导致疯狂弹窗。
      if ((lastLiveVtbs.length !== 0) || SettingService.getIsNotifiedOnStartSync()) {
        upLiveFollowedVtbs.forEach((mid: number) => {
          mainWindow.webContents.send('liveNotice', allVtbInfos.find((vtbInfo: VtbInfo) => vtbInfo.mid === mid), '↑上播提醒↑')
        })
        downLiveFollowedVtbs.forEach((mid: number) => {
          mainWindow.webContents.send('liveNotice', allVtbInfos.find((vtbInfo: VtbInfo) => vtbInfo.mid === mid), '↓下播提醒↓')
        })
      }

      // 将当前直播vtbs记录赋值为lastLiveVtbs
      lastLiveVtbs = nowLiveFollowedVtbs
    }
  })
}

/**
 * depend on vtbInfosService, must init after new VtbInfosService()
 */
function initIpcMainListeners() {
  // region app update
  ipcMain.on('user-confirm-download', (_event: IpcMainEvent, ..._args: any[]) => {
    log.debug('IPC MAIN: user-confirm-download')
    autoUpdater.downloadUpdate()
      .catch((error) => {
        log.error(JSON.stringify(error))
      })
  })
  // endregion

  // region notification
  ipcMain.on('setIsNotifiedOnStart', (event: Electron.IpcMainEvent, isNotifiedOnStart: boolean) => {
    event.reply('setIsNotifiedOnStartReply', SettingService.setIsNotifiedOnStartSync(isNotifiedOnStart))
  })
  ipcMain.on('getIsNotifiedOnStart', (event: Electron.IpcMainEvent) => {
    event.reply('getIsNotifiedOnStartReply', SettingService.getIsNotifiedOnStartSync())
  })
  // endregion

  // region follow
  ipcMain.on('getFollowedVtbMids', (event: Electron.IpcMainEvent) => {
    event.reply('getFollowedVtbMidsReply', FollowListService.getFollowedVtbMidsSync())
  })
  ipcMain.on('getFollowLists', (event: Electron.IpcMainEvent) => {
    event.reply('getFollowListsReply', FollowListService.getFollowListsSync())
  })
  ipcMain.on('addFollowList', (event: Electron.IpcMainEvent, name: string) => {
    FollowListService.addFollowListSync(name)
    event.reply('addFollowListReply', FollowListService.getFollowListsSync())
  })
  ipcMain.on('deleteFollowList', (event: Electron.IpcMainEvent, id: number) => {
    FollowListService.deleteFollowListSync(id)
    event.reply('deleteFollowListReply', FollowListService.getFollowListsSync())
  })
  ipcMain.on('renameFollowList', (event: Electron.IpcMainEvent, id: number, newName: string) => {
    FollowListService.renameFollowListSync(id, newName)
    event.reply('renameFollowListReply', FollowListService.getFollowListsSync())
  })
  ipcMain.on('toggleFollow', (event: Electron.IpcMainEvent, followListItem: FollowListItem) => {
    FollowListService.toggleFollowSync(followListItem)
    const followListsSync = FollowListService.getFollowListsSync()
    event.reply('toggleFollowReply', followListsSync)
  })
  ipcMain.on('setFollowList', (event: Electron.IpcMainEvent, followListItems: FollowListItem[], listId: number) => {
    FollowListService.addItemsToFollowListSync(followListItems, listId)
    event.reply('setFollowListReply', FollowListService.getFollowListsSync())
  })
  // endregion

  // region player
  ipcMain.on('showPlayer', (event: Electron.IpcMainEvent, roomid: number) => {
    // validate roomid if is valid
    if (playerObjMap.has(roomid)) {
      playerObjMap.get(roomid)!.playerWindow.focus()
    }
    else {
      if (vtbInfosService) {
        const vtbInfo: VtbInfo = vtbInfosService.getVtbInfos().find((vtbInfo: VtbInfo) => {
          return vtbInfo.roomid === roomid
        })!

        const title = (vtbInfo && vtbInfo.title) || (vtbInfo && `${vtbInfo.uname!}的直播间`) || `${roomid}的直播间`

        // player need `face`, `roomid`, `title`(optional) field
        const vtbInfoNeed = {
          roomid,
          title,
          face: (vtbInfo && vtbInfo.face) || '',
        }

        playerObjMap.setAndNotify(roomid, createPlayerWindow(app, vtbInfoNeed as VtbInfo, playerObjMap))
      }
    }
  })
  // endregion

  // room
  ipcMain.on('getInfoByRoom', (event: Electron.IpcMainEvent, roomid: number) => {
    RoomService.getInfoByRoom(roomid)
      .then((res) => {
        event.reply('getInfoByRoomReply', res)
      }).catch((error) => {
        log.error(JSON.stringify(error))
      })
  })

  ipcMain.on('getPathOfSettings', (event: Electron.IpcMainEvent) => {
    event.reply('getPathOfSettingsReply', SettingService.getPathOfSettings())
  })

  ipcMain.on('openPathOfSettings', (_event: Electron.IpcMainEvent) => {
    SettingService.openPathOfSettings()
  })
}

function mainWindowOnClose() {
  if (mainWindow) {
    // CLOSE
    mainWindow.on('close', (event) => {
      mainWindow.hide()
      mainWindow.setSkipTaskbar(true)
      event.preventDefault()
    })
  }
}

function mainWindowOnClosed() {
  if (mainWindow) {
    // CLOSED
    mainWindow.on('closed', () => {
      log.debug('main window closed.')
    })
  }
}

let tray: Electron.Tray | null = null

async function initMainWindow() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length)
    allWindows[0].focus()
  else
    mainWindow = await createMainWindow(app, playerObjMap)
}

// disable GPU
app.commandLine.appendSwitch('ignore-gpu-blacklist')
app.commandLine.appendSwitch('disable-gpu')

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // GC tray
  tray?.destroy()

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized())
      mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('activate', () => {
  initMainWindow().catch((error) => {
    log.error(JSON.stringify(error))
  })
})

// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // pre setup
  initSettingsConfiguration()

  initIpcMainListeners()
  initMainWindow().then(() => {
    CDN.getBestCDN()
      .then((res) => {
        bestCDN = res
        log.info(`Set CDN to: ${res}`)
        // post setup
        initServices()
      }).catch((error) => {
        log.error(JSON.stringify(error))
      })
    mainWindowOnClose()
    mainWindowOnClosed()
  }).catch((error) => {
    log.error(JSON.stringify(error))
  })
  mainWindowOnClose()
  mainWindowOnClosed()

  // tray mode
  // development root folder: ./dist_electron/
  // prod root folder: ./dist_electron/bundled/
  const iconPath = isDevelopment ? path.join(__dirname, '../../dist/icons/64x64.png') : path.join(__dirname, '../../icons/64x64.png')
  if (!tray)
    tray = new Tray(iconPath)

  function showMainWindow() {
    if (!mainWindow.isVisible())
      mainWindow.setSkipTaskbar(false)

    // 更好的做法：类似clash。当窗口已经置顶并可见(思考难点)时，取消调用win.show()方法
    mainWindow.show()
  }

  function quitApp() {
    // 1.stop all services
    if (vtbInfosService)
      vtbInfosService.stopUpdate()

    // 2.close all player windows
    // NOTE: every close event of player window has been handled by itself
    // KNOWN BUG: player window close event call twice, now just ignore it
    // try to close player window(roomid): 47867
    // try to close player window(roomid): 6374209
    // try to close player window(roomid): 47867
    // try to close player window(roomid): 6374209
    playerObjMap.forEach((playerObj: PlayerObj) => {
      if (playerObj.playerWindow)
        playerObj.playerWindow.close()
    })

    // 3.clear all ipcMain listeners
    ipcMain.removeAllListeners()

    // 4.close main window
    // 强制关闭窗口, 除了closed之外，close，unload 和 beforeunload 都不会被触发
    // refer: https://www.electronjs.org/zh/docs/latest/api/browser-window#%E4%BA%8B%E4%BB%B6-close
    if (mainWindow)
      mainWindow.destroy()

    // exit app
    app.quit()
  }

  const menuTemplate = [
    {
      label: '显示主界面',
      click: () => {
        showMainWindow()
      },
    },
    {
      label: '退出应用',
      click: () => {
        quitApp()
      },
    },
  ]

  const trayMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setToolTip('bilibili-dd-monitor')
  tray.setContextMenu(trayMenu)
  tray.on('click', () => {
    showMainWindow()
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit')
        app.quit()
    })
  }
  else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

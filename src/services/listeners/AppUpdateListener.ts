import type { UpdateInfo } from 'electron-updater'
import type { ProgressInfo } from 'builder-util-runtime'
import { slog } from '@/utils/helpers'
import { usePiniaStore } from '@/store'

export default class AppUpdateListener {
  private store

  constructor() {
    this.store = usePiniaStore()
    this.initDownloadProgressListener()
    this.initUpdateAvailableListener()
  }

  private initUpdateAvailableListener() {
    window.ipcRenderer.on('update-available', (event: Electron.Event, updateInfo: UpdateInfo) => {
      slog('update-available', updateInfo)
      this.store.toggleShowUpdateAvailableModal(updateInfo)
    })
  }

  private initDownloadProgressListener() {
    window.ipcRenderer.on('download-progress', (event: Electron.Event, progressInfo: ProgressInfo) => {
      slog('download-progress', progressInfo)
    })
  }
}

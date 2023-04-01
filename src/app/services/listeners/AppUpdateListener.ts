import { IpcRenderer } from 'electron'
import { Store } from 'vuex'
import store from '../../store'
import { UpdateInfo } from 'electron-updater'
import { ProgressInfo } from 'builder-util-runtime'
import { slog } from '@/app/utils/helpers'

export default class AppUpdateListener {
  private ipcRenderer: IpcRenderer
  private store: Store<object>

  constructor () {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
    this.store = store
    this.initDownloadProgressListener()
    this.initUpdateAvailableListener()
  }

  private initUpdateAvailableListener () {
    window.ipcRenderer.on('update-available', (event: Electron.Event, updateInfo: UpdateInfo) => {
      slog('update-available', updateInfo)
      this.store.dispatch('toggleShowUpdateAvailableModal', updateInfo)
    })
  }

  private initDownloadProgressListener () {
    window.ipcRenderer.on('download-progress', (event: Electron.Event, progressInfo: ProgressInfo) => {
      slog('download-progress', progressInfo)
    })
  }
}

import { Store, useStore } from 'vuex'
import { UpdateInfo } from 'electron-updater'
import { ProgressInfo } from 'builder-util-runtime'
import { slog } from '@/app/utils/helpers'
import store from '@/app/store'

export default class AppUpdateListener {
  private store: Store<object>

  constructor () {
    this.store = useStore()
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

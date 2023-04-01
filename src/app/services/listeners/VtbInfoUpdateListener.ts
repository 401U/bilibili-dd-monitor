import { IpcRenderer } from 'electron'
import { VtbInfo } from '@/interfaces'
import store from '../../store'
import { Store } from 'vuex'

export default class VtbInfoUpdateListener {
  private ipcRenderer: IpcRenderer
  private store: Store<object>

  constructor () {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
    this.store = store
    this.initVtbInfosUpdateListener()
  }

  initVtbInfosUpdateListener () {
    window.ipcRenderer.on('updateVtbInfos', (event: Electron.Event, updatedVtbInfos: VtbInfo[], averageUpdateInterval: number) => {
      this.store.dispatch('updateVtbInfos', { updatedVtbInfos, averageUpdateInterval })
    })
  }
}

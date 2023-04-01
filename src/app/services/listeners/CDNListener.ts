import { IpcRenderer } from 'electron'
import store from '../../store'
import { Store } from 'vuex'

export default class VtbInfoUpdateListener {
  private ipcRenderer: IpcRenderer
  private store: Store<object>

  constructor () {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
    this.store = store
    this.initCurrentCDNListener()
  }

  initCurrentCDNListener () {
    window.ipcRenderer.on('updateCurrentCDN', (event: Electron.Event, currentCDN: string) => {
      this.store.dispatch('updateCurrentCDN', currentCDN)
    })
  }
}

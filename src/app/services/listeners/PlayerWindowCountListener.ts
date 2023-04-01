import { IpcRenderer } from 'electron'
import store from '../../store'
import { Store } from 'vuex'

export default class PlayerWindowCountListener {
  private ipcRenderer: IpcRenderer
  private store: Store<object>

  constructor () {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
    this.store = store
    this.initPlayerWindowCountListener()
  }

  initPlayerWindowCountListener () {
    window.ipcRenderer.on('updatePlayerWindowCount', (event: Electron.Event, count: number) => {
      this.store.dispatch('updatePlayerWindowCount', count)
    })
  }
}

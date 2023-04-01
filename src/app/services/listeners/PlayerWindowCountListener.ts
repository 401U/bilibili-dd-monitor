import store from '@/app/store'
import { Store, useStore } from 'vuex'

export default class PlayerWindowCountListener {
  private store: Store<object>

  constructor () {
    this.store = useStore()
    this.initPlayerWindowCountListener()
  }

  initPlayerWindowCountListener () {
    window.ipcRenderer.on('updatePlayerWindowCount', (event: Electron.Event, count: number) => {
      this.store.dispatch('updatePlayerWindowCount', count)
    })
  }
}

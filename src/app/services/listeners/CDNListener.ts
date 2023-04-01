import store from '@/app/store'
import { Store, useStore } from 'vuex'

export default class VtbInfoUpdateListener {
  private store: Store<object>

  constructor () {
    this.store = useStore()
    this.initCurrentCDNListener()
  }

  initCurrentCDNListener () {
    window.ipcRenderer.on('updateCurrentCDN', (event: Electron.Event, currentCDN: string) => {
      this.store.dispatch('updateCurrentCDN', currentCDN)
    })
  }
}

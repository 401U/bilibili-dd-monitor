import store from '@/app/store'
import { VtbInfo } from '@/interfaces'
import { Store, useStore } from 'vuex'

export default class VtbInfoUpdateListener {
  private store: Store<object>

  constructor () {
    this.store = useStore()
    this.initVtbInfosUpdateListener()
  }

  initVtbInfosUpdateListener () {
    window.ipcRenderer.on('updateVtbInfos', (event: Electron.Event, updatedVtbInfos: VtbInfo[], averageUpdateInterval: number) => {
      this.store.dispatch('updateVtbInfos', { updatedVtbInfos, averageUpdateInterval })
    })
  }
}

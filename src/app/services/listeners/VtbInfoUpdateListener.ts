import { usePiniaStore } from '@/app/store'
import { VtbInfo } from '@/interfaces'

export default class VtbInfoUpdateListener {
  private store

  constructor () {
    this.store = usePiniaStore()
    this.initVtbInfosUpdateListener()
  }

  initVtbInfosUpdateListener () {
    window.ipcRenderer.on('updateVtbInfos', (event: Electron.Event, updatedVtbInfos: VtbInfo[], averageUpdateInterval: number) => {
      this.store.updateVtbInfos(updatedVtbInfos, averageUpdateInterval)
    })
  }
}

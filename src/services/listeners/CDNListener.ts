import { usePiniaStore } from '@/store'
import { log } from '@/composables/logger'

export default class VtbInfoUpdateListener {
  private store

  constructor() {
    this.store = usePiniaStore()
    this.initCurrentCDNListener()
  }

  initCurrentCDNListener() {
    window.ipcRenderer.on('updateCurrentCDN', (event: Electron.Event, currentCDN: string) => {
      log.debug(`updateCurrentCDN: ${currentCDN}`)

      this.store.currentCDN = currentCDN
    })
  }
}

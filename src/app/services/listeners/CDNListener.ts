import { usePiniaStore } from '@/app/store'

export default class VtbInfoUpdateListener {
  private store

  constructor() {
    this.store = usePiniaStore()
    this.initCurrentCDNListener()
  }

  initCurrentCDNListener() {
    window.ipcRenderer.on('updateCurrentCDN', (event: Electron.Event, currentCDN: string) => {
      this.store.currentCDN = currentCDN
    })
  }
}

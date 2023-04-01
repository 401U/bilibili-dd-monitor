import { usePiniaStore } from '@/app/store'

export default class PlayerWindowCountListener {
  private store

  constructor () {
    this.store = usePiniaStore()
    this.initPlayerWindowCountListener()
  }

  initPlayerWindowCountListener () {
    window.ipcRenderer.on('updatePlayerWindowCount', (event: Electron.Event, count: number) => {
      this.store.playerWindowCount = count
    })
  }
}

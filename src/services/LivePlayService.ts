import type { IpcRenderer } from 'electron'

export default class LivePlayService {
  private ipcRenderer: IpcRenderer

  constructor() {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
  }

  enterRoom(roomid: number) {
    window.ipcRenderer.send('showPlayer', roomid)
  }
}

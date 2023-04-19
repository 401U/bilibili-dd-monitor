import type { IpcRenderer } from 'electron'
import type { VtbInfo } from '@/interfaces'

export default class NoticeListener {
  private ipcRenderer: IpcRenderer

  constructor() {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
    this.initNoticeListener()
  }

  private initNoticeListener() {
    window.ipcRenderer.on('liveNotice', (event: Electron.IpcRendererEvent, vtbInfo: VtbInfo, extra: string) => {
      const notification = new Notification(`${extra} ${vtbInfo.uname!}`, {
        body: vtbInfo.title,
        icon: vtbInfo.face,
        actions: [],
      })
      notification.onclick = () => {
        window.ipcRenderer.send('showPlayer', vtbInfo.roomid)
      }
    })
  }
}

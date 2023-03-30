import { IpcRenderer } from 'electron'
import { Observable, Observer } from 'rxjs'

declare const window: any
type Result = {
  isValid: boolean
  info: object
}

export default class RoomService {
  private ipcRenderer: IpcRenderer

  constructor () {
    this.ipcRenderer = window.ipcRenderer
  }

  private sequenceSubscriber = (channel: string) => {
    return (observer: Observer<any>) => {
      switch (channel) {
        case 'getInfoByRoomReply': {
          this.ipcRenderer.once('getInfoByRoomReply', (e: Electron.IpcRendererEvent, result: any) => {
            observer.next(result)
            observer.complete()
          })
          break
        }
        default:
          break
      }
    }
  }

  getInfoByRoom (roomid: number): Observable<Result> {
    this.ipcRenderer.send('getInfoByRoom', roomid)
    return new Observable<Result>(this.sequenceSubscriber('getInfoByRoomReply'))
  }
}

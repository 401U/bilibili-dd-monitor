import { IpcRenderer } from 'electron'
import { Observable, Observer } from 'rxjs'

type Result = {
  isValid: boolean
  info: object
}

export default class RoomService {
  private ipcRenderer: IpcRenderer

  constructor () {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
  }

  private sequenceSubscriber = (channel: string) => {
    return (observer: Observer<any>) => {
      switch (channel) {
        case 'getInfoByRoomReply': {
          window.ipcRenderer.once('getInfoByRoomReply', (e: Electron.IpcRendererEvent, result: any) => {
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
    window.ipcRenderer.send('getInfoByRoom', roomid)
    return new Observable<Result>(this.sequenceSubscriber('getInfoByRoomReply'))
  }
}

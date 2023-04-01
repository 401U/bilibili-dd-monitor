import { IpcRenderer } from 'electron'
import { Observable, Observer } from 'rxjs'

export default class SettingService {
  private ipcRenderer: IpcRenderer

  constructor () {
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
  }

  private sequenceSubscriber = (channel: string) => {
    return (observer: Observer<any>) => {
      switch (channel) {
        case 'setIsNotifiedOnStartReply': {
          window.ipcRenderer.once('setIsNotifiedOnStartReply', (e: Electron.IpcRendererEvent, isNotifiedOnStart: boolean) => {
            observer.next(isNotifiedOnStart)
            observer.complete()
          })
          break
        }
        case 'getIsNotifiedOnStartReply': {
          window.ipcRenderer.once('getIsNotifiedOnStartReply', (e: Electron.IpcRendererEvent, isNotifiedOnStart: boolean) => {
            observer.next(isNotifiedOnStart)
            observer.complete()
          })
          break
        }
        case 'getPathOfSettingsReply': {
          window.ipcRenderer.once('getPathOfSettingsReply', (e: Electron.IpcRendererEvent, path: string) => {
            observer.next(path)
            observer.complete()
          })
          break
        }
        // case 'openPathOfSettingsReply': {
        //   window.ipcRenderer.once('openPathOfSettingsReply', (e: Electron.IpcRendererEvent) => {
        //     observer.next(null) //don't care feedback
        //     observer.complete()
        //   })
        //   break
        // }
      }
    }
  }

  setIsNotifiedOnStart (isNotifiedOnStart: boolean): Observable<boolean> {
    window.ipcRenderer.send('setIsNotifiedOnStart', isNotifiedOnStart)
    return new Observable<boolean>(this.sequenceSubscriber('setIsNotifiedOnStartReply'))
  }

  getIsNotifiedOnstart (): Observable<boolean> {
    window.ipcRenderer.send('getIsNotifiedOnStart')
    return new Observable<boolean>(this.sequenceSubscriber('getIsNotifiedOnStartReply'))
  }

  getPathOfSettings (): Observable<string> {
    window.ipcRenderer.send('getPathOfSettings')
    return new Observable<string>(this.sequenceSubscriber('getPathOfSettingsReply'))
  }

  openPathOfSettings (): void {
    window.ipcRenderer.send('openPathOfSettings')
    // return new Observable<boolean>(this.sequenceSubscriber('openPathOfSettingsReply'))
  }
}

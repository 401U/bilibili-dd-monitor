import { IpcRenderer } from 'electron'
import { Observable, Observer } from 'rxjs'
import { FollowList, FollowListItem } from '@/interfaces'
import { slog } from '@/app/utils/helpers'
import { Store, useStore } from 'vuex'

/**
 * refactor to singleton
 */
export default class FollowListService {
  private ipcRenderer: IpcRenderer
  private store: Store<any>

  constructor () {
    this.store = useStore()
    this.ipcRenderer = window.ipcRenderer as IpcRenderer
    this.initService()
  }

  initService () {
    this.getFollowLists().subscribe((followLists: FollowList[]) => {
      slog('INIT', 'followlists')
      this.store.dispatch('updateFollowLists', followLists)
    })
  }

  private sequenceSubscriber = (channel: string) => {
    return (observer: Observer<any>) => {
      switch (channel) {
        case 'getFollowListsReply': {
          window.ipcRenderer.once('getFollowListsReply', (e: Electron.IpcRendererEvent, followLists: FollowList[]) => {
            observer.next(followLists)
            observer.complete()
          })
          break
        }
        case 'addFollowListReply': {
          window.ipcRenderer.once('addFollowListReply', (e: Electron.IpcRendererEvent, followLists: FollowList[]) => {
            observer.next(followLists)
            observer.complete()
          })
          break
        }
        case 'deleteFollowListReply': {
          window.ipcRenderer.once('deleteFollowListReply', (e: Electron.IpcRendererEvent, followLists: FollowList[]) => {
            observer.next(followLists)
            observer.complete()
          })
          break
        }
        case 'renameFollowListReply': {
          window.ipcRenderer.once('renameFollowListReply', (e: Electron.IpcRendererEvent, followLists: FollowList[]) => {
            observer.next(followLists)
            observer.complete()
          })
          break
        }
        case 'toggleFollowReply': {
          window.ipcRenderer.once('toggleFollowReply', (e: Electron.IpcRendererEvent, followLists: FollowList[]) => {
            observer.next(followLists)
            observer.complete()
          })
          break
        }
        // case 'followByRoomInfoReply': {
        //   window.ipcRenderer.once('followByRoomInfoReply', (e: Electron.IpcRendererEvent, flag: boolean) => {
        //     observer.next(flag)
        //     observer.complete()
        //   })
        //   break
        // }
        case 'setFollowListReply': {
          window.ipcRenderer.once('setFollowListReply', (e: Electron.IpcRendererEvent, followLists: FollowList[]) => {
            observer.next(followLists)
            observer.complete()
          })
          break
        }
      }
    }
  }

  /**
   * get all follow list
   */
  getFollowLists (): Observable<FollowList[]> {
    window.ipcRenderer.send('getFollowLists')
    return new Observable<FollowList[]>(this.sequenceSubscriber('getFollowListsReply'))
  }

  /**
   * create new group
   * @param name
   */
  addFollowList (name: string): Observable<FollowList[]> {
    window.ipcRenderer.send('addFollowList', name)
    return new Observable<FollowList[]>(this.sequenceSubscriber('addFollowListReply'))
  }

  /**
   * delete group
   * @param id
   */
  deleteFollowList (id: number): Observable<FollowList[]> {
    window.ipcRenderer.send('deleteFollowList', id)
    return new Observable<FollowList[]>(this.sequenceSubscriber('deleteFollowListReply'))
  }

  /**
   * rename certain group
   * @param id
   * @param newName
   */
  renameFollowList (id: number, newName: string): Observable<FollowList[]> {
    window.ipcRenderer.send('renameFollowList', id, newName)
    return new Observable<FollowList[]>(this.sequenceSubscriber('renameFollowListReply'))
  }

  /**
   * toggle follow
   * @param followListItem
   */
  toggleFollow (followListItem: FollowListItem): Observable<FollowList[]> {
    window.ipcRenderer.send('toggleFollow', followListItem)
    return new Observable<FollowList[]>(this.sequenceSubscriber('toggleFollowReply'))
  }

  // followByRoomInfo (info: any) {
  //   window.ipcRenderer.send('followByRoomInfo', info)
  //   return new Observable<FollowList[]>(this.sequenceSubscriber('followByRoomInfoReply'))
  // }

  /**
   * add certain followListItems to certain list
   * @param followListItems
   * @param listId
   */
  addItemsToFollowList (followListItems: FollowListItem[], listId: number): Observable<FollowList[]> {
    window.ipcRenderer.send('setFollowList', followListItems, listId)
    return new Observable<FollowList[]>(this.sequenceSubscriber('setFollowListReply'))
  }
}

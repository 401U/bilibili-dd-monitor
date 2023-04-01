import type { Observer } from 'rxjs'
import { Observable } from 'rxjs'
import type { FollowList, FollowListItem } from '@/interfaces'
import { slog } from '@/app/utils/helpers'
import { usePiniaStore } from '@/app/store'

/**
 * refactor to singleton
 */
export default class FollowListService {
  private store

  constructor() {
    this.store = usePiniaStore()
    this.initService()
  }

  initService() {
    this.getFollowLists().subscribe((followLists: FollowList[]) => {
      slog('INIT', 'followlists')
      this.store.followLists = followLists
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
  getFollowLists(): Observable<FollowList[]> {
    window.ipcRenderer.send('getFollowLists')
    return new Observable<FollowList[]>(this.sequenceSubscriber('getFollowListsReply'))
  }

  /**
   * create new group
   * @param name
   */
  addFollowList(name: string): Observable<FollowList[]> {
    window.ipcRenderer.send('addFollowList', name)
    return new Observable<FollowList[]>(this.sequenceSubscriber('addFollowListReply'))
  }

  /**
   * delete group
   * @param id
   */
  deleteFollowList(id: number): Observable<FollowList[]> {
    window.ipcRenderer.send('deleteFollowList', id)
    return new Observable<FollowList[]>(this.sequenceSubscriber('deleteFollowListReply'))
  }

  /**
   * rename certain group
   * @param id
   * @param newName
   */
  renameFollowList(id: number, newName: string): Observable<FollowList[]> {
    window.ipcRenderer.send('renameFollowList', id, newName)
    return new Observable<FollowList[]>(this.sequenceSubscriber('renameFollowListReply'))
  }

  /**
   * toggle follow
   * @param followListItem
   */
  toggleFollow(followListItem: FollowListItem): Observable<FollowList[]> {
    window.ipcRenderer.send('toggleFollow', JSON.stringify(followListItem))
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
  addItemsToFollowList(followListItems: FollowListItem[], listId: number): Observable<FollowList[]> {
    window.ipcRenderer.send('setFollowList', followListItems, listId)
    return new Observable<FollowList[]>(this.sequenceSubscriber('setFollowListReply'))
  }
}

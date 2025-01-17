import type { Socket } from 'socket.io-client'
import io from 'socket.io-client'
import vtbInfosMock from '../../test/sample/VtbInfos.json'
import { log } from '../utils/logger'
import { FollowListService } from './index'
import type { FollowList, VtbInfo } from '@/interfaces'

function _compareByOnlineDesc(vtbInfoA: VtbInfo, vtbInfoB: VtbInfo): number {
  return vtbInfoB.online - vtbInfoA.online
}

export class VtbInfoService {
  private vtbInfosMap: Map<number, VtbInfo> = new Map<number, VtbInfo>()
  private update: ((infoPrev: VtbInfo[], infoNew: VtbInfo[], averageUpdateInterval: number) => any) | null = null
  private _onceUpdate: ((info: VtbInfo[]) => any) | null = null
  private readonly socketIOUrl: string = ''
  // check this: https://github.com/socketio/socket.io-client/issues/1097 , can fix 503 error
  // if backend server uses a self signed certificate, need to config `rejectUnauthorized: false`.
  private defaultSocketOptions = { transports: ['websocket'], rejectUnauthorized: false }

  constructor(bestCDN: string) {
    this.socketIOUrl = bestCDN

    // init socket.IO
    this.initSocketIO()

    // mock data only for testing
    // this._initMockData()
  }

  initSocketIO() {
    log.debug(`Socket.io url: ${this.socketIOUrl}`)
    const socket = io(this.socketIOUrl, this.defaultSocketOptions)

    let totalTimeInterval = 0
    let infoEventCount = 0
    let lastInfoTime = Date.now()
    socket.on('info', (infos: VtbInfo[]) => {
      // here are network statistics
      const timeInterval = Date.now() - lastInfoTime
      lastInfoTime = Date.now()

      totalTimeInterval += timeInterval
      infoEventCount++
      const averageUpdateInterval = Math.round(totalTimeInterval / infoEventCount)

      // insert or update info
      infos.forEach((info: VtbInfo, _index, _array) => {
        this.vtbInfosMap.set(info.mid, info)
      })

      // if have update function, call it
      if (this.update)
        this.update([...this.vtbInfosMap.values()], infos, averageUpdateInterval)

      // if has once update function, call it and reset to null
      if (this._onceUpdate) {
        this._onceUpdate([...this.vtbInfosMap.values()])
        this._onceUpdate = null
      }
    })

    this.listenSocketEvent(socket)
  }

  listenSocketEvent(socket: Socket) {
    // region socket listeners
    if (socket) {
      socket.on('connect', () => {
        log.debug('socket.io connect.')
      })
      socket.on('disconnect', () => {
        log.debug('socket.io disconnect.')
      })
      socket.on('reconnecting', () => {
        log.debug('reconnecting')
      })
      socket.on('reconnect_error', (error: any) => {
        log.error(`reconnect_error ${JSON.stringify(error)}`)
      })
      socket.on('connect_error', (error: any) => {
        log.error(`connect_error ${JSON.stringify(error)}`)
      })
      socket.on('connect_timeout', (timeout: any) => {
        log.error(`connect_timeout ${JSON.stringify(timeout)}`)
      })
      socket.on('error', (error: any) => {
        log.error(`socket.io error ${JSON.stringify(error)}`)
      })
    }
    // endregion
  }

  _initMockData() {
    vtbInfosMock.forEach((info: VtbInfo) => {
      this.vtbInfosMap.set(info.mid, info)
    })
  }

  stopUpdate() {
    this.update = null
  }

  onceUpdate(callback: (vtbInfos: VtbInfo[]) => void) {
    this._onceUpdate = callback
  }

  onUpdate(callback: (allVtbInfos: VtbInfo[], updatedVtbInfos: VtbInfo[], averageUpdateInterval: number) => void) {
    this.update = callback
  }

  getVtbInfos(): VtbInfo[] {
    return [...this.vtbInfosMap.values()].sort(_compareByOnlineDesc)
  }

  getVtbLiveStatusByMid(vtbMid: number): boolean {
    const vtbInfo = this.getVtbInfos().find((vtbInfo: VtbInfo) => vtbInfo.mid === vtbMid)
    if (vtbInfo)
      return !!vtbInfo.liveStatus
    return false
  }

  /**
   * get followed vtb infos
   */
  getFollowedVtbInfos(): VtbInfo[] {
    let followedVtbInfos: VtbInfo[] = []
    const vtbInfos = this.getVtbInfos()
    FollowListService.getFollowListsSync().forEach((followList: FollowList) => {
      followedVtbInfos = [
        ...followedVtbInfos,
        ...vtbInfos.filter((vtbInfo) => {
          const followMids = [...followList.list.map(item => item.mid)]
          return followMids.includes(vtbInfo.mid)
        }),
      ]
    })
    return followedVtbInfos.sort(_compareByOnlineDesc)
  }
}

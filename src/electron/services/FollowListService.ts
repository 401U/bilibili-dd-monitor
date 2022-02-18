import { FollowList } from '@/interfaces'
import * as setting from 'electron-settings'
import { FollowListItem } from "@/interfaces/FollowList";

export class FollowListService {
  private static readonly FOLLOW_LISTS: string = 'followLists'

  protected constructor () {
    // don't initiate it
  }

  static initFollowListsSync () {
    if (!setting.hasSync(FollowListService.FOLLOW_LISTS)) {
      const defaultFollowList: FollowList = {
        id: 0,
        name: '默认分组',
        list: []
      }
      setting.setSync(FollowListService.FOLLOW_LISTS, JSON.stringify([defaultFollowList]))
    }
  }

  static getFollowListsSync (): FollowList[] {
    return JSON.parse(setting.getSync(FollowListService.FOLLOW_LISTS) as string)
  }

  static setFollowListsSync (followLists: FollowList[]): void {
    setting.setSync(FollowListService.FOLLOW_LISTS, JSON.stringify(followLists))
  }

  /**
   *
   * @param name new group name
   */
  static addFollowListSync (name: string): void {
    const followLists: FollowList[] = this.getFollowListsSync()

    const followListsNextId = followLists[followLists.length - 1].id + 1
    const newFollowList = {
      id: followListsNextId,
      name: name,
      list: [] // @deprecated ,use set. Don't use list
    }
    followLists.push(newFollowList)

    this.setFollowListsSync(followLists)
  }

  /**
   * Note:
   * when delete one custom follow list, users in the original group will move to the default group (id=0)
   *
   * @param id group id
   */
  static deleteFollowListSync (id: number) {
    const followLists = this.getFollowListsSync()
    // when delete one custom follow list, users in the original group will move to the default group (id=0)
    const list = followLists[followLists.findIndex((followList: FollowList) => followList.id === id)].list
    this.addItemsToFollowListSync(list, 0)

    // now group 0 and current group has duplicated mids, need to remove them from current group
    const newFollowLists = this.getFollowListsSync()
    const filteredFollowLists = newFollowLists.filter((followList: FollowList) => followList.id !== id)

    this.setFollowListsSync(filteredFollowLists)
  }

  /**
   *
   * @param id
   * @param newName
   */
  static renameFollowListSync (id: number, newName: string) {
    const followLists = this.getFollowListsSync()
    for (let i = 0; i < followLists.length; i++) {
      if (followLists[i].id === id) {
        followLists[i].name = newName
        // eager break
        break
      }
    }
    this.setFollowListsSync(followLists)
  }

  /**
   * if has been not followed, then follow him/her to default group (id 0).
   * If has already followed, cancel follow him/her to default group (id 0).
   * @param followListItem
   */
  static toggleFollowSync (followListItem: FollowListItem) {
    console.log('followListItem:', followListItem)
    const followLists = this.getFollowListsSync()
    const defaultGroupIndex = followLists.findIndex((followList: FollowList) => followList.id === 0)

    let hasFollowedBefore = false
    // waring: this method can optimize performance by eager break
    followLists.forEach((followList: FollowList) => {
      let mids = [...followList.list.map((item) => item.mid)]
      console.log('mids', mids)
      const midIndex = mids.findIndex((listMid: number) => listMid === followListItem.mid)
      if (midIndex !== -1) {
        followList.list.splice(midIndex, 1)
        hasFollowedBefore = true
        console.log('hasFollowedBefore:', midIndex)
      }
    })

    // if has not followed before, then add him/her to default group
    if (!hasFollowedBefore) {
      followLists[defaultGroupIndex].list.push(followListItem)
    }

    this.setFollowListsSync(followLists)
  }

  static followByRoomInfoSync (info: any): boolean {
    const mid = info.mid;
    // 遍历所有的关注列表，
    // - 如果之前已经关注过，那么返回消息，告知已经关注，操作无效。
    // - 如果之前没有关注过，那么将其添加过默认关注列表(group index 0),返回消息，告知关注成功。
    // this.toggleFollowSync(mid)
    return true
  }

  /**
   * add mids to certain follow list with parameter id
   *
   * @param followListItems
   * @param listId
   */
  static addItemsToFollowListSync (followListItems: FollowListItem[], listId: number) {
    // move followListItems move to default group
    followListItems.forEach((followListItem) => {
      // here only for following , NOT cancel follow
      this.toggleFollowSync(followListItem)
    })

    const followLists: FollowList[] = this.getFollowListsSync()
    const followListList = followLists[followLists.findIndex((followList: FollowList) => followList.id === listId)].list
    followListList.push(...followListItems)

    this.setFollowListsSync(followLists)
  }

  /**
   * get followed vtb infos list
   */
  static getFollowedVtbMidsSync (): number[] {
    const followedVtbMids: number[] = []
    FollowListService.getFollowListsSync().forEach((followList: FollowList) => {
      followedVtbMids.push(...followList.list.map((item) => item.mid))
    })
    return followedVtbMids
  }
}

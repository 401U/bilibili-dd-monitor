import type { UpdateInfo } from 'electron-updater'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'

import { defineStore } from 'pinia'
import { _compareByOnlineDesc } from '@/utils/helpers'
import type { FollowList, FollowListItem, VtbInfo } from '@/interfaces'

export const usePiniaStore = defineStore('pinia', () => {
  const vtbInfos: Ref<Array<VtbInfo>> = ref([])
  const followLists: Ref<Array<FollowList>> = ref([])
  const updateVtbCount = ref(0)
  const playerWindowCount = ref(0)
  const averageUpdateInterval = ref(0)
  const currentCDN = ref('')
  const updateAvailableModalVisible = ref(false)
  const updateInfo: Ref<UpdateInfo> = ref({
    version: '',
    releaseNotes: '',
  } as UpdateInfo)

  const vtbCount = computed(() => vtbInfos.value.length)
  const livingVtbCount = computed(() => vtbInfos.value.filter((vtb: VtbInfo) => !!vtb.liveStatus).length)
  const followedVtbMids = computed(() => {
    const followedVtbMids: number[] = []
    followLists.value.forEach((followList: FollowList) => {
      followedVtbMids.push(...followList.list.map(item => item.mid))
    })
    return followedVtbMids
  })

  const followedVtbInfos = computed(() => {
    let result: VtbInfo[] = []
    result = [
      ...vtbInfos.value.filter((vtbInfo: VtbInfo) => {
        return followedVtbMids.value.includes(vtbInfo.mid)
      }),
    ]

    // merge manual followed vtubers into followedVtbInfos
    const manualFollowItems: FollowListItem[] = []
    followLists.value.forEach((followList: FollowList) => {
      const followListItems = followList.list
      const followItems = followListItems.filter(item => item.updateMethod === 'MANUAL')
      manualFollowItems.push(...followItems)
    })

    result.push(...manualFollowItems as unknown as VtbInfo[])
    return result.sort(_compareByOnlineDesc)
  })

  function updateVtbInfos(updatedVtbInfos: VtbInfo[], updatedInterval: number) {
    // is first update. init vtbInfos
    if (vtbInfos.value.length === 0) {
      vtbInfos.value.push(...updatedVtbInfos)
    }
    else {
      // next update
      updatedVtbInfos.forEach((newVtbInfo: VtbInfo) => {
        const index = vtbInfos.value.findIndex(vtbInfo => vtbInfo.mid === newVtbInfo.mid)
        // found => update existed object
        if (index !== -1) {
          // do better: sort and show diff parts
          vtbInfos.value[index] = newVtbInfo
        }
        else {
          // not found, add this newVtbInfo to state.vtbInfos
          vtbInfos.value.push(newVtbInfo)
        }
      })
    }
    updateVtbCount.value = updatedVtbInfos.length
    averageUpdateInterval.value = updatedInterval
  }

  function toggleShowUpdateAvailableModal(newUpdateInfo: UpdateInfo) {
    updateAvailableModalVisible.value = !updateAvailableModalVisible.value
    updateInfo.value = newUpdateInfo
  }

  return {
    vtbInfos,
    followLists,
    updateVtbCount,
    playerWindowCount,
    averageUpdateInterval,
    currentCDN,
    updateAvailableModalVisible,
    updateInfo,
    vtbCount,
    livingVtbCount,
    followedVtbMids,
    followedVtbInfos,
    updateVtbInfos,
    toggleShowUpdateAvailableModal,
  }
})

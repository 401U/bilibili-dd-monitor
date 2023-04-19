<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { actionNotify } from '../composables/notify'
import { FollowListService, LivePlayService } from '@/services'
import { usePiniaStore } from '@/store'
import FollowListItem from '@/components/FollowListItem.vue'
import type { FollowList, VtbInfo } from '@/interfaces'

const props = defineProps<{
  id: string
}>()

let followListService: FollowListService
let livePlayService: LivePlayService
const store = usePiniaStore()
const isSetListModalVisible = ref(false)
const selectedListId = ref(-1)
const isSetListModalSuccessLoading = ref(false)
const activeListId = computed(() => {
  return parseInt(props.id) || -1
})
const selectedVtbInfo: Ref<VtbInfo | undefined> = ref()

const followLists = computed(() => store.followLists)
const followedVtbInfos = computed(() => store.followedVtbInfos)

const activeFollowList = computed(() => {
  let result = {} as FollowList
  // handle "全部关注"
  if (activeListId.value === -1) {
    const allFollow: FollowList = {
      id: -1,
      name: '全部关注',
      list: [],
    }
    followLists.value.forEach(followList => allFollow.list.push(...followList.list))
    result = allFollow
  }
  else {
    // handle listId >=0
    followLists.value.forEach((followList) => {
      if (followList.id === activeListId.value)
        result = followList
    })
  }
  return result
})

const activeFollowedVtbInfos = computed(() => {
  const mids = [...activeFollowList.value.list.map(item => item.mid)]
  return followedVtbInfos.value.filter(vtbInfo => mids.includes(vtbInfo.mid))
})

function initServices() {
  followListService = new FollowListService()
  livePlayService = new LivePlayService()
}

function handleSetListModalShow(selectedMid: number) {
  selectedVtbInfo.value = activeFollowedVtbInfos.value.find(vtbInfo => vtbInfo.mid === selectedMid)
  isSetListModalVisible.value = true
}

function handleSetListModalCancel() {
  selectedVtbInfo.value = undefined
  isSetListModalVisible.value = false
}
function handleSetListModalSuccess() {
  if (!isValidListId(selectedListId.value)) {
    actionNotify('warn', '请选择分组。')
    return
  }
  isSetListModalSuccessLoading.value = true
  const followListItem = {
    mid: selectedVtbInfo.value!.mid,
    infoSource: 'DD_CENTER',
    updateMethod: 'AUTO',
  }
  followListService.addItemsToFollowList([followListItem], selectedListId.value).subscribe((followLists) => {
    isSetListModalSuccessLoading.value = false
    isSetListModalVisible.value = false
    actionNotify('success', '设置成功。')
    store.followLists = followLists
  })
}

function isValidListId(listId: number) {
  return listId !== null && listId !== undefined
}

function getActiveFollowListItem(mid: number) {
  return activeFollowList.value.list.filter(item => item.mid === mid)
}

function toggleFollow(mid: number) {
  const activeFollowListItem = getActiveFollowListItem(mid)[0]

  // activeFollowListItem 是一个Proxy, 直接送到 followListService 中会报错
  followListService.toggleFollow({
    mid: activeFollowListItem.mid,
    infoSource: activeFollowListItem.infoSource,
    updateMethod: activeFollowListItem.updateMethod,
  }).subscribe((followLists) => {
    store.followLists = followLists
  })
}

function enterRoom(roomid: number) {
  livePlayService.enterRoom(roomid)
}

initServices()
</script>

<template>
  <div class="follow-vtb-list">
    <h3 class="follow-vtb-list-title">
      {{ activeFollowList.name }}
    </h3>
    <DynamicScroller
      :items="activeFollowedVtbInfos"
      :min-item-size="20"
      key-field="mid"
      style="height: 700px; overflow-y: auto;"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :data-index="index"
          :active="active"
        >
          <FollowListItem
            :index="item.mid"
            :source="item"
            :toggle-follow="toggleFollow"
            :enter-room="enterRoom"
            :handle-set-list-modal-show="handleSetListModalShow"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <div v-show="isSetListModalVisible" id="modal-set-list" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            为
            {{ selectedVtbInfo ? selectedVtbInfo.uname : '' }}
            选择分组
          </h3>
          <span class="modal-close" @click="handleSetListModalCancel">×</span>
        </div>
        <div class="modal-body">
          <v-select v-model="selectedListId" label="name" :options="followLists" :reduce="(followList: FollowList) => followList.id" />
        </div>
        <div class="modal-footer">
          <button class="modal-button modal-button-ok" @click="handleSetListModalSuccess">
            确定
          </button>
          <button class="modal-button modal-button-cancel" @click="handleSetListModalCancel">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scroller {
  height: 100%;
}
.follow-vtb-list {
  &-title {
    font-size: 1rem;
    font-weight: 600;
    color: black;
    margin: 16px 0 16px 20px;
  }
}

.virtual-list-item {
  border-bottom: #e2e2e2 solid 1px;
  list-style: none;
  margin-left: 20px;
  margin-right: 20px;
  color: #666262;
  font-size: 1rem;

  &:hover {
    background-color: rgba(66, 185, 131, 0.1);
  }

  &-media {
    display: flex;
    align-items: center;

    &-body {
      margin-top: 5px;
      margin-bottom: 5px;
    }

    &-title {
      font-size: 1em;
      line-height: 2em;
      font-weight: 400;
    }

    &-content {
      font-size: 0.85em;
      line-height: 2em;
    }

    &-info {
      flex: 0 0 140px;
      font-size: 0.85em;
    }

    &-online {
      display: inline;
      color: #4cd495;
      border: #4cd495 solid 1px;
      border-radius: 5px;
      padding: 2px 4px;
    }

    &-offline {
      display: inline;
      color: #df7373;
      border: #df7373 solid 1px;
      border-radius: 5px;
      padding: 2px 4px;
    }

    &-avatar {
      margin-left: 1em;
      margin-right: 1em;
      width: 40px;
      height: 40px;

      border-radius: 50%;
      display: block;
    }

    &-body {
      flex: 1;
    }

    &-action {
      font-size: 0.85em;

      margin-right: 1em;
    }

    &-unfollow {
      cursor: pointer;
      color: #f57373;
    }

    &-enter-room {
      cursor: pointer;
      color: #3da2ff;
    }

    &-set-list {
      cursor: pointer;
      color: #3da2ff;
    }
  }
}

.modal {
  position: fixed;
  z-index: 3000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .2);

  display: flex;
  align-items: center;
  justify-content: center;

  &-content {
    border: #e2e2e2 solid 1px;
    border-radius: 5px;
    background-color: white;
    width: 40%;

    display: flex;
    flex-direction: column;

    font-size: 1rem;
    color: #666262;
  }

  &-header {
    border-bottom: #e2e2e2 solid 1px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 6px 12px;
  }

  &-title {
    flex: 1;
    font-weight: 400;
    font-size: 1em;
  }

  &-close {
    font-size: 2em;
    cursor: pointer;
  }

  &-body {
    padding: 16px;
    flex: 1;
    border-bottom: #e2e2e2 solid 1px;
  }

  &-select {
    width: 100%;
  }

  &-input {
    width: 100%;
    border: 1px solid rgba(147, 128, 108, 0.25);
    border-radius: 4px;
    padding: 0.5em 0.75em;
  }

  &-footer {
    display: flex;
    flex-direction: row-reverse;
    font-weight: 400;
    padding: 8px 12px;
  }

  &-button {
    outline: none;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    justify-self: end;
    padding: 8px 16px;
    border-radius: 5px;
    border: #e2e2e2 solid 1px;
    cursor: pointer;
    margin-left: 10px;

    &-ok {
      order: -1;
      background-color: #3da2ff;
      color: white;
    }

    &-cancel {
      order: 1;
      color: #666262;
    }
  }

}
</style>

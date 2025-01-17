<script setup lang="ts">
import _ from 'lodash'
import type { Ref } from 'vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { usePiniaStore } from '../store'
import VtbListItem from '@/components/VtbListItem.vue'
import { FollowListService, LivePlayService } from '@/services/index'
import { _compareByOnlineDesc } from '@/utils/helpers'
import type { VtbInfo } from '@/interfaces'

defineComponent({
  name: 'VtbList',
})

const searchInput: Ref<string> = ref('')
const searchInputIsDirty: Ref<boolean> = ref(false)
const isSearchCalculating: Ref<boolean> = ref(false)
const filteredVtbInfos: Ref<VtbInfo[]> = ref([])
const showOnlineOnly: Ref<boolean> = ref(false)
let followListService: FollowListService
let livePlayService: LivePlayService

const searchIndicator = computed(() => {
  if (isSearchCalculating.value)
    return '⟳ 正在处理...'
  else if (searchInputIsDirty.value)
    return '⟳ 正在输入...'
  else
    return `✓ 处理完成。结果数：${filteredVtbInfos.value.length}`
})

const store = usePiniaStore()
const vtbInfos = computed(() => store.vtbInfos)
const followedVtbMids = computed(() => store.followedVtbMids)
function initService() {
  followListService = new FollowListService()
  livePlayService = new LivePlayService()
}

function loadData() {
  // trigger init search by ''
  searchVtbInfosByName(searchInput.value)
}
const computeSearch = _.debounce(() => {
  isSearchCalculating.value = true
  setTimeout(() => {
    searchVtbInfosByName(searchInput.value)
    isSearchCalculating.value = false
    searchInputIsDirty.value = false
  }, 200)
}, 500)
function searchVtbInfosByName(name: string) {
  const filteredByName = vtbInfos.value.filter(vtbInfo => vtbInfo.uname?.includes(name))
  let filteredByOnlineState
  if (showOnlineOnly.value) {
    filteredByOnlineState = filteredByName.filter(vtbInfo => !!vtbInfo.liveStatus)
  }
  else {
    // noop for filteredByName
    filteredByOnlineState = filteredByName
  }

  filteredVtbInfos.value = filteredByOnlineState.sort(_compareByOnlineDesc)
}
function toggleFollow(mid: number) {
  const followListItem = {
    mid,
    infoSource: 'DD_CENTER',
    updateMethod: 'AUTO',
  }
  followListService.toggleFollow(followListItem).subscribe((followLists) => {
    store.followLists = followLists
  })
}
function enterRoom(roomid: number) {
  livePlayService.enterRoom(roomid)
}
function toggleOnlineOnly() {
  showOnlineOnly.value = !showOnlineOnly.value
}

initService()
loadData()

watch(searchInput, () => {
  searchInputIsDirty.value = true
  computeSearch()
})
watch(showOnlineOnly, () => {
  searchInputIsDirty.value = true
  computeSearch()
})
watch(vtbInfos, () => {
  searchVtbInfosByName(searchInput.value)
})
</script>

<template>
  <div class="vtuber-list">
    <div class="search">
      <input v-model="searchInput" class="search-input">
      <button class="search-button">
        <font-awesome-icon class="search-icon" :icon="['fas', 'search']" />
      </button>
    </div>
    <div class="search-help">
      <p class="search-indicator">
        {{ searchIndicator }}
      </p>
      <div class="search-filter">
        <p class="online-only">
          <input id="online-only" type="checkbox" :checked="showOnlineOnly" @click="toggleOnlineOnly()">
          <label for="online-only"> 仅显示在线</label>
        </p>
      </div>
    </div>
    <DynamicScroller
      :items="filteredVtbInfos"
      :min-item-size="20"
      key-field="mid"
      style="height: calc(100vh - 85px); overflow-y: auto;"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :data-index="index"
          :active="active"
        >
          <VtbListItem
            :index="index"
            :source="item"
            :followed-vtb-mids="followedVtbMids"
            :toggle-follow="toggleFollow"
            :enter-room="enterRoom"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<style scoped lang="scss">
.search {
  display: flex;
  flex-direction: row;
  margin-left: 20px;
  margin-top: 20px;

  &-input {
    width: 300px;
    border: 1px solid rgba(147, 128, 108, 0.25);
    border-radius: 4px 0 0 4px;
    padding: 0.5em 0.75em;
  }

  &-button {
    width: 30px;
    border: none;
    border-radius: 0 4px 4px 0;
    background-color: #4cd495;
    cursor: pointer;
  }

  &-help {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: #e2e2e2 solid 1px;
  }

  &-indicator {
    margin: 0 20px;
    padding: 4px;
    width: 300px;
  }

  &-filter {
    margin-left: 48px;
  }

  &-icon {
    color: white;
  }
}
</style>

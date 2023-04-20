<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { RouterLink, useRouter } from 'vue-router'
import { actionNotify } from '../../composables/notify'
import { FollowListService, LivePlayService } from '@/services'
import { usePiniaStore } from '@/store'
import FollowListItem from '@/components/FollowListItem.vue'
import type { FollowList, VtbInfo } from '@/interfaces'

const props = defineProps<{ id: string }>()

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

const router = useRouter()
const mouseOverListId = ref(-1) // 我的关注 = 全部关注
const mouseHoveringListId = ref(-1)
const createListModalValue = ref('') // 创建分组的对话框的文本值
const isCreateListModalVisible = ref(false) // 创建分组的显示状态
const isCreateListModalSuccessLoading = ref(false) // 创建分组成功后的通知信息
const renameListName = ref('') // 重命名列表的名称
const renameListId = ref(0) // 重命名列表的id
const isRenameListModalVisible = ref(false) // 重命名分组的显示状态
const isRenameListModalSuccessLoading = ref(false) // 重命名分组成功后的通知
let setMouseOverIdTimeout: ReturnType<typeof setTimeout> | null = null

function handleRouterChange() {
  // fix case NavigationDuplicated: Avoided redundant navigation to current location
  const currentRoutePath = router.currentRoute.value.path
  if (!currentRoutePath.includes('-1'))
    router.replace('/list/-1')
}

function isEmpty(str: string) {
  return !str || str.trim().length === 0
}

function mouseEnter(listId: number) {
  if (setMouseOverIdTimeout)
    clearTimeout(setMouseOverIdTimeout)
  mouseOverListId.value = listId
}

function mouseLeave(_listId: number) {
  if (setMouseOverIdTimeout)
    clearTimeout(setMouseOverIdTimeout)
  setMouseOverIdTimeout = setTimeout(() => {
    mouseOverListId.value = -1
    setMouseOverIdTimeout = null
  }, 1000)
}

function handleMouseHovering(listId: number) {
  mouseHoveringListId.value = listId
}

function handleMouseHoveringLeave(_listId: number) {
  mouseHoveringListId.value = -1
}

function handleDeleteList(id: number) {
  if (followLists.value.map(followList => followList.id).includes(id)) {
    followListService.deleteFollowList(id).subscribe((followLists) => {
      store.followLists = followLists
      actionNotify('success', '分组删除成功。')
      handleRouterChange()
    })
  }
}

function showCreateListModal() {
  createListModalValue.value = ''
  isCreateListModalVisible.value = true
}

function handleCreateListModalCancel() {
  createListModalValue.value = ''
  isCreateListModalVisible.value = false
}
function handleCreateListModalSuccess() {
  if (followLists.value.length >= 10) {
    actionNotify('warn', '最多只能有十个分组。')
    return
  }
  if (isEmpty(createListModalValue.value)) {
    actionNotify('warn', '分组名字不能为空。')
    return
  }
  if (createListModalValue.value.length > 20) {
    actionNotify('warn', '分组名字过长，最多20个字符。')
    return
  }
  if (followLists.value.map(followList => followList.name).includes(createListModalValue.value)) {
    actionNotify('warn', '分组名字重复')
    return
  }
  isCreateListModalSuccessLoading.value = true
  followListService.addFollowList(createListModalValue.value).subscribe((followLists) => {
    store.followLists = followLists
    isCreateListModalSuccessLoading.value = false
    isCreateListModalVisible.value = false
    actionNotify('success', '分组创建成功。')
    handleRouterChange()
  })
}

function showRenameListModal(id: number, name: string) {
  renameListId.value = id
  renameListName.value = name
  isRenameListModalVisible.value = true
}

function handleRenameListModalCancel() {
  isRenameListModalVisible.value = false
}

function handleRenameListModalSuccess() {
  if (renameListName.value.length <= 10) {
    if (!followLists.value.map(followList => followList.name).includes(renameListName.value)) {
      isRenameListModalSuccessLoading.value = true
      followListService.renameFollowList(renameListId.value, renameListName.value).subscribe((followLists) => {
        store.followLists = followLists
        isRenameListModalSuccessLoading.value = false
        isRenameListModalVisible.value = false
        actionNotify('success', '分组名字修改成功。')
      })
    }
    else {
      actionNotify('warn', '分组名字重复。')
    }
  }
  else {
    actionNotify('warn', '分组名字过长，最多10个字符。')
  }
}
</script>

<template>
  <div class="follow">
    <div class="follow-nav">
      <div class="follow-nav-header">
        <div class="follow-nav-header-label">
          我的关注
        </div>
        <div class="follow-nav-header-action">
          <span @click="showCreateListModal">
            <font-awesome-icon class="follow-nav-header-action-add" :icon="['fas', 'plus-circle']" />
          </span>
        </div>
      </div>

      <ul class="follow-list">
        <li class="follow-list-item">
          <RouterLink class="follow-list-item-link" to="/list/-1">
            <font-awesome-icon class="follow-list-item-link-icon" :icon="['fas', 'globe']" />
            <span class="follow-list-item-link-name">全部关注</span>
          </RouterLink>
        </li>
        <li v-for="list in followLists" :key="list.id" class="follow-list-item">
          <RouterLink :to="{ path: `/list/${list.id}` }" class="follow-list-item-link">
            <font-awesome-icon class="follow-list-item-link-icon" :icon="['fas', 'user-friends']" />
            <span class="follow-list-item-link-name">{{ list.name }}</span>

            <span class="follow-list-item-link-count">{{ list.list.length }}</span>
            <span v-if="list.id >= 1" class="follow-list-item-link-more" @mouseenter="mouseEnter(list.id)" @mouseleave="mouseLeave(list.id)">
              <font-awesome-icon :icon="['fas', 'ellipsis-v']" />
            </span>

            <ul
              v-if="list.id >= 1" v-show="(mouseHoveringListId === list.id) || (mouseOverListId === list.id)"
              class="follow-list-item-link-dropdown dropdown-menu"
              @mouseenter="handleMouseHovering(list.id)"
              @mouseleave="handleMouseHoveringLeave(list.id)"
            >
              <li class="dropdown-menu-item dropdown-menu-item-rename" @click="showRenameListModal(list.id, list.name)">
                修改名称
              </li>
              <li class="dropdown-menu-item dropdown-menu-item-delete" @click="handleDeleteList(list.id)">
                删除
              </li>
            </ul>
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- modal -->
    <div v-show="isCreateListModalVisible" id="modal-create-list" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            新建分组
          </h3>
          <span class="modal-close" @click="handleCreateListModalCancel">×</span>
        </div>
        <div class="modal-body">
          <input v-model="createListModalValue" class="modal-input">
        </div>
        <div class="modal-footer">
          <button class="modal-button modal-button-ok" @click="handleCreateListModalSuccess">
            确定
          </button>
          <button class="modal-button modal-button-cancel" @click="handleCreateListModalCancel">
            取消
          </button>
        </div>
      </div>
    </div>

    <div v-show="isRenameListModalVisible" id="modal-rename-list" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            重命名分组
          </h3>
          <span class="modal-close" @click="handleRenameListModalCancel">×</span>
        </div>
        <div class="modal-body">
          <label>
            <input v-model="renameListName" class="modal-input">
          </label>
        </div>
        <div class="modal-footer">
          <button class="modal-button modal-button-ok" @click="handleRenameListModalSuccess">
            确定
          </button>
          <button class="modal-button modal-button-cancel" @click="handleRenameListModalCancel">
            取消
          </button>
        </div>
      </div>
    </div>

    <div class="follow-content">
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
.follow {
  color: #666262;
  display: flex;
  flex-direction: row;

  &-nav {
    flex: 0 0 12.5em;
    font-size: 0.85rem;
    border-right: #e2e2e2 solid 1px;

    &-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-left: 16px;

      &-label {
        flex: 1;
        padding: 16px 0;
      }

      &-action {
        justify-self: end;
        margin-right: 10px;

        &-add {
          width: 20px;
          height: 20px;
          color: #4cd495;
          cursor: pointer;
        }
      }
    }
  }

  &-list {
    &-item {
      list-style: none;
      margin-top: 4px;
      cursor: pointer;

      &-link {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        text-decoration: none;
        color: #666262;
        padding: 12px 8px 12px 16px;
        border-right: white solid 2px;

        &:hover {
          color: #42b983;
        }

        &.router-link-exact-active {
          color: #42b983;
          background-color: rgba(66, 185, 131, 0.1);
          border-right: #42b983 solid 2px;
        }

        &-icon {
          width: 20px;
          height: 20px;

          margin-right: 10px;
        }

        &-name {
          flex: 1;
          margin-right: 10px;
        }

        &-count {
          width: 20px;
          height: 20px;
          justify-self: end;

          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        &-more {
          width: 15px;
          height: 15px;
          justify-self: end;
          cursor: pointer;

          color: #282525;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        &-dropdown {
          position: absolute;
          top: 100%;
          left: 40%;
          z-index: 1000;
        }
      }
    }
  }

  &-content {
    flex: 1;
  }
}

.dropdown-menu {
  border: #e2e2e2 solid 1px;
  border-radius: 4px;
  width: 160px;
  background-color: white;
  list-style: none;

  &-item {
    padding: 10px;

    &:hover {
      background-color: rgba(66, 185, 131, 0.1);
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

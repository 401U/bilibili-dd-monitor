import App from './app/App.vue'
import router from './app/router'
import store from './app/store'
import { createApp } from 'vue'
import {
  AppUpdateListener,
  CDNListener,
  FollowListService,
  NoticeListener,
  PlayerWindowCountListener,
  VtbInfoUpdateListener
} from '@/app/services'

// import font awesome icon
// https://github.com/FortAwesome/vue-fontawesome#installation
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBan,
  faCog,
  faEllipsisV,
  faGlobe,
  faHeart,
  faListUl,
  faPlusCircle,
  faSearch,
  faSignal,
  faUserFriends,
  faPaperPlane,
  faHome
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// https://vue-select.org/guide/
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

// https://github.com/euvl/vue3-notification/
import Notifications, { notify } from '@kyvg/vue3-notification'
import { FollowList } from '@/interfaces'

import OrbitSpinner from '@/app/components/OrbitSpinner.vue'
import { slog } from '@/app/utils/helpers'
import { DynamicScroller } from 'vue-virtual-scroller'

library.add(
  faSignal,
  faHeart,
  faListUl,
  faCog,
  faPlusCircle,
  faGlobe,
  faUserFriends,
  faBan,
  faSearch,
  faEllipsisV,
  faPaperPlane,
  faHome
)

const app = createApp(App)
  .use(router)
  .use(store)
  .component('DynamicScroller', DynamicScroller)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('v-select', vSelect)
  .component('orbit-spinner', OrbitSpinner)
  .use(Notifications)

app.mixin({
  created () {
    const noticeService = new NoticeListener()
    slog('INIT', 'NoticeService')
    const followListService = new FollowListService()
    followListService.getFollowLists().subscribe((followLists: FollowList[]) => {
      slog('INIT', 'followlists')
      store.dispatch('updateFollowLists', followLists)
    })
    const vtbInfoUpdateListenerService = new VtbInfoUpdateListener()
    slog('INIT', 'VtbInfoUpdateListener')
    const playerWindowCountListener = new PlayerWindowCountListener()
    slog('INIT', 'PlayerWindowCountListener')
    const cdnListener = new CDNListener()
    slog('INIT', 'CDNListener')
    const appUpdateListener = new AppUpdateListener()
    slog('INIT', 'appUpdateListener')
  }
})

// app.config.productionTip = false

app.mount('#app')

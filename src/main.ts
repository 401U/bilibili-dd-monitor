import { createApp } from 'vue'

// import font awesome icon
// https://github.com/FortAwesome/vue-fontawesome#installation
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBan,
  faCog,
  faEllipsisV,
  faGlobe,
  faHeart,
  faHome,
  faListUl,
  faPaperPlane,
  faPlusCircle,
  faSearch,
  faSignal,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// https://vue-select.org/guide/
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

// https://github.com/euvl/vue3-notification/
import Notifications from '@kyvg/vue3-notification'

import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { AppUpdateListener, CDNListener, FollowListService, NoticeListener, PlayerWindowCountListener, VtbInfoUpdateListener } from '@/services'
import OrbitSpinner from '@/components/OrbitSpinner.vue'
import { slog } from '@/utils/helpers'
import App from '@/App.vue'

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
  faHome,
)

const pinia = createPinia()

/*
  eslint-disable
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access,
*/
const app = createApp(App)
  .use(
    createRouter({
      history: createWebHistory(),
      routes,
    }),
  )
  .use(pinia)
  .use(VueVirtualScroller)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('v-select', vSelect)
  .component('orbit-spinner', OrbitSpinner)
  .use(Notifications)

// // app.config.productionTip = false

app.mount('#app')
  .$nextTick(() => {
    const _noticeService = new NoticeListener()
    slog('INIT', 'NoticeService')
    const _followListService = new FollowListService()
    const _vtbInfoUpdateListenerService = new VtbInfoUpdateListener()
    slog('INIT', 'VtbInfoUpdateListener')
    const _playerWindowCountListener = new PlayerWindowCountListener()
    slog('INIT', 'PlayerWindowCountListener')
    const _cdnListener = new CDNListener()
    slog('INIT', 'CDNListener')
    const _appUpdateListener = new AppUpdateListener()
    slog('INIT', 'appUpdateListener')
  })

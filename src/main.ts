import App from '@/app/App.vue'
import router from '@/app/router'
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
import Notifications from '@kyvg/vue3-notification'

import OrbitSpinner from '@/app/components/OrbitSpinner.vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { createPinia } from 'pinia'
import { NoticeListener, FollowListService, VtbInfoUpdateListener, PlayerWindowCountListener, CDNListener, AppUpdateListener } from './app/services'
import { slog } from './app/utils/helpers'

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

const pinia = createPinia()

const app = createApp(App)
  .use(router)
  .use(pinia)
  // .use(store, key)
  .use(VueVirtualScroller)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('v-select', vSelect)
  .component('orbit-spinner', OrbitSpinner)
  .use(Notifications)

// app.config.productionTip = false

app.mount('#app')
  .$nextTick(() => {
    const noticeService = new NoticeListener()
    slog('INIT', 'NoticeService')
    const followListService = new FollowListService()
    const vtbInfoUpdateListenerService = new VtbInfoUpdateListener()
    slog('INIT', 'VtbInfoUpdateListener')
    const playerWindowCountListener = new PlayerWindowCountListener()
    slog('INIT', 'PlayerWindowCountListener')
    const cdnListener = new CDNListener()
    slog('INIT', 'CDNListener')
    const appUpdateListener = new AppUpdateListener()
    slog('INIT', 'appUpdateListener')
  })

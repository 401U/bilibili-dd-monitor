import App from './app/App.vue'
import router from './app/router'
import store from './app/store'
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
  .use(VueVirtualScroller)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('v-select', vSelect)
  .component('orbit-spinner', OrbitSpinner)
  .use(Notifications)

// app.config.productionTip = false

app.mount('#app')

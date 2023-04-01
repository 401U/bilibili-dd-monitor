import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'VtbLiving',
    component: () => import('../views/VtbLiving.vue'),
  },
  {
    path: '/follow',
    component: () => import('../views/Follow.vue'),
    children: [
      {
        path: '',
        redirect: '/list/-1',
      },
      {
        path: '/list/:id',
        component: () => import('../components/FollowList.vue'),
      },
    ],
  },
  {
    path: '/vtbList',
    name: 'VtbList',
    component: () => import('../views/VtbList.vue'),
  },
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('../views/Setting.vue'),
  },
  {
    path: '/liveRoomEntry',
    name: 'LiveRoomEntry',
    component: () => import('../views/LiveRoomEntry.vue'),
  },
]

// const router = new VueRouter({
//   // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/commonIssues.html#blank-screen-on-builds-but-works-fine-on-serve
//   mode: process.env.IS_ELECTRON ? 'hash' : 'history',
//   base: process.env.BASE_URL,
//   routes,
//   linkActiveClass: '' // to fix home page class bug
// })

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

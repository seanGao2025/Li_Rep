import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/AI'
  },
  // removed login route for pure frontend build

  {
    path: '/AI',
    name: 'AI',
    component: () => import('@/views/chat/index.vue')
  },
  {
    path: '/AILi',
    name: 'SocketData',
    component: () => import('@/views/socket-chat/index.vue')
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes: routes as any
})

router.beforeEach(async to => {
  sessionStorage.setItem('activeMenu', to.fullPath)
})

export default router

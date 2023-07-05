import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/translate',
    name: 'translate',
    component: () => import('../views/TranslateView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

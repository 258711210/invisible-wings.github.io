import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FormulaView from '../views/FormulaView.vue'
import RaceView from '../views/RaceView.vue'
import ErgView from '../views/ErgView.vue'
import { useAdminStore } from '../stores/adminStore'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/formula',
      name: 'formula',
      component: FormulaView
    },
    {
      path: '/race',
      name: 'race',
      component: RaceView
    },
    {
      path: '/erg',
      name: 'erg',
      component: ErgView
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/LoginView.vue')
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/AdminDashboard.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const adminStore = useAdminStore()
  if (to.meta.requiresAuth && !adminStore.isAuthenticated) {
    next({ name: 'admin-login' })
  } else if (to.name === 'admin-login' && adminStore.isAuthenticated) {
    next({ name: 'admin-dashboard' })
  } else {
    next()
  }
})

export default router

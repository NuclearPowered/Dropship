import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import ModList from '@/views/ModList.vue'
import ServerList from '@/views/ServerList.vue'
import Login from '@/views/Login.vue'
import store from '@/store'
import Settings from '@/views/Settings.vue'
import InstalledModList from '@/views/ModList/InstalledModList.vue'
import BrowseModList from '@/views/ModList/BrowseModList.vue'
import InstalledServerList from '@/views/ServerList/InstalledServerList.vue'
import BrowseServerList from '@/views/ServerList/BrowseServerList.vue'
import FirstLaunch from '@/views/FirstLaunch.vue'
import DirectConnectServer from '@/views/ServerList/DirectConnectServer.vue'

Vue.use(VueRouter)

export const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    props: route => ({ redirectURL: route.query.redirectURL })
  },
  {
    path: '/firstLaunch',
    name: 'firstLaunch',
    component: FirstLaunch
  },
  {
    path: '/modlist',
    component: ModList,
    children: [
      {
        path: 'installed',
        name: 'InstalledModList',
        component: InstalledModList
      },
      {
        path: 'browse',
        name: 'BrowseModList',
        component: BrowseModList
      },
      {
        path: '',
        redirect: 'installed'
      }
    ]
  },
  {
    path: '/serverlist',
    component: ServerList,
    children: [
      {
        path: 'installed',
        name: 'InstalledServerList',
        component: InstalledServerList
      },
      {
        path: 'directconnect',
        name: 'DirectConnect',
        component: DirectConnectServer
      },
      {
        path: 'browse',
        name: 'BrowseServerList',
        component: BrowseServerList
      },
      {
        path: '',
        redirect: 'installed'
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/',
    redirect: '/modlist'
  }
]

const router = new VueRouter({
  routes,
  mode: process.env.IS_ELECTRON ? 'hash' : 'history'
})

router.beforeEach((to, from, next) => {
  if (!store.state.auth.loggedIn && to.path !== '/login') {
    next({ path: 'login', query: { redirectURL: to.path } })
  } else if (!store.state.auth.loggedIn && to.path === '/login') {
    next()
  } else if (store.state.firstLaunch && to.path !== '/firstLaunch') {
    next({ path: 'firstLaunch' })
  }
  next()
})

export default router

import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import jwt_decode from "jwt-decode"; // eslint-disable-line
import { LaunchWrapperType } from '@/electronMain/models/gameLaunchArgs'
import StoreModel, { StoreServerModel } from '@/models/storeModel'
import { BackgroundTask, TaskUpdate } from '@/electronMain/models/backgroundTask'
import GameVersion, { GamePlatform, GameVerPlatInfo } from '@/services/gameVersionService'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    firstLaunch: true,
    auth: {
      loggedIn: false,
      jwt: '',
      username: 'Dropship',
      userId: -1
    },
    bepinex: {
      installed: false,
      releaseId: -1
    },
    serverList: [],
    gameInstallInfo: {
      location: 'AMONGUSDIR',
      launchWrapper: LaunchWrapperType.Standard,
      customExecLine: '',
      gameVersionPlatform: GameVersion.versionPlatform(GamePlatform.Steam, 2020, 12, 9)
    },
    tasks: []
  } as StoreModel,
  mutations: {
    login (state) {
      state.auth.loggedIn = true
    },
    logout (state) {
      state.auth.loggedIn = false
    },
    addJwt (state, payload: string) {
      state.auth.jwt = payload
    },
    removeJwt (state) {
      state.auth.jwt = ''
    },
    addUserInfo (state, payload: { username: string; userId: number}) {
      state.auth.username = payload.username
      state.auth.userId = payload.userId
    },
    removeUserInfo (state) {
      state.auth.username = ''
      state.auth.userId = -1
    },
    updateFirstLaunch (state, payload: boolean) {
      state.firstLaunch = payload
    },
    updateBepinexInstalled (state, payload: boolean) {
      state.bepinex.installed = payload
    },
    updateBepinexVersion (state, payload: number) {
      state.bepinex.releaseId = payload
    },
    addServer (state, payload: StoreServerModel) {
      state.serverList.push(payload)
    },
    removeServer (state, payload: StoreServerModel) {
      state.serverList = state.serverList.filter(s =>
        !(s.name === payload.name &&
        s.ipAddress === payload.ipAddress &&
        s.port === payload.port))
    },
    updateInstallLocation (state, path: string) {
      state.gameInstallInfo.location = path
    },
    updateLaunchWrapperType (state, launchWrapperType: LaunchWrapperType) {
      state.gameInstallInfo.launchWrapper = launchWrapperType
    },
    updateCustomExecLine (state, customExecLine: string) {
      state.gameInstallInfo.customExecLine = customExecLine
    },
    updateGameVersionPlatform (state, gameVersionPlatform: GameVerPlatInfo) {
      state.gameInstallInfo.gameVersionPlatform = gameVersionPlatform
    },
    addTask (state, backgroundTask: BackgroundTask) {
      state.tasks.push(backgroundTask)
    },
    removeTask (state, taskUuid) {
      state.tasks = state.tasks.filter(t => t.uuid !== taskUuid)
    },
    processTaskUpdate (state, update: TaskUpdate) {
      const task = state.tasks.find(t => t.uuid === update.uuid)
      if (task) {
        task.currentProgress = update.currentProgress
        task.state = update.state
      }
    }
  },
  actions: {
    login ({ commit }, payload) {
      commit('login')
      commit('addJwt', payload)
      const decoded: any = jwt_decode(payload); // eslint-disable-line
      commit('addUserInfo', {
        userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'],
        username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
      })
    },
    logout ({ commit, state }) {
      commit('logout')
      commit('removeJwt')
      commit('removeUserInfo')
      state.serverList.forEach(server => commit('removeServer', server.id))
    },
    installBepinex ({ commit }, payload: number) {
      commit('updateBepinexInstalled', true)
      commit('updateBepinexVersion', payload)
    },
    updateGameLaunchInfo ({ commit }, payload: { launchWrapper: LaunchWrapperType;
                                                customExecLine: string;
                                                gameVersionPlatform: GameVerPlatInfo; }) {
      commit('updateLaunchWrapperType', payload.launchWrapper)
      commit('updateCustomExecLine', payload.customExecLine)
      commit('updateGameVersionPlatform', payload.gameVersionPlatform)
    },
    removeAllTasks ({ commit, state }) {
      state.tasks.forEach(t => commit('removeTask', t.uuid))
    }
  },
  modules: {
  },
  plugins: [createPersistedState({
    filter (mutation) {
      return ['addTask', 'removeTask', 'processTaskUpdate']
        .every(x => x !== mutation.type)
    }
  })]
})

export default store

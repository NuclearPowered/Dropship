<template>
  <div>
    <Header :buttons="buttons"/>
    <div class="main-view">
      <transition :name="transitionName">
        <router-view />
      </transition>
    </div>
    <transition name="hide-bottom">
      <Footer v-if="showFooter"/>
    </transition>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import ModsIconSvg from '@/assets/icons/wrench.svg'
import ServersIconSvg from '@/assets/icons/servers.svg'
import SettingsIconSvg from '@/assets/icons/settings.svg'
import { Route } from 'vue-router'
import { RouterLinkModel } from '@/models/routerLinkViewModel'
import UpdateService from '@/services/updateService'
import NotifImage from '@/assets/icons/icon.png'

@Component({
  components: { Footer, Header }
})
export default class App extends Vue {
  transitionName = 'slide-left'
  buttons: RouterLinkModel[] = [
    {
      id: 2,
      label: 'Mods',
      route: '/modlist',
      icon: ModsIconSvg
    },
    {
      id: 3,
      label: 'Servers',
      route: '/serverlist',
      icon: ServersIconSvg
    },
    {
      id: 4,
      label: 'Settings',
      route: '/settings',
      icon: SettingsIconSvg,
      minimal: true
    }]

  currentRoute: Route = this.$router.currentRoute;

  get showFooter () {
    return !this.$store.state.firstLaunch &&
      !this.currentRoute.path.includes('/settings')
  }

  @Watch('$route')
  onRouteChanged (to: Route, from: Route) {
    this.currentRoute = to

    const toIndex = this.buttons.find(btn => to.path.includes(btn.route))?.id
    const fromIndex = this.buttons.find(btn => from.path.includes(btn.route))?.id
    if (toIndex && fromIndex) {
      this.transitionName = toIndex > fromIndex ? 'slide-right' : 'slide-left'
    } else {
      this.transitionName = 'fade'
    }
  }

  async mounted () {
    try {
      await UpdateService.updateBepinex()
      await UpdateService.checkModUpdates()
    } catch (e) {
      // eslint-disable-next-line
      const notif = new Notification("Couldn't find mod updates", {
        body: 'Dropship cannot connect to the mod info API',
        icon: NotifImage
      })
    }
  }
}
</script>

<style lang="stylus">
.slide-right-enter-active, .slide-right-leave-active
  transition all .3s ease
.slide-right-enter
  transform translateX(100vw)
  opacity 0
.slide-right-leave-to
  position absolute
  width 100%
  transform translateX(-100vw)
  opacity 0

.slide-left-enter-active, .slide-left-leave-active
  transition all .3s ease
.slide-left-enter
  transform translateX(-100vw)
  opacity 0
.slide-left-leave-to
  position absolute
  width 100%
  transform translateX(100vw)
  opacity 0

.fade-enter-active, .fade-leave-active
  transition opacity .3 ease
.fade-enter, .fade-leave-to
  opacity 0

.hide-bottom-enter-active, .hide-bottom-leave-active
  transition transform .3s ease
.hide-bottom-enter, .hide-bottom-leave-to
  transform translateY(150px)

.main-view
  padding-top 87px
  padding-bottom 100px
  min-height 100vh
  background-color black
  color white

::-webkit-scrollbar {
  display: none;
}

.bg-verydark
  background-color #272727
  color white

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-Regular.ttf")
  font-weight normal
  font-style normal

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-Bold.ttf")
  font-weight bold
  font-style normal

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-BoldItalic.ttf")
  font-weight bold
  font-style italic

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-Italic.ttf")
  font-weight normal
  font-style italic

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-Light.ttf")
  font-weight light
  font-style normal

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-LightItalic.ttf")
  font-weight light
  font-style italic

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-Medium.ttf")
  font-weight bolder
  font-style normal

@font-face
  font-family Ubuntu
  src url("./assets/fonts/Ubuntu-MediumItalic.ttf")
  font-weight bolder
  font-style italic

#app
  font-family Ubuntu
  color white
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
</style>

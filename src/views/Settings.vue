<template>
  <div class="d-flex justify-content-center">
    <div class="bg-verydark mt-3 border border-white rounded container">
      <h2 class="font-weight-bold py-3 text-center">Settings</h2>
      <hr>
      <form class="px-5">
        <div class="form-group pb-3">
          <ValidationProvider rules="required" v-slot="v">
            <label for="location" class="py-2">Location: </label>
            <div class="input-group">
              <input type="text" class="form-control" id="location" placeholder="Location of AmongUs Directory"
                   v-model="location" @blur="saveLocation()">
              <button class="btn btn-info" @click="chooseFolder()">Choose Folder</button>
            </div>
            <small class="form-text text-danger">{{ v.errors[0] }}</small>
          </ValidationProvider>
          <button class="btn btn-primary btn-block my-1" @click.prevent="autodetect">Autodetect</button>
        </div>
        <div class="form-group pb-3">
          <label for="launchWrapper" class="py-2">Launch method: </label>
          <select class="form-control" v-model="launchWrapper" id="launchWrapper">
            <option :value="0">Steam</option>
            <option :value="1">Standard</option>
            <option :value="2">Custom</option>
          </select>
          <div v-if="launchWrapper === 2">
            <ValidationProvider rules="required" v-slot="v">
              <label for="customExec" class="py-2">Location: </label>
              <input v-model="customExecLine" type="text" class="form-control" id="customExec" placeholder="Custom Exec Line">
              <small class="form-text text-danger">{{ v.errors[0] }}</small>
            </ValidationProvider>
          </div>
        </div>
        <div class="form-group pb-3">
          <ValidationProvider rules="required" v-slot="{ errors }">
            <label class="form-label">Game Version:</label>
            <select
              class="form-control"
              v-model="gameVersionPlatform"
            >
              <option v-for="verPlat in versionPlatforms" :key="verPlat.name" :value="verPlat.name">{{ verPlat.name }}</option>
            </select>
            <span class="form-text text-danger">{{ errors[0] }}</span>
          </ValidationProvider>
        </div>
        <div class="form-group pb-3">
          <label for="bepinex" class="py-2">Patcher: </label>
          <button class="btn btn-block my-1"
                  :class="[btncolor]"
                  id="bepinex"
                  @click.prevent="installBepinex">Install Bepinex
            <i v-if="btncolor === 'btn-success'" class="fas fa-check"></i>
            <i v-if="btncolor === 'btn-danger'" class="fas fa-times" />
          </button>
          <div v-if="onLinux" class="pt-3">
            <h6 class="text-center">Hey! You're on Linux. There is some manual configuration required.</h6>
            <ul>
             <li>First, open <span class="pre">winecfg</span> in the Wine Prefix that Among Us is installed in.
               You can use a wrapper like <span class="pre">winetricks</span> or <span class="pre">protontricks</span>.</li>
              <li>Second, open the <span class="pre">Libraries</span> tab, type
                <span class="pre">winhttp</span> into the "New override for library" textbox, and press <span class="pre">Add</span></li>
              <li>Third, press <span class="pre">Apply</span> at the bottom, and close the window.
                Now, your system has been configured to run modded Among Us!</li>
              <li>These steps are a one time installation, and should only be repeated if you change the Wine Prefix the game runs under
                (such as deleting and reinstalling the game from Steam).</li>
            </ul>
          </div>
        </div>
      </form>
      <button class="btn btn-dark float-left m-3" @click="firstLaunchAgain">Instructions</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import LauncherService from '@/services/launcherService'
import { LaunchWrapperType } from '@/electronMain/models/gameLaunchArgs'
import { Route } from 'vue-router'
import VModal from '@/components/VModal.vue'
import UpdateService from '@/services/updateService'
import * as os from 'os'
import { remote } from 'electron'
import GameVersion from '@/services/gameVersionService'

@Component({
  components: {
    VModal,
    ValidationObserver,
    ValidationProvider
  }
})
export default class Settings extends Vue {
  location = this.$store.state.gameInstallInfo.location
  launchWrapper: LaunchWrapperType = this.$store.state.gameInstallInfo.launchWrapper
  customExecLine = this.$store.state.gameInstallInfo.customExecLine
  gameVersionPlatform = this.$store.state.gameInstallInfo.gameVersionPlatform.name

  versionPlatforms = GameVersion.List

  get btncolor (): 'btn-secondary' | 'btn-success' {
    return this.$store.state.bepinex.installed ? 'btn-success' : 'btn-secondary'
  }

  async chooseFolder () {
    const response = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: 'Choose Among Us Install directory',
      properties: ['openDirectory']
    })

    if (!response.canceled) {
      this.location = response.filePaths[0]
      this.saveLocation()
    }
  }

  async autodetect () {
    const location = await LauncherService.autodetectPath()
    if (location) {
      this.location = (location as string)
      await this.saveLocation()
    }
  }

  async saveLocation () {
    if (this.$store.state.gameInstallInfo.location !== this.location) {
      this.$store.commit('updateBepinexInstalled', false)
      this.$store.commit('updateBepinexVersion', 0)
    }
    this.$store.commit('updateInstallLocation', this.location)

    // locate game version
    // const version = LauncherService.getGameVersion()
    // this.$store.commit('updateGameVersionPlatform', version)
  }

  async installBepinex () {
    const success = await UpdateService.installBepinex()
    if (success) {
      this.$store.commit('updateBepinexInstalled', true)
    }
  }

  async firstLaunchAgain () {
    this.$store.commit('updateFirstLaunch', true)
    this.$router.push('/firstLaunch')
  }

  beforeRouteLeave (to: Route, from: Route, next: () => void) {
    this.saveLocation()
    this.$store.dispatch('updateGameLaunchInfo', {
      launchWrapper: this.launchWrapper,
      customExecLine: this.customExecLine,
      gameVersionPlatform: GameVersion.Map[this.gameVersionPlatform]
    })
    next()
  }

  get onLinux () {
    return os.platform() === 'linux'
  }
}
</script>
<style scoped lang="stylus">
.pre
  font-family Helvetica
  font-weight bold
</style>

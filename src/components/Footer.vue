<template>
  <footer class="fixed-bottom d-flex justify-content-around align-items-center bg-verydark">
    <button class="btn text-white my-3 d-flex align-items-center border-white" @click="this.launchDefaultGame">
      <img src="@/assets/icons/redCrewmate.png" alt="" width="30">
      <span class="px-3">Default Installation</span>
    </button>
    <div class="w-25"></div>
    <button class="start position-absolute btn d-flex justify-content-around border-white" @click="this.launchModdedGame">
      <img src="@/assets/icons/AmongUs.png" alt="">
      <span class="text-white">Launch</span>
    </button>
    <div class="w-25 text-center">
      <p style="height: fit-content">Dropship alpha</p>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import LauncherService from '@/services/launcherService'

@Component({})
export default class Footer extends Vue {
  get username () {
    return this.$store.state.auth.username
  }

  launchModdedGame () {
    LauncherService.launchGame(true)
  }

  launchDefaultGame () {
    LauncherService.launchGame(false)
  }
}
</script>
<style scoped lang="stylus">
.start
  background-color #272727 !important
  filter: drop-shadow(0px 5px 6px rgba(0, 0, 0, 0.4))
  bottom 40px
  width 220px
  img
    width 40px
  span
    font-size 22px
</style>

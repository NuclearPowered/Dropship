<template>
  <div class="d-flex justify-content-center">
    <div class="bg-verydark text-center mt-3 border border-white rounded" style="width: 500px">
      <h2 class="font-weight-bold py-3 text-center">Welcome!</h2>
      <hr>
      <h4>There's a few things we need to set up.</h4>
      <ul class="text-left">
        <li>Locate your Among Us directory</li>
        <li>Install BepInEx to allow patching of Among Us</li>
      </ul>
      <h5>Dropship can usually do this automatically. Go to settings to start.</h5>
      <div class="d-flex justify-content-center">
        <a @click="redirectSettings" class="router-link m-2 p-2">
          <img src="@/assets/icons/settings.svg" alt="">
          <span>Settings</span> <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class FirstLaunch extends Vue {
  redirectSettings () {
    this.$store.commit('updateFirstLaunch', false)
    this.$router.push('/settings')
  }
}
</script>
<style scoped lang="stylus">
.router-link
  height 38px
  width 158px

  color white
  text-decoration none
  border 1px solid white
  border-radius 8px
  cursor pointer

  display flex
  align-items center
  justify-content space-around
  img
    height 22px
  span
    font-size 20px
</style>

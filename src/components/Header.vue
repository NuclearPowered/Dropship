<template>
  <header class="fixed-top d-flex justify-content-between align-items-center bg-verydark">
    <div class="d-flex align-items-center">
      <img src="@/assets/icons/inject.svg" class="px-3 mt-2">
      <span class="title font-weight-bold my-3">Dropship</span>
    </div>
    <div class="d-flex align-items-center">
      <router-link v-for="button in buttons"
                   :key="button.id"
                   :to="button.route"
                   :class="[button.minimal ? 'minimal-icon' : 'router-link']"
                   tag="div">
        <img :src="button.icon" alt="">
        <span v-if="!button.minimal">{{ button.label }}</span>
      </router-link>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class Header extends Vue {
  @Prop()
  buttons!: never;
}
</script>
<style scoped lang="stylus">
.title
  font-size 36px
.router-link
  height 38px
  width 138px
  margin 10px

  color gray
  text-decoration none
  border 1px solid #a3a3a3
  border-radius 8px
  cursor pointer

  display flex
  align-items center
  justify-content space-around

  img
    height 22px
    filter opacity(50%)

  span
    font-size 20px
    padding-right 10px

.minimal-icon
  padding-left 10px
  padding-right 20px
  margin-top -5px
  filter opacity(50%)
  cursor pointer

.router-link-active
  color white
  border-color white
  border-bottom-width 6px
  filter unset
  img
    filter unset
</style>

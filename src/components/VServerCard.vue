<template>
  <div class="card m-2 h-100">
    <div class="d-flex p-3 header shadow-lg">
      <img :src="ServerCard.image" class="card-img" alt="Mod Image">
      <div class="d-flex justify-content-between w-100 overflow-hidden">
        <div class="pl-2">
          <h3 class="card-title">{{ ServerCard.title }}</h3>
          <h6 class="card-subtitle font-italic">{{ subtitle }}</h6>
          <h6 class="card-subtitle font-italic">{{ subtitleSecondary }}</h6>
        </div>
        <VuePopper trigger="hover" :options="{placement: 'bottom'}">
          <div class="popper">
            {{ popperMsg }}
          </div>
          <div slot="reference" class="icon" @click="onClick()">
            <i class="fas icon" v-if="icon" :class="[icon]"></i>
          </div>
        </VuePopper>
      </div>
    </div>

    <div class="card-body">
      <p class="card-text overflow-hidden">{{ ServerCard.description }}</p>
    </div>
    <div class="card-footer font-italic">{{ health }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ServerCard, ServerCardIcon } from '@/models/cardViewModel'
import ServerListService from '@/services/serverListService'
import VuePopper from 'vue-popperjs'

@Component({
  components: { VuePopper }
})
export default class VServerCard extends Vue {
  @Prop()
  ServerCard!: ServerCard;

  clicked = false

  onClick () {
    this.$emit('action', this.ServerCard)
    this.clicked = true
  }

  get popperMsg () {
    if (this.ServerCard.cardIcon === ServerCardIcon.Liked) {
      return 'Remove server?'
    } else if (this.ServerCard.cardIcon === ServerCardIcon.Unliked) {
      return 'Save this server?'
    }
  }

  get icon (): 'fa-heart-broken' | 'fa-heart' {
    if (this.ServerCard.cardIcon === ServerCardIcon.Liked) { // the icon should represent the action of removing
      return 'fa-heart-broken'
    } else {
      return 'fa-heart'
    }
  }

  get subtitle () {
    return `${ServerListService.num2dot(this.ServerCard.subtitle.ipAddress)}`
  }

  get subtitleSecondary () {
    return this.ServerCard.subtitle.owner || ''
  }

  get health () {
    return this.ServerCard.footer.health ? 'Healthy' : 'Offline'
  }
}
</script>
<style scoped lang="stylus">
.popper
  background-color #0d2d42
  padding 5px
  font-size 12px
  border-radius 5px
  opacity .8
.icon
  transition all .15s ease-in-out
  color white
  font-size 20px
  cursor pointer
  &:hover
    color #6f0606
.card
  background-color #FF6868
.header
  background-color #E85555
.card-img
  width 72px
  max-height 100px
  max-width 72px
  filter drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))
.card-text
  max-height 6rem
</style>

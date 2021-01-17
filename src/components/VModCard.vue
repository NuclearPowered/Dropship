<template>
  <div class="card m-2 h-100" :class="{ clicked }">
    <div class="d-flex p-3 header shadow-lg">
      <img :src="ModCard.image" class="card-img" alt="Mod Image">
      <div class="d-flex justify-content-between w-100 overflow-hidden">
        <div class="pl-2">
          <h3 class="card-title">{{ ModCard.title }}</h3>
          <h6 class="card-subtitle font-italic">{{ ModCard.subtitle.creator }}</h6>
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
      <p class="card-text overflow-hidden">{{ ModCard.description }}</p>
    </div>
    <div class="card-footer font-italic">{{ footer }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ModCard, ModCardIcon } from '@/models/cardViewModel'
import VuePopper from 'vue-popperjs'

@Component({
  components: { VuePopper }
})
export default class VModCard extends Vue {
  @Prop()
  ModCard!: ModCard

  clicked = false

  onClick () {
    this.$emit('action', this.ModCard)
    this.clicked = true
  }

  get popperMsg () {
    if (this.ModCard.cardIcon === ModCardIcon.Core) {
      return 'Cannot remove mod'
    } else if (this.ModCard.cardIcon === ModCardIcon.Download) {
      return 'Download mod'
    } else if (this.ModCard.cardIcon === ModCardIcon.Installed) {
      return 'Delete mod permanently?'
    } else {
      return ''
    }
  }

  get icon (): 'fa-trash disabled' | 'fa-download' | 'fa-trash' | '' {
    if (this.ModCard.cardIcon === ModCardIcon.Core) { // the icon should represent unable to remove
      return ''
    } else if (this.ModCard.cardIcon === ModCardIcon.Download) { // the icon should represent downloading a mod
      return 'fa-download'
    } else if (this.ModCard.cardIcon === ModCardIcon.Installed) { // the icon should represent removing a mod
      return 'fa-trash'
    } else {
      return ''
    }
  }

  get footer () {
    if (this.ModCard.footer.currentVersion) {
      return `${this.ModCard.footer.guid} - Ver: ${this.ModCard.footer.currentVersion}`
    } else {
      return this.ModCard.footer.guid
    }
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

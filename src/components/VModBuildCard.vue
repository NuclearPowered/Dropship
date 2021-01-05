<template>
  <div class="card m-2 h-100">
    <div class="d-flex p-3 header shadow-lg">
      <img :src="ModBuildCard.image" class="card-img" alt="Mod Build Image">
      <div class="pl-2 title-div">
        <h3 class="card-title">{{ ModBuildCard.title }}</h3>
      </div>
      <span class="icon" @click="$emit('action', ModBuildCard)">
        <i class="fas fa-download"></i>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { ModBuildCard } from '@/models/cardViewModel'

@Component({})
export default class VModBuildCard extends Vue {
  @Prop()
  ModBuildCard!: ModBuildCard
}
</script>
<style scoped lang="stylus">
.card
  background-color #FF6868

  .header
    background-color #E85555
    .title-div
      width 60%
    .icon
      position absolute
      right 10%
      top 15%
      font-size 28px
      cursor pointer

  .card-img
    width 72px
    filter drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))
</style>

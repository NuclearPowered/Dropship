<template>
  <div class="row">
    <div class="col-5">
      <SkeletonLoader height="150px" width="100%"/>
    </div>
    <div class="col-7 text-start">
      <SkeletonLoader height="2.5em"/>
      <div class="spacer"></div>
      <SkeletonLoader />
      <SkeletonLoader />
      <div class="spacer"></div>
      <SkeletonLoader />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

@Component({
  components: { SkeletonLoader }
})
export default class SkeletonCard extends Vue {
}
</script>
<style scoped lang="stylus">
.spacer
  height 1.2em
</style>

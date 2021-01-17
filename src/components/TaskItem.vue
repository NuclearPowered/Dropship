<template>
  <div class="list-group-item bg-dark">
    <small>{{ task.name }}</small>
    <div class="progress progress-height">
      <div class="progress-bar" :style="{ width: progressWidth }">{{ progressWidth }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { BackgroundTask } from '@/electronMain/models/backgroundTask'

@Component({})
export default class TaskItem extends Vue {
  @Prop()
  task!: BackgroundTask

  get progressWidth () {
    return `${Math.round(this.task.currentProgress / this.task.totalProgress * 100)}%`
  }
}
</script>
<style scoped lang="stylus">
.progress-height
  height 10px
</style>

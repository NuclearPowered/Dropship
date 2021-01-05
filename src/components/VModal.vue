<template>
  <div class="d-flex justify-content-center modal-backdrop bg-modal" v-if="value">
    <div class="bg-verydark border border-white rounded modal-card">
      <div class="container scrollable">
        <div class="flex-row position-relative">
          <h3 class="font-weight-bold text-center pt-3">
            <slot name="title"></slot>
          </h3>
          <button class="btn btn-danger position-absolute corner-button"
                  v-if="closable"
                  @click="closeModal">&times;
          </button>
        </div>
        <hr>
        <div class="pb-3">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class VModal extends Vue {
  @Prop({ default: false })
  value!: boolean;

  @Prop({ default: true })
  closable!: boolean;

  closeModal () {
    this.$emit('input', false)
  }
}
</script>
<style scoped lang="stylus">
.bg-modal
  top 80px
  background-color rgba(0, 0, 0, 0.5)
  .modal-card
    width 85vw
    height 70vh

.scrollable
  max-height 100%
  overflow scroll
.corner-button
  top 10px
  right 0
</style>

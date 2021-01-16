<template>
  <span
    :style="{ height, width: computedWidth }"
    class="skeleton-loader"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class SkeletonLoader extends Vue {
  @Prop({ default: 100 })
  maxWidth!: number;

  @Prop({ default: 80 })
  minWidth!: number;

  @Prop({ default: '1em' })
  height!: string;

  @Prop()
  width!: string;

  get computedWidth () {
    return this.width || `${Math.floor((Math.random() * (this.maxWidth - this.minWidth)) + this.minWidth)}%`
  }
};
</script>

<style lang="stylus">
.skeleton-loader {
  display inline-block
  position relative
  background-color #541e1e
  overflow hidden

  //background-image:
  //  radial-gradient( circle 50px at 50px 50px, lightgray 99%, transparent 0 ),
  //  linear-gradient( 100deg,
  //    rgba(255, 255, 255, 0),
  //    rgba(255, 255, 255, 0.5) 50%,
  //    rgba(255, 255, 255, 0) 80%
  //  ),
  //  linear-gradient( lightgray 20px, transparent 0 ),
  //  linear-gradient( lightgray 20px, transparent 0 ),
  //  linear-gradient( lightgray 20px, transparent 0 ),
  //  linear-gradient( lightgray 20px, transparent 0 );
  //
  //background-repeat: repeat-y;
  //
  //background-size:
  //  100px 200px, /* circle */
  //  50px 200px, /* highlight */
  //  150px 200px,
  //  350px 200px,
  //  300px 200px,
  //  250px 200px;
  //
  //background-position:
  //  0 0, /* circle */
  //  0 0, /* highlight */
  //  120px 0,
  //  120px 40px,
  //  120px 80px,
  //  120px 120px;

  //animation: shine 1s infinite;
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(#fff, 0) 0,
      rgba(#fff, 0.2) 20%,
      rgba(#fff, 0.5) 60%,
      rgba(#fff, 0)
    );
    animation: shine 1.2s infinite;
    content: '';
  }
}

@keyframes shine {
  100% {
    transform: translateX(100%);
  }
}

</style>

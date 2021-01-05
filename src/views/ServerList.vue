<template>
  <div>
    <div class="list-group list-group-horizontal text-center">
      <router-link v-for="button in buttons" :key="button.id"
                   :to="button.route"
                   class="list-group-item list-group-item-dark list-group-item-action active">
        {{ button.label }}
      </router-link>
    </div>
    <transition :name="transitionName">
      <router-view/>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { RouterLinkModel } from '@/models/routerLinkViewModel'
import { Route } from 'vue-router'

@Component({})
export default class ServerList extends Vue {
  transitionName = 'fade';

  buttons: RouterLinkModel[] = [
    {
      id: 1,
      label: 'Installed',
      route: 'installed'
    },
    {
      id: 2,
      label: 'Direct Connect',
      route: 'directconnect'
    },
    {
      id: 3,
      label: 'Browse',
      route: 'browse'
    }
  ];

  beforeRouteUpdate(to: Route, from: Route, next: () => void) { // eslint-disable-line
    const toIndex = this.buttons.find((btn) => to.path.includes(btn.route))?.id
    const fromIndex = this.buttons.find((btn) => from.path.includes(btn.route))
      ?.id
    if (toIndex && fromIndex) {
      this.transitionName = toIndex > fromIndex ? 'slide-right' : 'slide-left'
    } else {
      this.transitionName = 'fade'
    }

    next()
  }
}
</script>
<style lang="stylus" scoped>
.router-link-active {
  border-bottom-width: 3px !important;
  border-bottom-color: white !important;
}
</style>

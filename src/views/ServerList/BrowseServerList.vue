<template>
  <div class="container">
    <div class="row">
      <div class="row" v-infinite-scroll="loadMore" :infinite-scroll-disabled="busy">
        <div v-if="serverList.length > 0">
          <div v-for="(server, i) in serverList" :key="i" class="col-6 col-lg-4 mb-3">
            <VServerCard :server-card="server" @action="addServer($event)" />
          </div>
        </div>
        <div class="d-flex justify-content-evenly" v-else>
          <SkeletonCard class="p-3 col-6" />
          <SkeletonCard class="p-3 col-6" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ServerCard, ServerCardIcon } from '@/models/cardViewModel'
import ServerListService from '@/services/serverListService'
import VServerCard from '@/components/VServerCard.vue'
import { StoreServerModel } from '@/models/storeModel'
import SkeletonCard from '@/components/SkeletonCard.vue'

@Component({
  components: { VServerCard, SkeletonCard }
})
export default class BrowseServerList extends Vue {
  serverList: ServerCard[] = [];
  currentPage = 1;
  busy = false;

  async loadMore () {
    this.busy = true
    await this.refresh(this.currentPage++)
  }

  async refresh (pageNum: number) {
    const serverList = await ServerListService.getServerListPaginated(pageNum)
    if (serverList && serverList.length > 0) {
      // If the installed serverList contains the server, don't show it.
      this.serverList = serverList
        .filter(s => !this.$store.state.serverList.some((x: StoreServerModel) =>
          x.ipAddress === s.ipAddress &&
          x.port === s.port))
        .map(s => ({
          id: s.id,
          image: s.imageUrl,
          title: s.name,
          subtitle: {
            owner: s.owner.username,
            ipAddress: s.ipAddress,
            port: s.port
          },
          cardIcon: ServerCardIcon.Unliked,
          description: s.description,
          footer: {
            health: true
          }
        }))
      this.busy = false
    }
  }

  async addServer (event: ServerCard) {
    const success = await ServerListService.addServer(event.id, event.title, event.subtitle.ipAddress, event.subtitle.port)
    if (success) {
      this.serverList.splice(this.serverList.findIndex(srv => srv.id === event.id), 1)
      this.$router.push('/serverlist')
    }
  }
}
</script>
<style scoped lang="stylus">
</style>

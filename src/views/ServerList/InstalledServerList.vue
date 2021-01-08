<template>
  <div class="container">
    <div class="row">
      <div v-for="(server, i) in serverList" :key="i" class="col-6 col-lg-4 mb-3">
        <VServerCard :server-card="server" @action="removeServer($event)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ServerCard, ServerCardIcon } from '@/models/cardViewModel'
import VServerCard from '@/components/VServerCard.vue'
import ServerListService from '@/services/serverListService'
import { StoreServerModel } from '@/models/storeModel'
import ModDefault from '@/assets/icons/mod_default.png'

@Component({
  components: { VServerCard }
})
export default class InstalledServerList extends Vue {
  serverList: ServerCard[] = [];
  async refresh () {
    this.serverList = await Promise.all(this.$store.state.serverList
      .map(async (s: StoreServerModel) => {
        if (s.id !== -1) {
          const serverResponse = await ServerListService.getServerInfo(s.id)
          if (serverResponse) {
            return {
              id: s.id,
              image: serverResponse.imageUrl,
              title: serverResponse.name,
              subtitle: {
                ipAddress: serverResponse.ipAddress,
                port: serverResponse.port,
                owner: serverResponse.owner.username
              },
              cardIcon: ServerCardIcon.Liked,
              description: serverResponse.description,
              footer: {
                health: true
              }
            }
          }
        }
        return {
          id: s.id,
          image: ModDefault,
          title: s.name,
          subtitle: {
            ipAddress: s.ipAddress,
            port: s.port,
            owner: ''
          },
          cardIcon: ServerCardIcon.Liked,
          description: 'Direct connect server',
          footer: {
            health: true
          }
        }
      })
    )
  }

  async created () {
    await this.refresh()
  }

  async removeServer (event: ServerCard) {
    await ServerListService.removeServer(event.title, event.subtitle.ipAddress, event.subtitle.port)
    await this.refresh()
  }
}
</script>
<style scoped lang="stylus">
</style>

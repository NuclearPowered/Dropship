<template>
  <div class="container">
    <div class="row justify-content-evenly" v-if="loading">
          <SkeletonCard class="p-3 col-6" />
          <SkeletonCard class="p-3 col-6" />
    </div>
    <div v-else>
      <div class="row" v-if="modList.length > 0">
        <div v-for="(mod, i) in modCardList" :key="i" class="col-6 col-lg-4 mb-3">
          <VModCard :mod-card="mod" @action="removeMod($event)"/>
        </div>
      </div>

      <div v-else class="d-flex justify-content-center">
        <div class="bg-verydark text-center mt-3 border border-white rounded" style="width: 500px">
          <h4 class="font-weight-bold pt-3 text-center">No mods found!</h4>
          <hr>
          <h6 class="px-2">This is normal if you just installed Dropship. Go find some mods and start playing!</h6>
          <p class="px-3" style="font-size: 12px">If not, your Among Us directory might not be correctly set. Fix it in settings.</p>
          <div class="d-flex justify-content-center">
            <router-link to="/settings" class="router-link m-2 p-2">
              <img src="@/assets/icons/settings.svg" alt="">
              <span>Settings</span> <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ModCard, ModCardIcon } from '@/models/cardViewModel'
import ModListService from '@/services/modListService'
import VModCard from '@/components/VModCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { ipcRenderer } from 'electron'
import ModMetadata from '@/electronMain/models/modMetadata'
import ModDefault from '@/assets/icons/mod_default.png'
import ExtModMetadata from '@/models/extModViewModel'

@Component({
  components: { VModCard, SkeletonCard }
})
export default class InstalledModList extends Vue {
  loading = true
  modList: {
    fileName: string;
    meta: ExtModMetadata;
  }[] = []

  get modCardList (): ModCard[] {
    return this.modList.map(({ meta }) => ({
      id: -1,
      image: (meta.imageUrl && meta.imageUrl !== '') ? meta.imageUrl : ModDefault,
      title: meta.name,
      subtitle: {
        creator: meta.creator
      },
      cardIcon: ModCardIcon.Installed,
      description: meta.description,
      footer: {
        guid: meta.id,
        currentVersion: meta.version
      }
    }))
  }

  async removeMod (event: ModCard) {
    await ModListService.removeModByGuidVer(event.footer.guid, event.footer.currentVersion as string)
  }

  async created () {
    try {
      await ModListService.startFileWatcher()
      ipcRenderer.on('file-added', async (event, args: { fileName: string; metadata: ModMetadata }) => {
        const meta = await ModListService.getInfoForModMetadata(args.metadata)
        this.modList.push({ fileName: args.fileName, meta })
        this.loading = false
      })
      ipcRenderer.on('file-removed', (event, fileName: string) => {
        this.modList = this.modList.filter(m => m.fileName !== fileName)
      })
    } catch (e) {
      console.warn('Could not start file-watcher for instant mod refresh.')
    }
    setTimeout(() => {
      this.loading = false
    }, 800)
  }

  async beforeDestroy () {
    ipcRenderer.removeAllListeners('file-added')
    ipcRenderer.removeAllListeners('file-removed')
    await ModListService.stopFileWatcher()
  }
}
</script>
<style scoped lang="stylus">
.router-link
  height 38px
  width 158px

  color white
  text-decoration none
  border 1px solid white
  border-radius 8px
  cursor pointer

  display flex
  align-items center
  justify-content space-around
  img
    height 22px
  span
    font-size 20px
</style>

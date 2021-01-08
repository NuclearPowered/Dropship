<template>
  <div class="container">
    <div class="row" v-if="modCardList.length > 0">
      <div v-for="(mod, i) in modCardList" :key="i" class="col-6 col-lg-4 mb-3">
        <VModCard :mod-card="mod" @action="removeMod($event)"/>
      </div>
    </div>

    <div v-else class="d-flex justify-content-center">
      <div class="bg-verydark text-center mt-3 border border-white rounded" style="width: 500px">
        <h2 class="font-weight-bold py-3 text-center">No mods found!</h2>
        <hr>
        <h4>This is normal if you just installed Dropship. Go find some mods and start playing!</h4>
        <h6 class="pt-2 px-3">If not, your Among Us directory might not be correctly set. Fix it in settings.</h6>
        <div class="d-flex justify-content-center">
          <router-link to="/settings" class="router-link m-2 p-2">
            <img src="@/assets/icons/settings.svg" alt="">
            <span>Settings</span> <i class="fas fa-arrow-right"></i>
          </router-link>
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
import { ipcRenderer } from 'electron'
import ModMetadata from '@/electronMain/models/modMetadata'
import path from 'path'
import ModDefault from '@/assets/icons/mod_default.png'
import ExtModMetadata from '@/models/extModViewModel'

@Component({
  components: { VModCard }
})
export default class InstalledModList extends Vue {
  modList: ExtModMetadata[] = [];

  get modCardList (): ModCard[] {
    return this.modList.map(m => ({
      id: -1,
      image: (m.imageUrl && m.imageUrl !== '') ? m.imageUrl : ModDefault,
      title: m.name,
      subtitle: {
        creator: m.creator
      },
      cardIcon: ModCardIcon.Installed,
      description: m.description,
      footer: {
        guid: m.id,
        currentVersion: m.version
      }
    }))
  }

  async removeMod (event: ModCard) {
    await ModListService.removeModByGuidVer(event.footer.guid, event.footer.currentVersion as string)
  }

  async created () {
    try {
      await ModListService.startFileWatcher()
      ipcRenderer.on('file-added', async (event, args: ModMetadata) => {
        this.modList.push(await ModListService.getInfoForModMetadata(args))
      })
      ipcRenderer.on('file-removed', (event, fileName: string) => {
        const trueFileName = path.basename(fileName, '.dll')
        this.modList = this.modList.filter(m => !trueFileName.includes(m.assemblyName))
      })
    } catch (e) {
      console.warn('Could not start file-watcher for instant mod refresh.')
    }
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

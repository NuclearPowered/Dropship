<template>
  <div class="container">
    <section class="row p-3">
        <input class="form-control form-control-md" type="text" placeholder="Search..."
               v-model="searchText" @input="searchEvent()">
    </section>

    <div v-if="searchText.length > 0" class="row">
      <div v-for="(mod, i) in searchModList" :key="i" class="col-6 col-lg-4 mb-3">
        <VModCard :mod-card="mod" @action="selectMod($event)"/>
      </div>
    </div>
    <div v-else>
      <div v-infinite-scroll="loadMore" :infinite-scroll-disabled="busy">
        <div class="row" v-if="modList.length > 0">
          <div v-for="(mod, i) in modList" :key="i" class="col-6 col-lg-4 mb-3">
            <VModCard :mod-card="mod" @action="selectMod($event)"/>
          </div>
        </div>
        <div class="d-flex justify-content-evenly" v-else>
          <SkeletonCard class="p-3 col-6" />
          <SkeletonCard class="p-3 col-6" />
        </div>
      </div>
    </div>

    <!-- Modal -->
    <VModal v-model="modalDisplayed">
      <template v-slot:title>
        Choose a mod build to download
      </template>
      <div class="row overflow-auto">
        <div v-for="(modBuild, i) in modBuildList" :key="i" class="col-6 col-lg-4 pb-4">
          <VModBuildCard :mod-build-card="modBuild" @action="downloadModBuild($event)"/>
        </div>
      </div>
    </VModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ModBuildCard, ModCard, ModCardIcon } from '@/models/cardViewModel'
import ModListService from '@/services/modListService'
import VModCard from '@/components/VModCard.vue'
import VModBuildCard from '@/components/VModBuildCard.vue'
import VModal from '@/components/VModal.vue'
import ModDefault from '@/assets/icons/mod_default.png'
import * as _ from 'lodash'
import SkeletonCard from '@/components/SkeletonCard.vue'

@Component({
  components: { SkeletonCard, VModBuildCard, VModCard, VModal }
})
export default class BrowseModList extends Vue {
  searchText = ''
  searchModList: ModCard[] = []

  searchEvent () { this.throttleSearch() }

  throttleSearch = _.throttle(this.search, 1000);
  async search () {
    const response = await ModListService.searchModList(this.searchText)
    if (response) {
      this.searchModList = response.map(m => ({
        id: m.id,
        image: (m.imageUrl && m.imageUrl !== '') ? m.imageUrl : ModDefault,
        title: m.name,
        subtitle: {
          creator: m.creator.username
        },
        cardIcon: ModCardIcon.Download,
        description: m.description,
        footer: {
          guid: m.guid
        }
      }))
    }
  }

  modList: ModCard[] = [];
  currentPage = 1;
  busy = false;

  async loadMore () {
    this.busy = true
    await this.refresh(this.currentPage++)
  }

  async created () {
    await this.loadMore()
  }

  async refresh (page: number) {
    const modList = await ModListService.getModListPaginated(page)
    const installedMods = await ModListService.readModsFromFs()
    if (modList && modList.length > 0 && installedMods) {
      this.modList.push(...modList
        // Do not include mods that we already have installed
        .filter(m => !installedMods.some(im => im.id === m.guid))
        .map(m => ({
          id: m.id,
          image: (m.imageUrl && m.imageUrl !== '') ? m.imageUrl : ModDefault,
          title: m.name,
          subtitle: {
            creator: m.creator.username
          },
          cardIcon: ModCardIcon.Download,
          description: m.description,
          footer: {
            guid: m.guid
          }
        })))
      this.busy = false
    }
  }

  modalDisplayed = false;
  modBuildList: ModBuildCard[] = [];

  async selectMod (event: ModCard) {
    await ModListService.updateStarForMod(event.id)
    this.modalDisplayed = true
    await this.refreshModBuilds(event.id, 1)
  }

  async refreshModBuilds (modId: number, page: number) {
    const modBuilds = await ModListService.getModBuildsPaginatedFor(modId, page)
    if (modBuilds && modBuilds.length > 0) {
      this.modBuildList = modBuilds.map(m => ({
        id: m.id,
        image: ModDefault,
        title: m.version,
        subtitle: {
          modId: m.modId,
          versionCode: m.versionCode,
          gamePlatform: m.gamePlatform,
          gameVersion: m.gameVersion
        },
        cardIcon: ModCardIcon.Download,
        footer: {
          fileName: m.fileName,
          downloadUrl: m.downloadUrl
        }
      }))
    }
  }

  async downloadModBuild (event: ModBuildCard) {
    this.modalDisplayed = false
    const success = await ModListService.downloadModByUrl(event.footer!.downloadUrl, event.footer!.fileName); // eslint-disable-line
    if (success) {
      this.modList.splice(this.modList.findIndex(m => m.id === event.subtitle.modId), 1)
      this.$router.push('/modlist')
    }
  }
}
</script>
<style scoped lang="stylus">
</style>

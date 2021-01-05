import store from '@/store'
import webapi from '@/services/webapi'
import { GenericResponse, GenericResponseWithData } from '@/services/responses/genericResponse'
import { ipcRenderer } from 'electron'
import InstallBepinexArgs from '@/electronMain/models/installBepinexArgs'
import ModListService from '@/services/modListService'
import axios from 'axios'
import { BEPINEX_REPO, NUCLEARPOWERED_ORG } from '@/consts'
import { CheckModBuildUpdateResponse } from '@/services/responses/modResponse'
import semver from 'semver'

export default class UpdateService {
  static async checkModUpdates () {
    const modMetadata = await ModListService.readModsFromFs()

    const response: GenericResponse | GenericResponseWithData<CheckModBuildUpdateResponse[]> =
      (await webapi().post('/api/update/checkmodbuildupdates', modMetadata.map(m => m.id))).data

    if (!response.success) return false
    const modUpdateResponses = (response as GenericResponseWithData<CheckModBuildUpdateResponse[]>).data

    for (const modUpdate of modUpdateResponses) {
      const oldModMetadata = modMetadata.find(mm => mm.id === modUpdate.guid)
      if (!oldModMetadata) continue
      // If we have an update. Remove the old mod, and download the new one.
      if (semver.gt(modUpdate.modBuild.version, oldModMetadata!.version)) { // eslint-disable-line
        await ModListService.removeModByGuidVer(oldModMetadata!.id, oldModMetadata!.version); // eslint-disable-line
        await ModListService.downloadModByUrl(modUpdate.modBuild.downloadUrl, modUpdate.modBuild.fileName)
      }
    }
  }

  static async checkGithubReleaseUpdate (org: string, repo: string, releaseId: number): Promise<boolean> {
    const response = await axios.get(`https://api.github.com/repos/${org}/${repo}/releases/latest`)
    if (response.status !== 200) return false
    return response.data.id > releaseId
  }

  static async updateBepinex (): Promise<boolean> {
    if (!store.state.bepinex.installed) return false
    return await this.installBepinex()
  }

  static async installBepinex (): Promise<boolean> {
    const updateExists = await this.checkGithubReleaseUpdate(NUCLEARPOWERED_ORG, BEPINEX_REPO, store.state.bepinex.releaseId)
    if (!updateExists) return false

    const response = await axios.get(`https://api.github.com/repos/${NUCLEARPOWERED_ORG}/${BEPINEX_REPO}/releases/latest`)
    if (response.status !== 200) return false

    ipcRenderer.send('install-bepinex', {
      location: store.state.gameInstallInfo.location,
      downloadUrl: response.data.assets[0].browser_download_url
    } as InstallBepinexArgs)

    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('install-bepinex', (event, args) => {
        if (args) {
          store.commit('updateBepinexVersion', response.data.id)
          resolve(args)
        }
        reject(new Error('Could not install bepinex'))
      })
    })
  }
}

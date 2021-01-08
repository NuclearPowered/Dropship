import webapi from '@/services/webapi'
import { GenericResponse, GenericResponseWithData } from '@/services/responses/genericResponse'
import { ModBuildResponse, ModResponse } from './responses/modResponse'
import store from '@/store'
import { ipcRenderer } from 'electron'
import ModMetadata from '@/electronMain/models/modMetadata'
import { DownloadModArgs, RemoveModArgs } from '@/electronMain/models/modArgs'
import ExtModMetadata from '@/models/extModViewModel'

export default class ModListService {
  static async downloadModByUrl (downloadUrl: string, fileName: string): Promise<boolean> {
    ipcRenderer.send('download-mod', {
      location: store.state.gameInstallInfo.location,
      fileName,
      downloadUrl
    } as DownloadModArgs)
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('download-mod', (event, args: boolean) => {
        args ? resolve(args)
          : reject(new Error(`Couldn't download mod at: ${downloadUrl}`))
      })
    })
  }

  static async removeModByGuidVer (guid: string, version: string): Promise<boolean> {
    ipcRenderer.send('remove-mod', {
      location: store.state.gameInstallInfo.location,
      guid: guid,
      version
    } as RemoveModArgs)
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('remove-mod', (event, args: boolean) => {
        if (args) {
          resolve(args)
        }
        reject(new Error(`Couldn't remove mod with namespace ${guid} and version ${version}`))
      })
    })
  }

  static async getModInfo (guid: string): Promise<ModResponse | undefined> {
    try {
      const response: GenericResponse | GenericResponseWithData<ModResponse> =
        (await webapi().get(`/api/mods/guid/${guid}`)).data

      if (response.success) {
        return (response as GenericResponseWithData<ModResponse>).data
      }
    } catch (e) {
      console.log(`Mod with guid: ${guid} was not found on the online repos`)
    }
  }

  static async getInfoForModMetadata (m: ModMetadata): Promise<ExtModMetadata> {
    const modResponse = await ModListService.getModInfo(m.id)
    if (modResponse) {
      return {
        ...m,
        imageUrl: modResponse.imageUrl,
        creator: modResponse.creator.username,
        description: modResponse.description
      }
    } else {
      return {
        ...m,
        imageUrl: '',
        creator: m.authors,
        description: m.description
      }
    }
  }

  static async getModListPaginated (page: number): Promise<ModResponse[] | undefined> {
    const response: GenericResponse | GenericResponseWithData<ModResponse[]> =
      (await webapi().get(`/api/mods/page/${page}`)).data

    if (response.success) {
      return (response as GenericResponseWithData<ModResponse[]>).data
    }
  }

  static async searchModList (search: string) {
    try {
      const response: GenericResponse | GenericResponseWithData<ModResponse[]> =
        (await webapi().get(`/api/mods/search?query=${encodeURIComponent(search)}`)).data

      if (response.success) {
        return (response as GenericResponseWithData<ModResponse[]>).data
      }
    } catch (e) {
      console.warn(`Could not ${this.searchModList.toString()}`)
    }
  }

  static async getModBuildsPaginatedFor (modid: number, page: number): Promise<ModBuildResponse[] | undefined> {
    const response: GenericResponse | GenericResponseWithData<ModBuildResponse[]> =
      (await webapi().get(`/api/modbuilds/${modid}/page/${page}`)).data

    if (response.success) {
      return (response as GenericResponseWithData<ModBuildResponse[]>).data
    }
  }

  static async updateStarForMod (id: number) {
    try {
      const response: GenericResponse | GenericResponseWithData<ModResponse> =
        (await webapi().post(`/api/mods/${id}/star`)).data

      if (response.success) {
        return (response as GenericResponseWithData<ModResponse>).data
      }
    } catch (e) {
      console.warn(`Could not ${this.updateStarForMod.toString()}`)
    }
  }

  /*
  * Dropship-external compatibility section
  * */

  static async readModsFromFs (): Promise<ModMetadata[]> {
    ipcRenderer.send('refresh-mods', store.state.gameInstallInfo.location)
    return new Promise<ModMetadata[]>((resolve, reject) => {
      ipcRenderer.once('refresh-mods', (event, args: ModMetadata[]) => {
        if (args) {
          resolve(args)
        }
        reject(new Error('Unable to refresh mods'))
      })
    })
  }

  static async startFileWatcher () {
    ipcRenderer.send('start-file-watcher', store.state.gameInstallInfo.location)
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('start-file-watcher', (event, args: boolean) => {
        args ? resolve(args)
          : reject(new Error(`Couldn't start file watcher at ${store.state.gameInstallInfo.location}`))
      })
    })
  }

  static async stopFileWatcher () {
    ipcRenderer.send('stop-file-watcher')
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('stop-file-watcher', (event, args: boolean) => {
        args ? resolve(args)
          : reject(new Error(`Couldn't stop file watcher at ${store.state.gameInstallInfo.location}`))
      })
    })
  }
}

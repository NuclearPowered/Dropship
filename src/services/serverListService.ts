import webapi from '@/services/webapi'
import { GenericResponse, GenericResponseWithData } from '@/services/responses/genericResponse'
import { ServerResponse } from '@/services/responses/serverResponse'
import store from '@/store'
import { ipcRenderer } from 'electron'
import ServerArgs from '@/electronMain/models/serverArgs'

export default class ServerListService {
  static async addServer (id: number, name: string, ipAddress: number, port: number): Promise<boolean> {
    store.commit('addServer', { id, name, ipAddress, port })
    return await this.writeServersToFile()
  }

  static async removeServer (name: string, ipAddress: number, port: number): Promise<boolean> {
    store.commit('removeServer', { name, ipAddress, port })
    return await this.writeServersToFile()
  }

  static async writeServersToFile (): Promise<boolean> {
    ipcRenderer.send('write-server-file', {
      location: store.state.gameInstallInfo.location,
      servers: store.state.serverList
    } as ServerArgs)
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('write-server-file', (event, args: boolean) => {
        args ? resolve(args) : reject(new Error(`Couldn't write servers to file at ${store.state.gameInstallInfo.location}`))
      })
    })
  }

  static async getServerInfo (id: number): Promise<ServerResponse | undefined> {
    const response: GenericResponse | GenericResponseWithData<ServerResponse> =
      (await webapi().get(`/api/serverlist/${id}`)).data

    if (response.success) {
      return (response as GenericResponseWithData<ServerResponse>).data
    }
  }

  static async getServerListPaginated (page: number): Promise<ServerResponse[] | undefined> {
    const response: GenericResponse | GenericResponseWithData<ServerResponse[]> =
      (await webapi().get(`/api/serverlist/page/${page}`)).data

    if (response.success) {
      return (response as GenericResponseWithData<ServerResponse[]>).data
    }
  }

  static dot2num (dot: string): number {
    const d = dot.split('.')
    return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3])
  }

  static num2dot (num: number): string {
    return ((num >>> 24) + '.' +
      (num >> 16 & 255) + '.' +
      (num >> 8 & 255) + '.' +
      (num & 255))
  }

  static dnsQuery (query: string): Promise<{ err: boolean; address: string }> {
    ipcRenderer.send('dns-query', query)
    return new Promise((resolve) => {
      ipcRenderer.once('dns-query', (event, payload) => {
        resolve(payload)
      })
    })
  }

  static async pingServer (ipAddress: number, port: number) {
    ipcRenderer.send('ping-server', { ipAddress, port })
    return new Promise<boolean>((resolve, reject) => {
      ipcRenderer.once('ping-server', (event, args: boolean) => {
        args ? resolve(args)
          : reject(new Error(`Couldn't ping server at ${this.num2dot(ipAddress)}:${port}`))
      })
    })
  }
}

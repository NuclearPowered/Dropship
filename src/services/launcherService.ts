import { ipcRenderer } from 'electron'
import store from '@/store'
import GameLaunchArgs from '@/electronMain/models/gameLaunchArgs'

export default class LauncherService {
  static async launchGame (modded: boolean) {
    ipcRenderer.send('launch-game', {
      token: store.state.auth.jwt,
      modded,
      location: store.state.gameInstallInfo.location,
      launchWrapper: store.state.gameInstallInfo.launchWrapper,
      customExecLine: store.state.gameInstallInfo.customExecLine
    } as GameLaunchArgs)
  }

  static async autodetectPath (): Promise<boolean | string> {
    ipcRenderer.send('autodetect-path')
    return new Promise<boolean | string>((resolve, reject) => {
      ipcRenderer.once('autodetect-path', (event, args) => {
        if (args) {
          resolve(args)
        }
        reject(new Error())
      })
    })
  }
}

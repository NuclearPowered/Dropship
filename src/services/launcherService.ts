import { ipcRenderer } from 'electron'
import store from '@/store'
import GameLaunchArgs from '@/electronMain/models/gameLaunchArgs'
import GameVersion, { GameVerPlatInfo } from './gameVersionService'

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

  static getGameVersion () {
    ipcRenderer.send('get-game-version', store.state.gameInstallInfo.location)
    return new Promise<boolean | GameVerPlatInfo>((resolve, reject) => {
      ipcRenderer.once('get-game-version', (event, args) => {
        if (args) {
          const [year, month, day, rev] = args.gameVersion
          resolve(GameVersion.versionPlatform(args.gamePlatform, year, month, day, rev))
        }
        reject(new Error())
      })
    })
  }
}

import { App, ipcMain, IpcMainEvent } from 'electron'
import { exec } from 'child_process'
import * as vdf from '@node-steam/vdf'
import os from 'os'
import path from 'path'
import * as registry from 'registry-js'
import fs from 'fs'
import GameLaunchArgs, { LaunchWrapperType } from '@/electronMain/models/gameLaunchArgs'
import { getAmongUsVersion, getModMetadata } from '@/electronMain/native'
import ModMetadata from '@/electronMain/models/modMetadata'
import { DownloadModArgs, RemoveModArgs } from '@/electronMain/models/modArgs'
import axios from 'axios'
import chokidar from 'chokidar'
import ServerArgs from '@/electronMain/models/serverArgs'
import RegionInfoService from '@/electronMain/regionInfoService'
import RegionInfo from '@/electronMain/models/regionInfo'
import AdmZip, { IZipEntry } from 'adm-zip'
import InstallBepinexArgs from '@/electronMain/models/installBepinexArgs'
import * as dns from 'dns'
import globby from 'globby'
import { ELECTRON_APP_ID } from '@/consts'
import { v4 as uuidv4 } from 'uuid'
import { BackgroundTask, TaskState, TaskUpdate } from '@/electronMain/models/backgroundTask'

export default class ElectronMain {
  fileWatcher!: chokidar.FSWatcher;

  constructor (app: App) {
    this.registerIPC()
    if (process.platform === 'win32') {
      app.setAppUserModelId(ELECTRON_APP_ID)
    }
  }

  registerIPC () {
    ipcMain.on('launch-game', async (event, args: GameLaunchArgs) => {
      await this.launchGame(event, args)
    })
    ipcMain.on('autodetect-path', (event) => {
      event.reply('autodetect-path', this.detectGamePath())
    })
    ipcMain.on('download-mod', this.downloadMod)
    ipcMain.on('remove-mod', this.removeMod)
    ipcMain.on('refresh-mods', async (event, location: string) => {
      event.reply('refresh-mods', await this.refreshMods(location))
    })
    ipcMain.on('write-server-file', this.writeServersToFile)
    ipcMain.on('dns-query', this.dnsQuery)
    ipcMain.on('start-file-watcher', async (event, location: string) => {
      await this.startFileWatcher(event, location)
    })
    ipcMain.on('stop-file-watcher', this.stopFileWatcher)
    ipcMain.on('install-bepinex', this.installBepinex)
    ipcMain.on('get-game-version', this.getGameVersion)
  }

  async launchGame (event: IpcMainEvent, args: GameLaunchArgs) {
    console.log('Launching:', args)

    function launchCallback(err: any, data: any) { // eslint-disable-line
      event.reply('launch-game', err)
      console.log(err)
      console.log(data.toString())
    }

    if (!args.modded) {
      process.env.DOORSTOP_DISABLE = 'true'
    }
    if (os.platform() === 'linux' || os.platform() === 'darwin') {
      process.env.WINEDLLOVERRIDES = 'winhttp=n,b'
    }

    switch (args.launchWrapper) {
      case LaunchWrapperType.Steam: {
        let open: 'start' | 'open' | 'xdg-open'

        if (os.platform() === 'win32') {
          open = 'start'
        } else if (os.platform() === 'darwin') {
          open = 'open'
        } else if (os.platform() === 'linux') {
          open = 'xdg-open'
        } else {
          launchCallback(new Error('Unsupported os platform'), undefined)
          break
        }

        exec(`${open} "steam://run/945360//--doorstop-enable=${args.modded}"`, launchCallback)
        break
      }
      case LaunchWrapperType.Standard:
        if (os.platform() === 'linux' || os.platform() === 'darwin') {
          exec(`wine "${path.join(args.location, 'Among Us.exe')}" --doorstop-enable=${true}`, launchCallback)
        } else {
          exec(`"${path.join(args.location, 'Among Us.exe')}" --doorstop-enable=${args.modded}`, launchCallback)
        }
        break
      case LaunchWrapperType.Custom:
        if (args.customExecLine) {
          exec(`${args.customExecLine} --doorstop-enable=${args.modded}`, launchCallback)
        } else {
          launchCallback(new Error('Custom exec line is empty'), undefined)
        }
        break
    }
  }

  detectGamePath (): string | undefined {
    let steamApps: string

    const platform = os.platform()

    switch (platform) {
      case 'linux':
        steamApps = path.resolve(os.homedir(), '.steam', 'steam', 'steamapps')
        break
      case 'darwin':
        steamApps = path.resolve(os.homedir(), 'Library', 'Application Support', 'Steam', 'steamapps')
        break
      case 'win32': {
        const values = registry.enumerateValues(registry.HKEY.HKEY_CURRENT_USER, 'Software\\Valve\\Steam')
        const steamPath = values.find(v => v.name === 'SteamPath')
        if (steamPath === undefined || steamPath.type !== registry.RegistryValueType.REG_SZ) {
          return undefined
        }

        steamApps = path.resolve(steamPath.data, 'steamapps')
        break
      }
      default:
        return undefined
    }

    const libraryFoldersVdf = path.resolve(steamApps, 'libraryfolders.vdf')

    if (!fs.existsSync(libraryFoldersVdf)) {
      return undefined
    }

    const parsed = vdf.parse(fs.readFileSync(libraryFoldersVdf, 'utf8')) as {
      LibraryFolders: {
        TimeNextStatsReport: number;
        ContentStatsID: number;
        [key: string]: string | number;
      };
    }

    const libraryFolders = [steamApps]

    for (const key of Object.keys(parsed.LibraryFolders)) {
      const libraryFolder = parsed.LibraryFolders[key]

      if (!isNaN(Number(key)) && fs.existsSync(libraryFolder as string)) {
        libraryFolders.push(path.resolve(libraryFolder as string, 'steamapps'))
      }
    }

    for (const libraryFolder of libraryFolders) {
      const gamePath = path.resolve(libraryFolder, 'common', 'Among Us')

      if (fs.existsSync(gamePath)) {
        return gamePath
      }
    }

    return undefined
  }

  async downloadMod (event: IpcMainEvent, { location, fileName, downloadUrl }: DownloadModArgs) {
    try {
      const downloadedFile = await axios.get(downloadUrl, {
        responseType: 'stream'
      })
      if (downloadedFile.status !== 200) {
        console.warn(`Download mod request returned status code ${downloadedFile.status}`)
        event.reply('download-mod', false)
      }

      const modFile = path.join(location, 'BepInEx', 'plugins', fileName)
      const task: BackgroundTask = {
        uuid: uuidv4(),
        name: fileName,
        state: TaskState.Created,
        currentProgress: 0,
        totalProgress: parseInt(downloadedFile.headers['content-length']) || 0
      }
      event.reply('task-create', task)

      try {
        const writer = fs.createWriteStream(modFile)
        downloadedFile.data.pipe(writer)

        downloadedFile.data.on('data', (data: Buffer) => {
          task.currentProgress += Buffer.byteLength(data)
          const taskUpdate: TaskUpdate = {
            uuid: task.uuid,
            currentProgress: task.currentProgress,
            state: TaskState.Running
          }
          event.reply('task-update', taskUpdate)
        })

        writer.on('finish', () => {
          const taskUpdate: TaskUpdate = {
            uuid: task.uuid,
            currentProgress: task.totalProgress,
            state: TaskState.Success
          }
          event.reply('task-update', taskUpdate)
          event.reply('download-mod', true)
        })

        writer.on('error', () => {
          const taskUpdate: TaskUpdate = {
            uuid: task.uuid,
            currentProgress: task.currentProgress,
            state: TaskState.Error
          }
          event.reply('task-update', taskUpdate)
          event.reply('download-mod', false)
        })
      } catch {
        console.warn(`Could not open write stream to file ${modFile}`)
        const taskUpdate: TaskUpdate = {
          uuid: task.uuid,
          currentProgress: task.currentProgress,
          state: TaskState.Error
        }
        event.reply('task-update', taskUpdate)
        event.reply('download-mod', false)
      }
    } catch (e) {
      console.warn(`Error downloading mod at: ${downloadUrl}`)
      event.reply('download-mod', false)
    }
  }

  async removeMod (event: IpcMainEvent, { location, guid, version }: RemoveModArgs) {
    try {
      const modFiles = await globby(path.posix.join(location, 'BepInEx/plugins/**/*.dll'))
      for (const modFile of modFiles) {
        try {
          const metadata = getModMetadata(modFile)
          if (metadata.id === guid && metadata.version === version) {
            await fs.promises.unlink(modFile)
            event.reply('remove-mod', true)
            return
          }
        } catch (e) {
          console.warn(`Could not parse and delete mod: ${modFile}, In plugin directory: ${location}/BepInEx/plugins`)
          event.reply('remove-mod', false)
        }
      }
      event.reply('remove-mod', false)
    } catch (e) {
      console.warn(`Error reading into directory: ${location}. Error: ${e}`)
      event.reply('remove-mod', false)
    }
  }

  async refreshMods (location: string): Promise<ModMetadata[]> {
    try {
      const modFiles = await globby(path.posix.join(location, 'BepInEx/plugins/**/*.dll'))
      const modMetadata: ModMetadata[] = []
      for (const modFile of modFiles) {
        try {
          modMetadata.push(getModMetadata(modFile))
        } catch (e) {
          console.warn(`Could not parse mod: ${modFile}, In plugin directory: ${location}/BepInEx/plugins. Error: ${e}`)
        }
      }
      return modMetadata
    } catch (e) {
      console.warn(`Could not read into directory ${location}`)
      return []
    }
  }

  async stopFileWatcher (event: IpcMainEvent) {
    try {
      if (this.fileWatcher) {
        await this.fileWatcher.close()
        event.reply('stop-file-watcher', true)
      }
    } catch (e) {
      event.reply('stop-file-watcher', false)
      console.warn('Could not stop file watcher')
    }
  }

  async startFileWatcher (event: IpcMainEvent, location: string) {
    const modDir = path.join(location, 'BepInEx', 'plugins')
    try {
      if (this.fileWatcher) {
        await this.fileWatcher.close() // Fully dispose of the file watcher instead of just changing watch paths
      }
      this.fileWatcher = chokidar.watch(path.posix.join(modDir, '**/*.dll'))
      this.fileWatcher.on('add', modFile => {
        try {
          event.reply('file-added', getModMetadata(modFile))
        } catch (e) {
          console.warn(`Non mod .dll placed into mod directory (${modFile}). Error: ${e}`)
        }
      })
      this.fileWatcher.on('unlink', modFile => event.reply('file-removed', modFile))
      event.reply('start-file-watcher', true)
    } catch (e) {
      console.warn(`Error accessing plugin directory under location: ${modDir}`)
      event.reply('start-file-watcher', false)
    }
  }

  async writeServersToFile (event: IpcMainEvent, { location, servers }: ServerArgs) {
    const regionInfoPath = path.join(location, 'regionInfo.dat')
    try {
      await fs.promises.unlink(regionInfoPath)
    } catch (e) {
      console.log(`regionInfo.dat did not exist at path ${regionInfoPath} initially`)
    }
    try {
      const regionInfo: RegionInfo = {
        header: 0,
        nameBuffer: {
          length: 'Dropship'.length,
          name: 'Dropship'
        },
        pingIp: {
          length: '66.175.220.120'.length,
          ipaddr: '66.175.220.120'
        },
        serverCount: 1,
        serverInfo: servers.map(s => ({
          nameBuffer: {
            length: s.name.length,
            name: s.name
          },
          ipaddr: s.ipAddress,
          port: s.port
        }))
      }
      await fs.promises.writeFile(regionInfoPath, RegionInfoService.serialize(regionInfo))
      event.reply('write-server-file', true)
    } catch (e) {
      console.warn(`Could not write file ${regionInfoPath} with servers ${servers}`)
      event.reply('write-server-file', false)
    }
  }

  async dnsQuery (event: IpcMainEvent, query: string) {
    dns.lookup(query, (err, address) => {
      event.reply('dns-query', { err, address })
    })
  }

  async installBepinex (event: IpcMainEvent, { location, downloadUrl }: InstallBepinexArgs) {
    try {
      await fs.promises.rm(path.join(location, 'mono'), { recursive: true, force: true })
      await fs.promises.rm(path.join(location, 'winhttp.dll'))
      await fs.promises.rm(path.join(location, 'BepInEx', 'core'), { recursive: true, force: true })
    } catch (e) {
      console.warn('Could not delete old BepInEx installation, continuing with overwrite.')
    }
    try {
      const body = await axios.get(downloadUrl, {
        responseType: 'arraybuffer'
      })

      const zip = new AdmZip(Buffer.from(body.data as ArrayBuffer))
      zip.getEntries().forEach((zipFile: IZipEntry) => {
        console.log(`Extracting file: ${zipFile.entryName}`)
        zip.extractEntryTo(zipFile, location, true, true)
      })
      event.reply('install-bepinex', true)
    } catch (e) {
      console.warn('Could not download and install BepInEx')
      event.reply('install-bepinex', false)
    }
  }

  async getGameVersion (event: IpcMainEvent, location: string) {
    const globalgamemanagerPath = path.join(location, 'Among Us_Data', 'globalgamemanagers')
    try {
      if (fs.existsSync(globalgamemanagerPath)) {
        const version = getAmongUsVersion(location)
        const parsedVersion = version.split('.').map(i => parseInt(i))
        event.reply('get-game-version', parsedVersion)
        return
      }
    } catch (e) {}

    console.warn(`Cannot read game version from ${globalgamemanagerPath}`)
    event.reply('get-game-version', false)
  }
}

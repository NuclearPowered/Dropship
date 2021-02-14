export enum GamePlatform {
    Unknown = 0,
    Steam = 1,
    Itch = 2
}

export interface GameVerPlatInfo {
  name: string;
  year: number;
  month: number;
  day: number;
  versionNumber: number;
  platform: GamePlatform;
}
interface GameVerPlatMap {
  [name: string]: GameVerPlatInfo;
}

export default class GameVersion {
  static versionNumber (year: number, month: number, day: number, rev = 0) {
    return (year * 25000) + (month * 1800) + (day * 50) + rev
  }

  static verPlatString (platform: GamePlatform, year: number, month: number, day: number) {
    const platformString = GamePlatform[platform].toLowerCase()
    return `${year}.${month}.${day}${platformString[0]}`
  }

  static versionPlatform (platform: GamePlatform, year: number, month: number, day: number, rev = 0) {
    const name = this.verPlatString(platform, year, month, day)
    const versionNumber = this.versionNumber(year, month, day, rev)
    return {
      name, year, month, day, versionNumber, platform
    }
  }

  static readonly List: GameVerPlatInfo[] = [
    GameVersion.versionPlatform(GamePlatform.Steam, 2020, 12, 9),
    GameVersion.versionPlatform(GamePlatform.Itch, 2020, 11, 17)
  ]

  static readonly Map: GameVerPlatMap = GameVersion.List
    .reduce((prev, curr) => (
      {
        ...prev,
        [curr.name]: curr
      }), {} as GameVerPlatMap)

  static fromVersionNumber (versionNumber: number): { year: number; month: number; day: number; rev: number } {
    return {
      year: Math.floor(versionNumber / 25000),
      month: Math.floor(versionNumber % 25000 / 1800),
      day: Math.floor(versionNumber % 25000 % 1800 / 50),
      rev: Math.floor(versionNumber % 25000 % 1800 % 50)
    }
  }

  static fromPlatformString (platformString: string): GamePlatform {
    if (platformString.toLowerCase() === 's') return GamePlatform.Steam
    if (platformString.toLowerCase() === 'i') return GamePlatform.Itch
    return GamePlatform.Unknown
  }
}

/* eslint-disable */

import { LaunchWrapperType } from "@/electronMain/models/gameLaunchArgs";
import { BackgroundTask } from "@/electronMain/models/backgroundTask";

export default interface StoreModel {
  firstLaunch: boolean;
  auth: {
    loggedIn: boolean;
    jwt: string;
    username: string;
    userId: number;
  };
  bepinex: {
    installed: boolean;
    releaseId: number;
  };
  serverList: StoreServerModel[];
  gameInstallInfo: {
    location: string;
    launchWrapper: LaunchWrapperType;
    customExecLine: string;
    gameVersion: GameVersion;
    gamePlatform: GamePlatform;
  };
  tasks: BackgroundTask[];
}

export enum GamePlatform {
  Unknown,
  Steam,
  Itch
}

export enum GameVersion {
  Unknown,
  v2020129 = generateGameVersion(2020, 12, 9)
}

function generateGameVersion (year: number, month: number, day: number, rev = 0) {
  return (year * 25000) + (month * 1800) + (day * 50) + rev
}

export interface StoreServerModel {
  id: number;
  name: string;
  ipAddress: number;
  port: number;
}

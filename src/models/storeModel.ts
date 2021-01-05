/* eslint-disable */

import { LaunchWrapperType } from "@/electronMain/models/gameLaunchArgs";

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
  };
}

export interface StoreServerModel {
  id: number;
  name: string;
  ipAddress: number;
  port: number;
}

/* eslint-disable */
export default interface GameLaunchArgs {
  location: string;
  modded: boolean;
  token: string;
  launchWrapper: LaunchWrapperType
  customExecLine: string;
}

export enum LaunchWrapperType {
  Steam, // Launch with steam://run/. For windows/steam and linux/steam-proton
  Standard, // Launches with path.join(location, "Among Us.exe"). For windows/itch, linux/itch-wine
  Custom, // Launches with custom exec line. For custom wineprefix support, advanced launch configs, etc.
}

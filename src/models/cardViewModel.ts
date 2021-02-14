import { GamePlatform } from '@/services/gameVersionService'

export interface Card {
  id: number;
  image: string;
  title: string;
  subtitle: CardSubtitle;
  cardIcon: CardIcon;
  description: string;
  footer: CardFooter;
}

export type CardIcon = ModCardIcon | ServerCardIcon
export enum ServerCardIcon {
  Liked,
  Unliked
}
export enum ModCardIcon {
  Core,
  Download,
  Downloading,
  Installed,
}

export type CardSubtitle = ModCardSubtitle | ServerCardSubtitle | ModBuildCardSubtitle
export interface ModCardSubtitle {
  creator: string;
}
export interface ModBuildCardSubtitle {
  modId: number;
  versionCode: number;
  gamePlatform: GamePlatform;
  gameVersion: number;
}
export interface ServerCardSubtitle {
  ipAddress: number;
  port: number;
  owner: string;
}

export type CardFooter = ModCardFooter | ServerCardFooter | ModBuildFooter
export interface ModCardFooter {
  guid: string;
  currentVersion?: string;
}
export interface ServerCardFooter {
  health: boolean;
}
export interface ModBuildFooter {
  fileName: string;
  downloadUrl: string;
}

export interface ModCard extends Card {
  cardIcon: ModCardIcon;
  subtitle: ModCardSubtitle;
  footer: ModCardFooter;
}
export interface ServerCard extends Card {
  cardIcon: ServerCardIcon;
  subtitle: ServerCardSubtitle;
  footer: ServerCardFooter;
}
export interface ModBuildCard extends Omit<Card, 'description' | 'footer'> {
  cardIcon: ModCardIcon;
  subtitle: ModBuildCardSubtitle;
  footer?: ModBuildFooter;
}

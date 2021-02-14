import { GamePlatform } from '@/services/gameVersionService'
import UserResponse from './userResponse'

export interface ModResponse {
  id: number;
  guid: string;
  name: string;
  description: string;
  imageUrl: string;
  creator: UserResponse;
}

export interface ModBuildResponse {
  id: number;
  modId: number;
  versionCode: number;
  gamePlatform: GamePlatform;
  gameVersion: number;
  version: string;
  fileName: string;
  downloadUrl: string;
  deleted: boolean;
}

export interface CheckModBuildUpdateResponse {
  guid: string;
  modBuild: ModBuildResponse;
}

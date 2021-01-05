/* eslint-disable */
export default interface RegionInfo {
  header: number; //uint32LE
  nameBuffer: NameBuffer;
  pingIp: IpAddressBuffer;
  serverCount: number; //uint32LE
  serverInfo: ServerRegionInfo[]
}
export interface NameBuffer {
  length: number; // uint8?
  name: string;
}
export interface IpAddressBuffer {
  length: number; // uint8
  ipaddr: string;
}
export interface ServerRegionInfo {
  nameBuffer: NameBuffer;
  ipaddr: number; // uint32BE
  port: number; // uint16LE
}

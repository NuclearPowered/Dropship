/* eslint-disable */

interface ServerInfoArg {
  name: string;
  ipAddress: number; // uint32BE
  port: number; // uint16LE
}

export default interface ServerArgs {
  location: string;
  servers: ServerInfoArg[]
}

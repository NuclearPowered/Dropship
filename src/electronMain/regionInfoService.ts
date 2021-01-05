import RegionInfo, { IpAddressBuffer, NameBuffer, ServerRegionInfo } from '@/electronMain/models/regionInfo'

class BufferWriter {
  buffer: Buffer;
  constructor () {
    this.buffer = Buffer.alloc(0)
  }

  write (length: number, writeTo?: (b: Buffer) => void) {
    const newBuffer = Buffer.alloc(length)
    if (typeof writeTo === 'function') {
      writeTo(newBuffer)
    }
    this.buffer = Buffer.concat([this.buffer, newBuffer])
  }
}

class BufferReader {
  buffer: Buffer;
  offset: number;
  constructor (buffer: Buffer) {
    this.buffer = buffer
    this.offset = 0
  }

  read (length: number, reader?: (b: Buffer) => void) {
    if (typeof reader === 'function') {
      reader(this.buffer.slice(this.offset, this.offset + length))
    }
    this.offset += length
  }
}

export default class RegionInfoService {
  static serialize (regionInfo: RegionInfo): Buffer {
    const buffer = new BufferWriter()
    buffer.write(4) // header
    buffer.write(1,
      b => b.writeUInt8(regionInfo.nameBuffer.length))
    buffer.write(regionInfo.nameBuffer.length,
      b => b.write(regionInfo.nameBuffer.name))
    buffer.write(1,
      b => b.writeUInt8(regionInfo.pingIp.length))
    buffer.write(regionInfo.pingIp.length,
      b => b.write(regionInfo.pingIp.ipaddr))
    buffer.write(4,
      b => b.writeUInt32LE(regionInfo.serverCount))
    regionInfo.serverInfo.forEach(server => {
      buffer.write(1,
        b => b.writeUInt8(server.nameBuffer.length))
      buffer.write(server.nameBuffer.length,
        b => b.write(server.nameBuffer.name))
      buffer.write(4,
        b => b.writeUInt32BE(server.ipaddr))
      buffer.write(2,
        b => b.writeUInt16LE(server.port))
      buffer.write(4)
    })

    return buffer.buffer
  }

  static deserialize (buffer: Buffer): RegionInfo {
    const regionInfo: Partial<RegionInfo> = {}

    const bufferReader = new BufferReader(buffer)
    bufferReader.read(4, b => { regionInfo.header = b.readUInt32LE() })

    const nameBuffer: Partial<NameBuffer> = {}
    bufferReader.read(1, b => { nameBuffer.length = b.readUInt8() })
    bufferReader.read(nameBuffer.length as number, b => { nameBuffer.name = b.toString() })
    regionInfo.nameBuffer = nameBuffer as NameBuffer

    const pingIp: Partial<IpAddressBuffer> = {}
    bufferReader.read(1, b => { pingIp.length = b.readUInt8() })
    bufferReader.read(pingIp.length as number, b => { pingIp.ipaddr = b.toString() })
    regionInfo.pingIp = pingIp as IpAddressBuffer

    bufferReader.read(4, b => { regionInfo.serverCount = b.readUInt32LE() })
    regionInfo.serverInfo = []

    if (typeof regionInfo.serverCount === 'number') {
      for (let i = 0; i < regionInfo.serverCount; i++) {
        const serverInfo: Partial<ServerRegionInfo> = {}

        const serverNameBuffer: Partial<NameBuffer> = {}
        bufferReader.read(1, b => { serverNameBuffer.length = b.readUInt8() })
        bufferReader.read(serverNameBuffer.length as number, b => { serverNameBuffer.name = b.toString() })
        serverInfo.nameBuffer = serverNameBuffer as NameBuffer

        bufferReader.read(4, b => { serverInfo.ipaddr = b.readUInt32BE() })
        bufferReader.read(2, b => { serverInfo.port = b.readUInt16LE() })
        bufferReader.read(4)

        regionInfo.serverInfo.push(serverInfo as ServerRegionInfo)
      }
    }
    return regionInfo as RegionInfo
  }
}

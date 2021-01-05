import ModMetadata from '@/electronMain/models/modMetadata'

const nativeparser = require('@nuclearpowered/dropship-native-addon')

export function getModMetadata (file: string): ModMetadata {
  return nativeparser.parse(file)
}

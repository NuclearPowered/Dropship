import ModMetadata from '@/electronMain/models/modMetadata'

import nativeparser from '@nuclearpowered/dropship-native-addon'

export function getModMetadata (file: string): ModMetadata {
  return nativeparser.parse(file)
}

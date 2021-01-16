import ModMetadata from '@/electronMain/models/modMetadata'
import nativeparser from '@nuclearpowered/dropship-native-addon'

require('hazardous') // overload path.join() to use app.asar.unpacked
export function getModMetadata (file: string): ModMetadata {
  return nativeparser.parse(file)
}

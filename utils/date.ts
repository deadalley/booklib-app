import dayjs, { type ConfigType } from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

export function toSimpleDate(date: ConfigType) {
  return dayjs(date).format('YYYY-MM-DD')
}

export function toDefaultDate(date: ConfigType) {
  return dayjs(date).format('L')
}

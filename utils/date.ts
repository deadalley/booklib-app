import dayjs, { type ConfigType, type OpUnitType } from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

export function toSimpleDate(date: ConfigType) {
  return dayjs(date).format('YYYY-MM-DD')
}

export function toDefaultDate(date: ConfigType) {
  return dayjs(date).format('L')
}

export function getDateRange(
  date: ConfigType,
  range: OpUnitType,
): { start: string; end: string } {
  return {
    start: dayjs(date).startOf(range).toISOString(),
    end: dayjs(date).endOf(range).toISOString(),
  }
}

export function getSixMonthsRange(date: ConfigType): {
  start: string
  end: string
} {
  return {
    start: dayjs(date).toISOString(),
    end: dayjs(date).add(6, 'month').toISOString(),
  }
}

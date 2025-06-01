import dayjs, { type ConfigType, type OpUnitType } from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

export function toSimpleDate(date: ConfigType) {
  return dayjs(date).format('YYYY-MM-DD')
}

export function toDefaultDate(date: ConfigType) {
  return dayjs(date).format('L')
}

export function toFullDate(date: ConfigType) {
  return dayjs(date).format('LL')
}

export function toFullDateCompact(date: ConfigType) {
  return dayjs(date).format('ll')
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

export function getElapsedTimePercentage(
  date: ConfigType,
  { start, end }: { start: ConfigType; end: ConfigType },
): number {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  const currentDate = dayjs(date)

  if (currentDate.isBefore(startDate)) {
    return 0
  }
  if (currentDate.isAfter(endDate)) {
    return 100
  }

  const totalDuration = endDate.diff(startDate)
  const elapsedDuration = currentDate.diff(startDate)

  return (elapsedDuration / totalDuration) * 100
}

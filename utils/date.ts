import dayjs, {
  type ConfigType,
  type ManipulateType,
  type OpUnitType,
} from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

const userTimezone = dayjs.tz.guess()
console.log(userTimezone)

export function toSimpleDate(date: ConfigType) {
  return dayjs.tz(date, userTimezone).format('YYYY-MM-DD')
}

export function toDefaultDate(date: ConfigType) {
  return dayjs.tz(date, userTimezone).format('L')
}

export function toFullDate(date: ConfigType) {
  return dayjs.tz(date, userTimezone).format('LL')
}

export function toFullDateCompact(date: ConfigType) {
  return dayjs.tz(date, userTimezone).format('ll')
}

export function getDateRange(
  date: ConfigType,
  range: OpUnitType,
): { start: string; end: string } {
  return {
    start: dayjs.tz(date, userTimezone).startOf(range).toISOString(),
    end: dayjs.tz(date, userTimezone).endOf(range).toISOString(),
  }
}

export function getSixMonthsRange(date: ConfigType): {
  start: string
  end: string
} {
  return {
    start: dayjs.tz(date, userTimezone).toISOString(),
    end: dayjs.tz(date, userTimezone).add(6, 'month').toISOString(),
  }
}

export function getElapsedTimePercentage(
  date: ConfigType,
  { start, end }: { start: ConfigType; end: ConfigType },
): number {
  const startDate = dayjs.tz(start, userTimezone)
  const endDate = dayjs.tz(end, userTimezone)
  const currentDate = dayjs.tz(date, userTimezone)

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

export function getDatesInInterval(
  interval: { start: ConfigType; end: ConfigType },
  unit: ManipulateType,
): string[] {
  const dates: string[] = []
  let current = dayjs.tz(interval.start, userTimezone).startOf(unit)
  const end = dayjs.tz(interval.end, userTimezone)

  while (current.isBefore(end) || current.isSame(end, unit)) {
    dates.push(current.toISOString())
    current = current.add(1, unit)
  }

  return dates
}

export function isSameDay(date1: ConfigType, date2: ConfigType): boolean {
  return dayjs
    .tz(date1, userTimezone)
    .isSame(dayjs.tz(date2, userTimezone), 'day')
}

export function isBeforeDay(date1: ConfigType, date2: ConfigType): boolean {
  return dayjs
    .tz(date1, userTimezone)
    .isBefore(dayjs.tz(date2, userTimezone), 'day')
}

export function toStartOfDay(date: ConfigType): string {
  return dayjs.tz(date, userTimezone).utc().startOf('day').toISOString()
}

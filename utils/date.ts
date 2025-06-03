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

export function now() {
  return dayjs().utc().toISOString()
}

export function getCurrentYear() {
  return dayjs().utc().year()
}

export function fromSimpleDate(date: string) {
  return dayjs(date, 'YYYY-MM-DD').utc(true).toISOString()
}

export function toISOString(date: ConfigType) {
  return dayjs(date).utc().toISOString()
}

export function toSimpleDate(date: ConfigType) {
  return dayjs(date).utc().format('YYYY-MM-DD')
}

export function toDefaultDate(date: ConfigType) {
  return dayjs(date).utc().format('L')
}

export function toFullDate(date: ConfigType) {
  return dayjs(date).utc().format('LL')
}

export function toFullDateCompact(date: ConfigType) {
  return dayjs(date).utc().format('ll')
}

export function getDateRange(
  date: ConfigType,
  range: OpUnitType,
): { start: string; end: string } {
  return {
    start: dayjs(date).utc().startOf(range).toISOString(),
    end: dayjs(date).utc().endOf(range).toISOString(),
  }
}

export function getSixMonthsRange(date: ConfigType): {
  start: string
  end: string
} {
  return {
    start: dayjs(date).utc().toISOString(),
    end: dayjs(date).utc().add(6, 'month').toISOString(),
  }
}

export function getElapsedTimePercentage(
  date: ConfigType,
  { start, end }: { start: ConfigType; end: ConfigType },
): number {
  const startDate = dayjs(start).utc()
  const endDate = dayjs(end).utc()
  const currentDate = dayjs(date).utc()

  if (currentDate.isBefore(startDate)) {
    return 0
  }
  if (currentDate.isAfter(endDate)) {
    return 100
  }

  const totalDuration = endDate.diff(startDate)
  const elapsedDuration = currentDate.diff(startDate)

  return Math.round((elapsedDuration / totalDuration) * 100)
}

export function getDatesInInterval(
  interval: { start: ConfigType; end: ConfigType },
  unit: ManipulateType,
): string[] {
  const dates: string[] = []
  let current = dayjs(interval.start).utc().startOf(unit)
  const end = dayjs(interval.end).utc()

  while (current.isBefore(end) || current.isSame(end, unit)) {
    dates.push(current.toISOString())
    current = current.add(1, unit)
  }

  return dates
}

export function isSameDay(date1: ConfigType, date2: ConfigType): boolean {
  return dayjs(date1).utc().isSame(dayjs(date2).utc(), 'day')
}

export function isBeforeDay(date1: ConfigType, date2: ConfigType): boolean {
  return dayjs(date1).utc().isBefore(dayjs(date2).utc(), 'day')
}

export function toStartOfDay(date: ConfigType): string {
  return dayjs(date).utc().startOf('day').toISOString()
}

export function getIntervalUnit({
  start,
  end,
}: {
  start: ConfigType
  end: ConfigType
}): ManipulateType {
  const startDate = dayjs(start).utc()
  const endDate = dayjs(end).utc()

  if (startDate.isSame(endDate, 'month')) {
    return 'day'
  }

  return 'month'
}

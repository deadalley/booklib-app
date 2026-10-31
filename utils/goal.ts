import dayjs from 'dayjs'
import { sum } from 'ramda'
import type { Book } from '~/types/book'
import type {
  Goal,
  GoalDisplayStatus,
  GoalPeriod,
  GoalPeriodUnit,
} from '~/types/goal'
import { GOAL_INTERVAL_MAP } from './constants'
import { getElapsedTimePercentage, now, toSimpleDate } from './date'

type GoalEntry = Goal['entries'][number]

// Dates are compared as UTC calendar days ("YYYY-MM-DD")
function dayKey(date: string): string {
  return toSimpleDate(date)
}

function todayKey(): string {
  return toSimpleDate(now())
}

function day(key: string) {
  return dayjs.utc(key)
}

function daysBetween(from: string, to: string): number {
  return day(to).diff(day(from), 'day')
}

function addDays(key: string, days: number): string {
  return day(key).add(days, 'day').format('YYYY-MM-DD')
}

export function getGoalProgressColor(
  goal: Goal,
  type: 'bg' | 'text',
): string | undefined {
  const goalStatus = getGoalStatus(goal)
  if (goalStatus === 'not-tracking' || goalStatus === 'expired') {
    // bg-ink-muted text-ink-muted
    return `${type}-stroke`
  }

  // bg-primary text-primary
  if (goalStatus === 'tracking') {
    return `${type}-primary`
  }

  // bg-stroke text-stroke
  if (goalStatus === 'completed') {
    return `${type}-ink-muted`
  }

  return undefined
}

export function getGoalUnit(goal: Pick<Goal, 'type'>, value: number): string {
  switch (goal.type) {
    case 'books':
      return value === 1 ? 'book' : 'books'
    case 'pages':
      return value === 1 ? 'page' : 'pages'
    case 'hours':
      return value === 1 ? 'hour' : 'hours'
  }
}

export function getGoalEntryValue(goal: Goal, entry: GoalEntry): number {
  switch (goal.type) {
    case 'books':
      return 1
    case 'pages':
      return +(entry as { pages: number }).pages || 0
    case 'hours':
      return +(entry as { hours: number }).hours || 0
  }
}

export function getGoalProgress(goal: Goal): number {
  return sum(goal.entries.map((entry) => getGoalEntryValue(goal, entry)))
}

export function getGoalProgressPercentage(goal: Goal): number {
  return Math.round((getGoalProgress(goal) / goal.amount) * 100)
}

export function getGoalTimeProgressPercentage(goal: Goal): number {
  return getElapsedTimePercentage(now(), {
    start: goal.startAt,
    end: goal.finishAt,
  })
}

export function getGoalStatus(
  goal: Goal,
  today = todayKey(),
): GoalDisplayStatus {
  const progress = getGoalProgress(goal)

  if (today > dayKey(goal.finishAt)) {
    return progress >= goal.amount ? 'completed' : 'expired'
  }

  if (goal.interval === 'total' && progress >= goal.amount) {
    return 'completed'
  }

  return goal.status || 'not-tracking'
}

export const GOAL_STATUS_LABELS: Record<GoalDisplayStatus, string> = {
  tracking: 'Active',
  'not-tracking': 'Paused',
  completed: 'Finished',
  expired: 'Expired',
}

export function getGoalStatusLabel(goal: Goal): string {
  return GOAL_STATUS_LABELS[getGoalStatus(goal)]
}

export function isGoalCompleted(goal: Goal): boolean {
  return getGoalStatus(goal) === 'completed'
}

export function isGoalExpired(goal: Goal): boolean {
  return getGoalStatus(goal) === 'expired'
}

export function getGoalPeriodUnit(goal: Goal): GoalPeriodUnit | undefined {
  return GOAL_INTERVAL_MAP[goal.interval].unit
}

/**
 * Splits the goal window into days, 7-day weeks counted from the start,
 * calendar months or calendar years, and sums the entries in each.
 */
export function getGoalPeriods(goal: Goal): GoalPeriod[] {
  const unit = getGoalPeriodUnit(goal) ?? 'day'
  const start = dayKey(goal.startAt)
  const end = dayKey(goal.finishAt)
  const periods: GoalPeriod[] = []

  let current = start
  while (current <= end && periods.length < 400) {
    let next: dayjs.Dayjs
    if (unit === 'day') next = day(current).add(1, 'day')
    else if (unit === 'week') next = day(current).add(7, 'day')
    else next = day(current).startOf(unit).add(1, unit)

    const nextKey = next.format('YYYY-MM-DD')
    const periodEnd = addDays(nextKey, -1)
    periods.push({
      start: current,
      end: periodEnd < end ? periodEnd : end,
      value: 0,
    })
    current = nextKey
  }

  goal.entries.forEach((entry) => {
    const key = dayKey(entry.createdAt)
    const period = periods.find(({ start, end }) => key >= start && key <= end)
    if (period) period.value += getGoalEntryValue(goal, entry)
  })

  return periods
}

export type GoalInfo = {
  status: GoalDisplayStatus
  progress: number
  pct: number
  timeFrac: number
  daysLeft: number
  started: boolean
  // total goals: progress minus where an even pace would be
  paceOffset: number
  periods: GoalPeriod[]
  current?: GoalPeriod
  hit: number
  counted: number
  streak: number
}

export function getGoalInfo(goal: Goal, today = todayKey()): GoalInfo {
  const start = dayKey(goal.startAt)
  const end = dayKey(goal.finishAt)
  const totalDays = daysBetween(start, end) + 1
  const elapsedDays = Math.max(
    0,
    Math.min(totalDays, daysBetween(start, today) + 1),
  )
  const timeFrac = totalDays > 0 ? elapsedDays / totalDays : 1
  const daysLeft =
    today > end ? 0 : Math.min(totalDays, daysBetween(today, end) + 1)
  const status = getGoalStatus(goal, today)
  const progress = getGoalProgress(goal)
  const started = today >= start

  if (goal.interval === 'total') {
    return {
      status,
      progress,
      pct: goal.amount
        ? Math.min(100, Math.round((progress / goal.amount) * 100))
        : 0,
      timeFrac,
      daysLeft,
      started,
      paceOffset: Math.round(progress - goal.amount * timeFrac),
      periods: [],
      hit: 0,
      counted: 0,
      streak: 0,
    }
  }

  const periods = getGoalPeriods(goal)
  const past = periods.filter((period) => period.end < today)
  const current = periods.find(
    (period) => today >= period.start && today <= period.end,
  )
  const currentMet = !!current && current.value >= goal.amount
  const hit =
    past.filter((period) => period.value >= goal.amount).length +
    (currentMet ? 1 : 0)
  const counted = past.length + (currentMet ? 1 : 0)

  let streak = 0
  for (let index = periods.length - 1; index >= 0; index--) {
    const period = periods[index]!
    if (period.start > today) continue
    if (period === current && !currentMet) continue
    if (period.value >= goal.amount) streak++
    else break
  }

  return {
    status,
    progress,
    pct: current
      ? Math.min(100, Math.round((current.value / goal.amount) * 100))
      : Math.round((hit / Math.max(1, counted)) * 100),
    timeFrac,
    daysLeft,
    started,
    paceOffset: 0,
    periods,
    current,
    hit,
    counted,
    streak,
  }
}

/**
 * The active book goal counted in total whose window contains today; the
 * longest one wins when several qualify.
 */
export function getFeaturedGoal(
  goals: Goal[],
  today = todayKey(),
): Goal | null {
  const span = (goal: Goal) =>
    daysBetween(dayKey(goal.startAt), dayKey(goal.finishAt))

  return (
    goals
      .filter(
        (goal) =>
          goal.type === 'books' &&
          goal.interval === 'total' &&
          getGoalStatus(goal, today) === 'tracking' &&
          dayKey(goal.startAt) <= today &&
          dayKey(goal.finishAt) >= today,
      )
      .sort((a, b) => span(b) - span(a))[0] ?? null
  )
}

export function getGoalPaceUnit(goal: Goal): 'day' | 'week' | 'month' {
  const span = daysBetween(dayKey(goal.startAt), dayKey(goal.finishAt))
  if (span > 120) return 'month'
  if (span > 21) return 'week'
  return 'day'
}

const PACE_UNIT_DAYS = { day: 1, week: 7, month: 30.44 }

export function roundGoalRate(value: number): number {
  return value < 10 ? Math.round(value * 10) / 10 : Math.round(value)
}

export function getGoalRequiredRate(
  goal: Goal,
  info: GoalInfo,
): { unit: 'day' | 'week' | 'month'; value: number } | null {
  const left = Math.max(0, goal.amount - info.progress)
  if (!left || info.status !== 'tracking') return null

  const unit = getGoalPaceUnit(goal)
  const periodsLeft = Math.max(1, info.daysLeft / PACE_UNIT_DAYS[unit])

  return { unit, value: roundGoalRate(left / periodsLeft) }
}

function matchesGoalFilters(goal: Goal, book: Book): boolean {
  return (
    (!goal.author || book.author === goal.author) &&
    (!goal.genres?.length ||
      goal.genres.some((genre) => (book.genres ?? []).includes(genre)))
  )
}

function finishedInGoalWindow(goal: Goal, book: Book): boolean {
  if (book.progress.status !== 'read' || !book.progress.finishedAt) return false
  const finished = dayKey(book.progress.finishedAt)
  return finished >= dayKey(goal.startAt) && finished <= dayKey(goal.finishAt)
}

/** Read books finished in the goal window that match its author and genres. */
export function getGoalFinishedBooks<B extends Book>(
  goal: Goal,
  books: B[],
): B[] {
  return books.filter(
    (book) =>
      finishedInGoalWindow(goal, book) && matchesGoalFilters(goal, book),
  )
}

/** Adds virtual entries for books counted automatically by the goal. */
export function resolveGoal(goal: Goal, books: Book[]): Goal {
  if (goal.type !== 'books' || !goal.auto) return goal

  const manual = goal.entries.filter((entry) => !entry.auto)
  const logged = new Set(manual.map((entry) => entry.book))
  const auto = getGoalFinishedBooks(goal, books)
    .filter((book) => !logged.has(book.id))
    .map((book) => ({
      id: `auto-${book.id}`,
      book: book.id,
      createdAt: book.progress.finishedAt!,
      auto: true,
    }))

  return { ...goal, entries: [...manual, ...auto] }
}

export function stripAutoEntries(goal: Goal): Goal {
  if (goal.type !== 'books') return goal
  return { ...goal, entries: goal.entries.filter((entry) => !entry.auto) }
}

/** Finished books a manual book goal hasn't logged yet. */
export function getUnloggedGoalBooks<B extends Book>(
  goal: Goal,
  books: B[],
): B[] {
  if (goal.type !== 'books' || goal.auto) return []
  const logged = new Set(goal.entries.map((entry) => entry.book))
  return getGoalFinishedBooks(goal, books).filter(
    (book) => !logged.has(book.id),
  )
}

export type GoalRangePreset =
  | 'currentYear'
  | 'nextYear'
  | 'halfYear'
  | 'month'
  | 'nextMonth'
  | 'week'

export function getGoalRangePreset(
  preset: GoalRangePreset,
  today = todayKey(),
): [string, string] {
  const t = day(today)
  const format = (d: dayjs.Dayjs) => d.format('YYYY-MM-DD')

  switch (preset) {
    case 'currentYear':
      return [format(t.startOf('year')), format(t.endOf('year'))]
    case 'nextYear': {
      const next = t.add(1, 'year')
      return [format(next.startOf('year')), format(next.endOf('year'))]
    }
    case 'halfYear':
      return [today, format(t.add(6, 'month').subtract(1, 'day'))]
    case 'month':
      return [format(t.startOf('month')), format(t.endOf('month'))]
    case 'nextMonth': {
      const next = t.add(1, 'month')
      return [format(next.startOf('month')), format(next.endOf('month'))]
    }
    case 'week':
      return [format(t.startOf('week')), format(t.endOf('week'))]
  }
}

/**
 * A copy of a finished or expired goal for the next period: full calendar
 * years move to the next year, other spans move forward by their own length
 * until the window ends after today. Entries are cleared.
 */
export function getRepeatedGoal(goal: Goal, today = todayKey()): Goal {
  const start = dayKey(goal.startAt)
  const end = dayKey(goal.finishAt)
  const fullYear =
    start.slice(5) === '01-01' &&
    end.slice(5) === '12-31' &&
    start.slice(0, 4) === end.slice(0, 4)

  let nextStart: string
  let nextEnd: string
  let title = goal.title

  if (fullYear) {
    const year = Math.max(day(today).year(), day(end).year() + 1)
    nextStart = `${year}-01-01`
    nextEnd = `${year}-12-31`
    title = title.replace(/\d{4}/, String(year))
  } else {
    const span = daysBetween(start, end)
    nextStart = addDays(end, 1)
    while (addDays(nextStart, span) < today) {
      nextStart = addDays(nextStart, span + 1)
    }
    nextEnd = addDays(nextStart, span)
  }

  return {
    ...stripAutoEntries(goal),
    title,
    startAt: nextStart,
    finishAt: nextEnd,
    status: 'tracking',
    completedAt: null,
    entries: [],
  } as Goal
}

export function formatGoalDate(date: string, withYear = true): string {
  return day(dayKey(date)).format(withYear ? 'MMM D, YYYY' : 'MMM D')
}

export function formatGoalRange(start: string, finish: string): string {
  const sameYear = dayKey(start).slice(0, 4) === dayKey(finish).slice(0, 4)
  return `${formatGoalDate(start, !sameYear)} – ${formatGoalDate(finish)}`
}

export function formatGoalNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

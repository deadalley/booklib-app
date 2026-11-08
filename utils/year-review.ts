import dayjs from 'dayjs'
import type { Book } from '~/types/book'
import type { ChallengeLevel, Goal, GoalDisplayStatus } from '~/types/goal'
import { getBookFinishedAt } from './book-progress'
import { getChallengeLevel } from './challenges'
import { todaySimpleDate, toSimpleDate } from './date'
import {
  getGoalEntryValue,
  getGoalInfo,
  getGoalPeriodUnit,
  getGoalUnit,
  resolveGoal,
  type GoalInfo,
} from './goal'

/*
 * Year in Review: everything is derived from what the library already stores
 * (finish dates, page logs, notes, goals). Nothing here is persisted.
 */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// Monday first, as the heatmap rows
export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const yearOf = (date: string) => Number(toSimpleDate(date).slice(0, 4))

function finishDay(book: Book): string | null {
  const finishedAt = getBookFinishedAt(book)
  return finishedAt ? toSimpleDate(finishedAt) : null
}

/** Pages read per day for one book: each log's increase over the last one. */
function bookPageLogs(book: Book): { day: string; pages: number }[] {
  const logs = (book.progress.notes ?? [])
    .filter((note) => typeof note.page === 'number' && !!note.createdAt)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))

  let previous = 0
  return logs.map((note) => {
    const page = note.page!
    const pages = Math.max(0, page - previous)
    previous = page
    return { day: toSimpleDate(note.createdAt), pages }
  })
}

/** Days with logged pages or a finished book, with the pages logged that day. */
export function getReadingDays(books: Book[], year: number) {
  const days = new Map<string, number>()
  books.forEach((book) => {
    bookPageLogs(book).forEach(({ day, pages }) => {
      if (pages > 0 && yearOf(day) === year) {
        days.set(day, (days.get(day) ?? 0) + pages)
      }
    })
    const finished = finishDay(book)
    if (finished && yearOf(finished) === year && !days.has(finished)) {
      days.set(finished, 0)
    }
  })
  return days
}

export function getLongestStreak(days: Iterable<string>): number {
  const sorted = [...days].sort()
  let best = 0
  let run = 0
  let previous: string | null = null
  sorted.forEach((day) => {
    const consecutive =
      previous !== null && dayjs.utc(day).diff(dayjs.utc(previous), 'day') === 1
    run = consecutive ? run + 1 : 1
    best = Math.max(best, run)
    previous = day
  })
  return best
}

/** Intensity 1–3 relative to the busiest day; finish-only days are 1. */
export function getDayLevel(pages: number, maxPages: number): 1 | 2 | 3 {
  if (!pages || !maxPages) return 1
  const ratio = pages / maxPages
  if (ratio > 2 / 3) return 3
  if (ratio > 1 / 3) return 2
  return 1
}

export type YearTotals = {
  books: number
  pages: number
  days: number
  streak: number
}

function finishedInYear(books: Book[], year: number): Book[] {
  return books
    .filter((book) => {
      const day = finishDay(book)
      return !!day && yearOf(day) === year
    })
    .sort((a, b) => finishDay(a)!.localeCompare(finishDay(b)!))
}

function pagesLogged(books: Book[], year: number): number {
  return books.reduce(
    (total, book) =>
      total +
      bookPageLogs(book)
        .filter(({ day }) => yearOf(day) === year)
        .reduce((sum, { pages }) => sum + pages, 0),
    0,
  )
}

export function getYearTotals(books: Book[], year: number): YearTotals {
  const days = getReadingDays(books, year)
  return {
    books: finishedInYear(books, year).length,
    pages: pagesLogged(books, year),
    days: days.size,
    streak: getLongestStreak(days.keys()),
  }
}

/** Years with any finished book or page log, plus the current year. */
export function getReviewYears(
  books: Book[],
  today = todaySimpleDate(),
): number[] {
  const years = new Set<number>([Number(today.slice(0, 4))])
  books.forEach((book) => {
    const finished = finishDay(book)
    if (finished) years.add(yearOf(finished))
    bookPageLogs(book).forEach(({ day, pages }) => {
      if (pages > 0) years.add(yearOf(day))
    })
  })
  return [...years].sort((a, b) => b - a)
}

export type YearGoalRow = {
  goal: Goal
  info: GoalInfo
  status: GoalDisplayStatus
  pct: number
  detail: string
  // Completed goals: the day the target was reached
  completedOn: string | null
  challengeLevel: ChallengeLevel | null
}

function goalCompletedOn(goal: Goal): string | null {
  if (goal.completedAt) return toSimpleDate(goal.completedAt)
  if (goal.interval !== 'total') return toSimpleDate(goal.finishAt)
  let total = 0
  const entries = [...goal.entries].sort((a, b) =>
    toSimpleDate(a.createdAt).localeCompare(toSimpleDate(b.createdAt)),
  )
  for (const entry of entries) {
    total += getGoalEntryValue(goal, entry)
    if (total >= goal.amount) return toSimpleDate(entry.createdAt)
  }
  return null
}

const formatNumber = (value: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: 1 })

function goalDetail(goal: Goal, info: GoalInfo): string {
  if (goal.interval === 'total') {
    return `${formatNumber(info.progress)} of ${formatNumber(goal.amount)} ${getGoalUnit(goal, goal.amount)}`
  }
  const unit = getGoalPeriodUnit(goal) ?? 'day'
  if (info.current) {
    const current = unit === 'day' ? 'today' : `this ${unit}`
    return `${formatNumber(info.current.value)} of ${formatNumber(goal.amount)} ${getGoalUnit(goal, goal.amount)} ${current}`
  }
  return `${info.hit} of ${info.periods.length} ${unit}s on target`
}

const GOAL_ORDER: Record<GoalDisplayStatus, number> = {
  completed: 0,
  tracking: 1,
  'not-tracking': 2,
  expired: 3,
}

/** Goals whose window overlaps the year, completed ones first. */
export function getYearGoals(
  goals: Goal[],
  books: Book[],
  year: number,
  today = todaySimpleDate(),
): YearGoalRow[] {
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  return goals
    .filter(
      (goal) =>
        toSimpleDate(goal.startAt) <= end &&
        toSimpleDate(goal.finishAt) >= start,
    )
    .map((raw) => {
      const goal = resolveGoal(raw, books)
      const info = getGoalInfo(goal, today)
      const completed = info.status === 'completed'
      return {
        goal,
        info,
        status: info.status,
        pct: completed ? 100 : info.pct,
        detail: goalDetail(goal, info),
        completedOn: completed ? goalCompletedOn(goal) : null,
        challengeLevel: goal.challenge ? getChallengeLevel(goal) : null,
      }
    })
    .sort(
      (a, b) =>
        GOAL_ORDER[a.status] - GOAL_ORDER[b.status] ||
        (a.completedOn ?? toSimpleDate(a.goal.finishAt)).localeCompare(
          b.completedOn ?? toSimpleDate(b.goal.finishAt),
        ),
    )
}

export type YearInsight = {
  big: string
  chip: string
  headline: string
  sub: string
}

export type CountItem = { label: string; value: number }

function tally(values: string[]): CountItem[] {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

const plural = (count: number, one: string, many = `${one}s`) =>
  `${formatNumber(count)} ${count === 1 ? one : many}`

export type YearReview = ReturnType<typeof getYearReview>

export function getYearReview(
  year: number,
  books: Book[],
  goals: Goal[],
  authorName: (id: string | null) => string,
  today = todaySimpleDate(),
) {
  const currentYear = Number(today.slice(0, 4))
  const isCurrent = year === currentYear
  const previousYear = year - 1

  const finished = finishedInYear(books, year)
  const days = getReadingDays(books, year)
  const hasLogs = [...days.values()].some((pages) => pages > 0)
  const totals = getYearTotals(books, year)
  const previous = getYearTotals(books, previousYear)
  const hasActivity = finished.length > 0 || hasLogs

  // Before this year: what counts as "new"
  const finishedBefore = books.filter((book) => {
    const day = finishDay(book)
    return !!day && yearOf(day) < year
  })

  const monthFinished = Array.from({ length: 12 }, () => 0)
  finished.forEach(
    (book) => monthFinished[dayjs.utc(finishDay(book)!).month()]!++,
  )

  const weekdayDays = Array.from({ length: 7 }, () => 0)
  days.forEach((_, day) => weekdayDays[(dayjs.utc(day).day() + 6) % 7]!++)

  // Started, finished, set aside
  const yearEnd = `${year}-12-31`
  const started = books.filter(
    (book) =>
      !!book.progress.startedAt && yearOf(book.progress.startedAt) === year,
  )
  const didNotFinish = books.filter(
    (book) =>
      book.progress.status === 'not-finished' &&
      !!book.progress.finishedAt &&
      yearOf(book.progress.finishedAt) === year,
  )
  const stillReading = books.filter((book) => {
    const { status, startedAt, finishedAt } = book.progress
    if (!status || !startedAt || toSimpleDate(startedAt) > yearEnd) return false
    if (isCurrent) return status === 'reading' || status === 'paused'
    // Past years: started by the end of the year, finished (or not) after it
    const ended =
      finishDay(book) ?? (finishedAt ? toSimpleDate(finishedAt) : null)
    return !ended || ended > yearEnd
  })

  // Top books: by rating, ties by length; by length when nothing is rated
  const rated = finished.some((book) => book.rating != null)
  const top = [...finished]
    .sort((a, b) =>
      rated
        ? (b.rating ?? -1) - (a.rating ?? -1) || (b.pages ?? 0) - (a.pages ?? 0)
        : (b.pages ?? 0) - (a.pages ?? 0),
    )
    .slice(0, 5)

  // Authors & genres
  const earlierAuthors = new Set(
    finishedBefore.map(({ author }) => author).filter(Boolean),
  )
  const yearAuthors = tally(
    finished.map(({ author }) => author).filter((id): id is string => !!id),
  )
  const newAuthors = yearAuthors
    .filter(({ label }) => !earlierAuthors.has(label))
    .map(({ label }) => authorName(label))
  const recurringAuthors = yearAuthors
    .filter(({ value }) => value > 1)
    .map(({ label, value }) => ({ label: authorName(label), value }))
  const earlierGenres = new Set(
    finishedBefore.flatMap(({ genres }) => genres ?? []),
  )
  const genres = tally(finished.flatMap(({ genres }) => genres ?? []))
  const newGenres = genres
    .filter(({ label }) => !earlierGenres.has(label))
    .map(({ label }) => label)
  const topGenres = genres.slice(0, 4)

  // Notes written this year (log entries with text)
  const notes = books
    .flatMap((book) =>
      (book.progress.notes ?? [])
        .filter(
          (note) =>
            !!note.content?.trim() &&
            !!note.createdAt &&
            yearOf(note.createdAt) === year,
        )
        .map((note) => ({ book, note })),
    )
    .sort((a, b) => Date.parse(b.note.createdAt) - Date.parse(a.note.createdAt))
  const notesByBook = tally(notes.map(({ book }) => book.id))
  const mostNoted = notesByBook[0]
    ? {
        book: books.find(({ id }) => id === notesByBook[0]!.label)!,
        count: notesByBook[0].value,
      }
    : null

  // Goals & challenges
  const yearGoals = getYearGoals(goals, books, year, today)
  const previousGoalsReached = getYearGoals(
    goals,
    books,
    previousYear,
    today,
  ).filter(({ status }) => status === 'completed').length
  const goalsReached = yearGoals.filter(({ status }) => status === 'completed')
  const challenges = yearGoals.filter(({ goal }) => !!goal.challenge)
  const hoursRead = goals
    .filter((goal) => goal.type === 'hours')
    .flatMap((goal) => goal.entries)
    .filter((entry) => yearOf(entry.createdAt) === year)
    .reduce(
      (total, entry) => total + (+(entry as { hours: number }).hours || 0),
      0,
    )

  // Highlights, shared by the page carousel and the home glimpse
  const insights: YearInsight[] = []
  if (hasActivity) {
    const vs = `vs ${previousYear}`
    const signed = (value: number) =>
      `${value > 0 ? '+' : '−'}${formatNumber(Math.abs(value))}`
    // "1 more book", "3 fewer days"
    const compare = (delta: number, noun: string) => {
      const count = Math.abs(delta)
      const word = count === 1 ? noun.replace(/s$/, '') : noun
      return `${formatNumber(count)} ${delta > 0 ? 'more' : 'fewer'} ${word}`
    }

    const books_ = totals.books - previous.books
    insights.push(
      books_ === 0
        ? {
            big: '=',
            chip: vs,
            headline: `You read as many books as in ${previousYear}`,
            sub: `${plural(totals.books, 'book')}, the same as the year before.`,
          }
        : {
            big: signed(books_),
            chip: vs,
            headline: `You read ${compare(books_, 'books')}`,
            sub: `${plural(totals.books, 'book')} in ${year} versus ${previous.books} in ${previousYear}.`,
          },
    )
    if (hasLogs) {
      const pages = totals.pages - previous.pages
      insights.push(
        pages === 0
          ? {
              big: '=',
              chip: vs,
              headline: `You logged as many pages as in ${previousYear}`,
              sub: `${plural(totals.pages, 'page')}, the same as the year before.`,
            }
          : {
              big: signed(pages),
              chip: vs,
              headline: `You logged ${compare(pages, 'pages')}`,
              sub: `${plural(totals.pages, 'page')} in ${year} versus ${formatNumber(previous.pages)} in ${previousYear}.`,
            },
      )
      const days_ = totals.days - previous.days
      insights.push(
        days_ === 0
          ? {
              big: '=',
              chip: vs,
              headline: `You read on as many days as in ${previousYear}`,
              sub: `${plural(totals.days, 'reading day')}, the same as the year before.`,
            }
          : {
              big: signed(days_),
              chip: vs,
              headline: `You read on ${compare(days_, 'days')}`,
              sub: `${plural(totals.days, 'reading day')} in ${year} versus ${previous.days} in ${previousYear}.`,
            },
      )
    }
    const busiest = Math.max(...monthFinished)
    if (busiest > 0) {
      const month = MONTH_NAMES[monthFinished.indexOf(busiest)]
      insights.push({
        big: String(busiest),
        chip: String(year),
        headline: `${month} was your busiest month`,
        sub: `You read ${plural(busiest, 'book')} in ${month}.`,
      })
    }
    if (hasLogs) {
      const most = Math.max(...weekdayDays)
      const weekday = WEEKDAY_NAMES[weekdayDays.indexOf(most)]!
      insights.push({
        big: weekday.slice(0, 3),
        chip: String(year),
        headline: `${weekday} was your day to read`,
        sub: `${most} of your ${plural(totals.days, 'reading day')} were on a ${weekday}.`,
      })
    }
    if (mostNoted) {
      insights.push({
        big: String(mostNoted.count),
        chip: String(year),
        headline: `You wrote ${plural(mostNoted.count, 'note')} about ${mostNoted.book.title}`,
        sub: `Your most-noted book of ${year}, among ${plural(notes.length, 'note')} in total.`,
      })
    }
    if (yearGoals.length) {
      const reached = goalsReached.length
      const delta = reached - previousGoalsReached
      insights.push({
        big: String(reached),
        chip: vs,
        headline: `You reached ${plural(reached, 'goal')}`,
        sub:
          delta === 0
            ? `As many as in ${previousYear}.`
            : delta > 0
              ? `${delta} more than in ${previousYear}.`
              : `${-delta} fewer than in ${previousYear}.`,
      })
    }
  }

  return {
    year,
    previousYear,
    isCurrent,
    hasActivity,
    hasLogs,
    totals,
    previous,
    finished,
    days,
    monthFinished,
    weekdayDays,
    started,
    didNotFinish,
    stillReading,
    top,
    rankedByRating: rated,
    first: finished[0] ?? null,
    last: finished.length > 1 ? finished.at(-1)! : null,
    newAuthors,
    recurringAuthors,
    newGenres,
    topGenres,
    notes,
    mostNoted,
    goals: yearGoals,
    goalsReached: goalsReached.length,
    challengesTaken: challenges.length,
    challengesCompleted: challenges.filter(
      ({ status }) => status === 'completed',
    ).length,
    hoursRead,
    insights,
  }
}

/** "same as 2025", "vs 2025: +5", "vs 2025: −3" */
export function formatYearDelta(
  current: number,
  previous: number,
  previousYear: number,
): { label: string; direction: 'up' | 'down' | 'same' } {
  const delta = current - previous
  if (delta === 0)
    return { label: `same as ${previousYear}`, direction: 'same' }
  return {
    label: `vs ${previousYear}: ${delta > 0 ? '+' : '−'}${formatNumber(Math.abs(delta))}`,
    direction: delta > 0 ? 'up' : 'down',
  }
}

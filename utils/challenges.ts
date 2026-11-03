import dayjs from 'dayjs'
import type { icons } from '@tabler/icons-vue'
import type { ChallengeLevel, Goal, GoalInterval, GoalType } from '~/types/goal'
import { GOAL_INTERVAL_MAP } from './constants'
import { todaySimpleDate } from './date'
import { getGoalStatus, getGoalUnit } from './goal'

export type ChallengePreset = {
  id: string
  name: string
  description: string
  icon: keyof typeof icons
  level: ChallengeLevel
  type: GoalType
  interval: GoalInterval
  amount: number
  duration: { months: number } | { days: number }
  // Periodic challenges start on the 1st of a month
  alignToMonth?: boolean
  // Book challenges that count finished books automatically
  auto?: boolean
  // Shown on the review step; not validated yet (entries are logged by hand)
  rule?: string
}

export const CHALLENGE_LEVEL_LABELS: Record<ChallengeLevel, string> = {
  1: 'Moderate',
  2: 'Hard',
  3: 'Extreme',
}

export const CHALLENGES: ChallengePreset[] = [
  {
    id: '52-books',
    name: '52 books in a year',
    description:
      'One book every week for a full year. The classic reading marathon.',
    icon: 'IconFlame',
    level: 3,
    type: 'books',
    interval: 'total',
    amount: 52,
    duration: { months: 12 },
    auto: true,
  },
  {
    id: '1000-pages',
    name: '1,000 pages a month',
    description:
      'Around 33 pages every day, month after month, for a full season.',
    icon: 'IconMountain',
    level: 2,
    type: 'pages',
    interval: 'monthly',
    amount: 1000,
    duration: { months: 3 },
    alignToMonth: true,
  },
  {
    id: '100-hours',
    name: '100 hours in 100 days',
    description:
      'An hour of reading a day, every day, for a hundred days straight.',
    icon: 'IconHourglass',
    level: 2,
    type: 'hours',
    interval: 'total',
    amount: 100,
    duration: { days: 100 },
  },
  {
    id: 'decades',
    name: 'A book from every decade',
    description:
      'Ten books, one published in each decade from the 1920s to the 2010s.',
    icon: 'IconHistory',
    level: 2,
    type: 'books',
    interval: 'total',
    amount: 10,
    duration: { months: 12 },
    rule: 'One book per publication decade, 1920s–2010s',
  },
  {
    id: 'translated',
    name: '5 translated books',
    description:
      'Read five books first written in a language other than your own.',
    icon: 'IconLanguage',
    level: 1,
    type: 'books',
    interval: 'total',
    amount: 5,
    duration: { months: 6 },
    rule: 'Only books read in translation count',
  },
  {
    id: '30-day',
    name: '30-day streak',
    description: 'At least 20 pages every single day for a month. No days off.',
    icon: 'IconBolt',
    level: 1,
    type: 'pages',
    interval: 'daily',
    amount: 20,
    duration: { days: 30 },
  },
]

/** One per difficulty, shown on the Goals page call-out */
export const FEATURED_CHALLENGE_IDS = ['30-day', '1000-pages', '52-books']

export function getChallenge(id: string | undefined): ChallengePreset | null {
  return CHALLENGES.find((challenge) => challenge.id === id) ?? null
}

export function getChallengeLevel(goal: Goal): ChallengeLevel {
  return goal.level ?? getChallenge(goal.challenge)?.level ?? 2
}

export function formatChallengeDuration(challenge: ChallengePreset): string {
  if ('months' in challenge.duration) {
    return challenge.duration.months === 12
      ? '1 year'
      : `${challenge.duration.months} months`
  }
  return `${challenge.duration.days} days`
}

/**
 * The preset window as simple dates. Month-aligned challenges start on the
 * 1st of this month during its first week, otherwise on the 1st of the next.
 */
export function getChallengeRange(
  challenge: ChallengePreset,
  today = todaySimpleDate(),
): [string, string] {
  let start = dayjs.utc(today)
  if (challenge.alignToMonth) {
    start =
      start.date() <= 7
        ? start.startOf('month')
        : start.startOf('month').add(1, 'month')
  }

  const end =
    'months' in challenge.duration
      ? start.add(challenge.duration.months, 'month').subtract(1, 'day')
      : start.add(challenge.duration.days - 1, 'day')

  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
}

export type ChallengeTarget = {
  type: GoalType
  interval: GoalInterval
  amount: number
  startAt: string
  finishAt: string
}

const INTERVAL_DAYS: Partial<Record<GoalInterval, number>> = {
  daily: 1,
  weekly: 7,
  monthly: 30.44,
  yearly: 365,
}

/** Units of reading needed per day to meet the target */
export function getChallengeDailyLoad(target: ChallengeTarget): number {
  const per = INTERVAL_DAYS[target.interval]
  if (per) return target.amount / per

  const days =
    dayjs.utc(target.finishAt).diff(dayjs.utc(target.startAt), 'day') + 1
  return target.amount / Math.max(1, days)
}

const round = (value: number) =>
  value < 10 ? Math.round(value * 10) / 10 : Math.round(value)

/** e.g. "≈ 1 book every 7 days", "≈ 45 minutes a day" */
export function getChallengePace(target: ChallengeTarget): string {
  if (target.interval === 'daily') {
    return `${target.amount} ${getGoalUnit(target, target.amount)} every day`
  }

  const load = getChallengeDailyLoad(target)
  if (target.type === 'books') {
    const every = 1 / load
    return every >= 1.5
      ? `≈ 1 book every ${Math.round(every)} days`
      : `≈ ${round(load)} books a day`
  }
  if (target.type === 'hours' && load < 1) {
    return `≈ ${Math.round(load * 60)} minutes a day`
  }
  return `≈ ${round(load)} ${getGoalUnit(target, round(load))} a day`
}

export type ChallengeComparison = 'preset' | 'tougher' | 'easier'

export const CHALLENGE_COMPARISON_LABELS: Record<ChallengeComparison, string> =
  {
    preset: 'Matches the preset',
    tougher: 'Tougher than the preset',
    easier: 'Easier than the preset',
  }

/** Compares daily loads; within ±4% of the preset counts as a match */
export function compareToPreset(
  target: ChallengeTarget,
  preset: ChallengeTarget,
): ChallengeComparison {
  const ratio = getChallengeDailyLoad(target) / getChallengeDailyLoad(preset)
  if (Math.abs(ratio - 1) < 0.04) return 'preset'
  return ratio > 1 ? 'tougher' : 'easier'
}

/** e.g. "books in total", "pages per month" */
export function getChallengeUnitLabel(challenge: ChallengePreset): string {
  return `${getGoalUnit(challenge, 2)} ${GOAL_INTERVAL_MAP[challenge.interval].description}`
}

/** A challenge goal that is still running or paused */
export function isLiveChallenge(goal: Goal): boolean {
  if (!goal.challenge) return false
  const status = getGoalStatus(goal)
  return status === 'tracking' || status === 'not-tracking'
}

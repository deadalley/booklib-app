import { sum } from 'ramda'
import type { Goal } from '~/types/goal'

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

export function getGoalUnit(goal: Goal, value: number): string {
  switch (goal.type) {
    case 'books':
      return value > 1 || value === 0 ? 'books' : 'book'
    case 'pages':
      return value > 1 || value === 0 ? 'pages' : 'page'
    case 'hours':
      return value > 1 || value === 0 ? 'hours' : 'hour'
  }
}

export function getGoalProgress(goal: Goal): number {
  switch (goal.type) {
    case 'books':
      return goal.entries.length
    case 'pages':
      return sum(goal.entries.map((entry) => entry.pages))
    case 'hours':
      return sum(goal.entries.map((entry) => entry.hours))
  }
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
): 'tracking' | 'not-tracking' | 'completed' | 'expired' {
  if (isGoalCompleted(goal)) return 'completed'
  if (isGoalExpired(goal)) return 'expired'
  return goal.status || 'not-tracking'
}

export function getGoalStatusLabel(goal: Goal): string {
  const status = getGoalStatus(goal)
  switch (status) {
    case 'tracking':
      return 'Active'
    case 'completed':
      return 'Finished'
    case 'expired':
      return 'Expired'
    default:
      return 'Inactive'
  }
}

export function isGoalCompleted(goal: Goal): boolean {
  return now() >= goal.finishAt && getGoalProgress(goal) >= goal.amount
}

export function isGoalExpired(goal: Goal): boolean {
  return now() >= goal.finishAt && getGoalProgress(goal) < goal.amount
}

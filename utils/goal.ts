import { sum } from 'ramda'
import type { Goal } from '~/types/goal'

export function getGoalProgressColor(
  status: string,
  type: 'bg' | 'text',
): string | undefined {
  if (status === 'not-tracking' || status === 'expired') {
    return `${type}-ink-muted`
  }

  if (status === 'tracking') {
    return `${type}-primary`
  }

  // bg-primary-200 text-primary-200
  if (status === 'finished') {
    return `${type}-primary-200`
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

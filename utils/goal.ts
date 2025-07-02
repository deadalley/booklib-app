import type { Goal } from '~/types/goal'

export function getGoalProgressColor(
  status: string,
  type: 'bg' | 'text',
): string | undefined {
  console.log(status)
  if (status === 'not-tracking' || status === 'expired') {
    return `${type}-accent-dark`
  }

  if (status === 'tracking') {
    return `${type}-main`
  }

  // bg-main-light text-main-light
  if (status === 'finished') {
    return `${type}-main-light`
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
      return goal.entries.reduce((acc, entry) => acc + entry.pages, 0)
    case 'hours':
      return goal.entries.reduce((acc, entry) => acc + entry.hours, 0)
  }
}

export function getGoalProgressPercentage(goal: Goal): number {
  console.log(getGoalProgress(goal), goal.amount)
  const f = Math.round((getGoalProgress(goal) / goal.amount) * 100)
  console.log(f)
  return f
}

export function getGoalTimeProgressPercentage(goal: Goal): number {
  return getElapsedTimePercentage(now(), {
    start: goal.startAt,
    end: goal.finishAt,
  })
}

import type { Book } from './book'

export type GoalType = 'books' | 'pages' | 'hours'

export type GoalInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total'

export type GoalStatus = 'tracking' | 'not-tracking' | 'finished' | 'expired'

type BookGoalEntry = {
  book: Book['id']
  createdAt: string
}

type PageGoalEntry = {
  pages: number
  createdAt: string
}

type HourGoalEntry = {
  hours: number
  createdAt: string
}

type BookGoal = {
  type: 'books'
  entries: BookGoalEntry[]
}

type PageGoal = {
  type: 'pages'
  entries: PageGoalEntry[]
}

type HourGoal = {
  type: 'hours'
  entries: HourGoalEntry[]
}

export type Goal = (BookGoal | PageGoal | HourGoal) & {
  id: string
  title: string
  interval: GoalInterval
  amount: number
  createdAt: string
  startAt: string
  finishAt: string
  completedAt: string | null
  status: GoalStatus
  author: string | null
  genres: string[]
}

export type ViewGoal = Goal & {
  progress: number
}

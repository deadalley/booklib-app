import type { Book } from './book'

export type GoalType = 'books' | 'pages' | 'hours'

export type GoalInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total'

export type GoalStatus = 'tracking' | 'not-tracking' | 'finished' | 'expired'

export type BookGoalEntry = {
  id: string
  book: Book['id']
  createdAt: string
}

export type PageGoalEntry = {
  id: string
  pages: number
  createdAt: string
}

export type HourGoalEntry = {
  id: string
  hours: number
  createdAt: string
}

export type BookGoal = {
  type: 'books'
  entries: BookGoalEntry[]
}

export type PageGoal = {
  type: 'pages'
  entries: PageGoalEntry[]
}

export type HourGoal = {
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

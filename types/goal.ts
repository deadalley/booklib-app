export type GoalType = 'books' | 'pages' | 'hours'

export type GoalInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total'

export type GoalStatus = 'tracking' | 'not-tracking' | 'finished' | 'expired'

export type Goal = {
  id: string
  title: string
  type: GoalType
  interval: GoalInterval
  amount: number
  createdAt: string
  startedAt: string
  finishedAt: string
  status: GoalStatus
  author: string | null
  genres: string[]
}

export type ViewGoal = Goal & {
  progress: number
}

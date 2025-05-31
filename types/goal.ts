export type GoalType = 'books' | 'pages' | 'hours'

export type GoalInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total'

export type GoalStatus = 'active' | 'completed' | 'expired'

export type Goal = {
  id: string
  title: string
  type: GoalType
  interval: GoalInterval
  amount: number
  startedAt: string
  finishedAt: string
  status: GoalStatus
}

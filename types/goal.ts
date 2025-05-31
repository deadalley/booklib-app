export type GoalType = 'books' | 'pages' | 'hours'

export type Goal = {
  id: string
  title: string
  type: GoalType
  startedAt: string
  finishedAt: string
}

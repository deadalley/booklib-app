import { dbGoalToGoal } from '~/utils'
import { db } from '~/services/db.service'

export default defineEventHandler(async () => {
  const goals = await db.getGoals()

  return (goals ?? [])?.map((g) => dbGoalToGoal(g))
})

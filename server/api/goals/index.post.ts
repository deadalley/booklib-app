import { db } from '~/services/db.service'
import type { GoalDB } from '~/types/database'
import { goalToDbGoal, dbGoalToGoal } from '~/utils'

export default defineEventHandler(async (event) => {
  const goal = await readBody(event)

  const dbGoal: GoalDB = goalToDbGoal(goal)

  const data = await db.createGoal(dbGoal)

  return data && dbGoalToGoal(data)
})

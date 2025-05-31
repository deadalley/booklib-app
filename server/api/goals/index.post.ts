import { db } from '~/services/db.service'
import type { GoalDB } from '~/types/database'
import { v4 as uuidv4 } from 'uuid'
import { goalToDbGoal, dbGoalToGoal } from '~/utils'

export default defineEventHandler(async (event) => {
  const goal = await readBody(event)

  const dbGoal: GoalDB = {
    ...goalToDbGoal(goal),
    id: goal.id ?? uuidv4(),
    created_at: new Date().toISOString(),
  }

  const data = await db.createGoal(dbGoal)

  return data && dbGoalToGoal(data)
})

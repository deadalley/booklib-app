import { db } from '~/services/db.service'

export default defineEventHandler<Promise<string | null>>(async (event) => {
  return db.deleteUser(event)
})

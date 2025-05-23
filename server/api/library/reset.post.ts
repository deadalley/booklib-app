import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  return db.resetLibrary(event)
})

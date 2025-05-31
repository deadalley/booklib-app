import { db } from '~/services/db.service'

export default defineEventHandler(async () => {
  return db.isLibraryEmpty()
})

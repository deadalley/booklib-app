import { dbAuthorToAuthor } from '~/utils'
import { db } from '~/services/db.service'

export default defineEventHandler(async () => {
  const data = await db.getAuthors()

  return (data ?? [])?.map((a) => dbAuthorToAuthor(a))
})

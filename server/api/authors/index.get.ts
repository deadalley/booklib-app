import { dbAuthorToAuthor } from '~/utils'
import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const data = await db.getAuthors(event)

  return (data ?? [])?.map((a) => dbAuthorToAuthor(a))
})

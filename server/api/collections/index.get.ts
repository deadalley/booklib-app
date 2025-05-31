import { db } from '~/services/db.service'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler(async () => {
  const data = await db.getCollections()

  return data.map((collection) =>
    dbCollectionToCollection(collection, collection['collection-book']),
  )
})

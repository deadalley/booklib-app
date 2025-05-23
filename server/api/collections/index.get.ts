import { db } from '~/services/db.service'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler(async (event) => {
  const data = await db.getCollections(event)

  return data.map((collection) =>
    dbCollectionToCollection(collection, collection['collection-book']),
  )
})

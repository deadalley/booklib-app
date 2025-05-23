import { db } from '~/services/db.service'
import type { Collection } from '~/types/collection'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler(async (event) => {
  const collection: Collection = await readBody(event)

  const data = await db.createCollection(event, collection)

  return data && dbCollectionToCollection(data, data['collection-book'])
})

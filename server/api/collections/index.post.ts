import { db } from '~/services/db.service'
import { dbCollectionToCollection } from '~/utils'
import { v4 as uuidv4 } from 'uuid'
import type { CollectionDB } from '~/types/database'

export default defineEventHandler(async (event) => {
  const collection = await readBody(event)

  const collectionDb: CollectionDB = {
    ...collectionToDbCollection(collection),
    id: collection.id ?? uuidv4(),
    created_at: new Date().toISOString(),
  }

  const data = await db.createCollection(event, collectionDb, collection.books)

  return data && dbCollectionToCollection(data, data['collection-book'])
})

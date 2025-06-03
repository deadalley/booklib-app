import { db } from '~/services/db.service'
import {
  collectionToDbCollection,
  dbCollectionToCollection,
  now,
} from '~/utils'
import { v4 as uuidv4 } from 'uuid'
import type { CollectionDB } from '~/types/database'

export default defineEventHandler(async (event) => {
  const collection = await readBody(event)

  const collectionDb: CollectionDB = {
    ...collectionToDbCollection(collection),
    id: collection.id ?? uuidv4(),
    created_at: now(),
  }

  const data = await db.createCollection(collectionDb, collection.books)

  return data && dbCollectionToCollection(data, data['collection-book'])
})

import { db } from '~/services/db.service'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler(async (event) => {
  const collection = await readBody(event)

  const data = await db.createCollection(event, collection)

  return data && dbCollectionToCollection(data, data['collection-book'])
})

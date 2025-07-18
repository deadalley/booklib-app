import type { Database } from '~/types/api'
import { LowDBClient } from './lowdb.service'
import { JSONFilePreset } from 'lowdb/node'
import { DEFAULT_COLLECTIONS_INIT, now } from '~/utils'

if (!process.env.USER_DB_PATH) {
  throw new Error('USER_DB_PATH environment variable is not set.')
}

console.log(`Starting database at: ${process.env.USER_DB_PATH}`)

export function getDbSeed({
  authors = [],
  books = [],
  collections = [],
  collectionBooks = [],
}: {
  authors?: Database['authors']
  books?: Database['books']
  collections?: Database['collections']
  collectionBooks?: Database['collection-book']
}): Database {
  return {
    authors: [...authors],
    books: [...books],
    collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
      ...c,
      created_at: now(),
    })).concat(collections),
    'collection-book': [...collectionBooks],
    goals: [],
  }
}

const client = await JSONFilePreset<Database>(
  process.env.USER_DB_PATH,
  getDbSeed({}),
)

export const db = new LowDBClient(client)

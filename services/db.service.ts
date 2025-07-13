import type { Database } from '~/types/api'
import { LowDBClient } from './lowdb.service'
import { JSONFilePreset } from 'lowdb/node'
import { DEFAULT_COLLECTIONS_INIT, now } from '~/utils'

if (!process.env.USER_DB_PATH) {
  throw new Error('USER_DB_PATH environment variable is not set.')
}

const client = await JSONFilePreset<Database>(process.env.USER_DB_PATH, {
  authors: [],
  books: [],
  collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
    ...c,
    created_at: now(),
  })),
  'collection-book': [],
  goals: [],
})

export const db = new LowDBClient(client)

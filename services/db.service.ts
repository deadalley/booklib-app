import type { Database } from '~/types/api'
import { LowDBClient } from './lowdb.service'
import { JSONFilePreset } from 'lowdb/node'
import { DEFAULT_COLLECTIONS_INIT } from '~/utils'

const client = await JSONFilePreset<Database>('usr/booklib.json', {
  authors: [],
  books: [],
  collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
    ...c,
    created_at: new Date().toISOString(),
  })),
  'collection-book': [],
  goals: [],
})

export const db = new LowDBClient(client)

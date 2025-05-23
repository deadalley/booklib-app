import type { DBClient } from '~/types/api'
// import * as SupabaseDBClient from './supabase.service'
import * as LocalDBClient from './lowdb.service'

export const db: DBClient<string> = LocalDBClient

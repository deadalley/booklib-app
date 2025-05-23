import type { DBClient } from '~/types/api'
import * as SupabaseDBClient from './supabase.service'

export const db: DBClient = SupabaseDBClient

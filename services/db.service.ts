import type { DBClient } from '~/types/api'
import * as LocalDBClient from './lowdb.service'

export const db: DBClient = LocalDBClient

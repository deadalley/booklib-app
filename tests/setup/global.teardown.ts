import { test as teardown } from '@playwright/test'
import { resetDatabase } from './db'

teardown('teardown database', async () => {
  await resetDatabase()
})

import { unlinkSync, existsSync } from 'fs'
import { test as teardown } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

teardown('teardown database', async () => {
  if (!process.env.USER_DB_PATH) {
    throw new Error('USER_DB_PATH environment variable is not set')
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const targetPath = path.join(
    __dirname,
    '..',
    '..',
    './.output',
    process.env.USER_DB_PATH,
  )
  if (existsSync(targetPath)) {
    unlinkSync(targetPath)
  }
})

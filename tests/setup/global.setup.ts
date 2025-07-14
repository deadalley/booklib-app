import { copyFileSync } from 'fs'
import { test as setup } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

setup('setup database', async () => {
  if (!process.env.USER_DB_PATH) {
    throw new Error('USER_DB_PATH environment variable is not set')
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const sourceFile = 'booklib-test-base.json'
  const sourcePath = path.join(__dirname, sourceFile)
  const targetPath1 = path.join(
    __dirname,
    '..',
    '..',
    './.output',
    process.env.USER_DB_PATH,
  )
  const targetPath2 = path.join(__dirname, '..', '..', process.env.USER_DB_PATH)
  copyFileSync(sourcePath, targetPath1)
  copyFileSync(sourcePath, targetPath2)
})

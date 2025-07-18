import { unlinkSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export async function resetDatabase() {
  if (!process.env.USER_DB_PATH) {
    throw new Error('USER_DB_PATH environment variable is not set')
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const targetPath1 = path.join(
    __dirname,
    '..',
    '..',
    './.output',
    process.env.USER_DB_PATH,
  )
  const targetPath2 = path.join(__dirname, '..', '..', process.env.USER_DB_PATH)
  if (existsSync(targetPath1)) {
    unlinkSync(targetPath1)
  }
  if (existsSync(targetPath2)) {
    unlinkSync(targetPath2)
  }
}

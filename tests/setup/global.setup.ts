import { test as setup, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import path from 'path'
import { useBookLibService } from '../../services/data-management'
import type { Database } from '../../types/api'

setup('setup database', async ({ page }) => {
  const testDataPath = path.join(__dirname, 'booklib-test-base.json')
  const testDataContent = readFileSync(testDataPath, 'utf8')

  const data = JSON.parse(testDataContent) as Database

  const service = useBookLibService()

  await service.initialize()
  await service.importLibrary(data)

  const exportedData = await service.exportLibrary()

  await page.goto('/#/tracking')

  expect(exportedData).toEqual(data)
})

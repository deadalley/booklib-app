import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env.test') })

const PORT = 3001
// Set BASE_URL to run against an already running app instead of starting one
const baseURL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`

/**
 * End-to-end tests. Each test seeds its own library into the browser's
 * localStorage (see tests/fixtures.ts), so tests are isolated and can run in
 * parallel. See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.test\.ts$/,
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Optional: use a pre-installed Chromium instead of Playwright's download
    ...(process.env.PW_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } }
      : {}),
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /responsive\.test\.ts/,
    },
    {
      // Viewport sweep (phone → wide desktop); sizes are set per test
      name: 'responsive',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /responsive\.test\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /(library|data-management)\.test\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /responsive\.test\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /responsive\.test\.ts/,
    },
  ],

  /* Start the web app unless BASE_URL points at a running one */
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `cross-env ELECTRON_ENABLED=false nuxt dev --host 127.0.0.1 --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
})

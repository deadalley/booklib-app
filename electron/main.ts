import * as Sentry from '@sentry/electron/main'
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'url'
import { handleFileError } from '../utils/error-handling'
import { logger } from '../utils/logger'

const isDevelopment = process.env.NODE_ENV === 'development'

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  beforeSend(event) {
    if (isDevelopment) {
      logger.debug({ event }, 'Sentry main process event')
    }
    return event
  },
})

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception in main process')
  Sentry.captureException(error)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection in main process')
  Sentry.captureException(reason)
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html
process.env.APP_ROOT = path.join(__dirname, '..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, '.output/public')

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: process.env.NODE_ENV === 'production', // Enable webSecurity in production
    },
    show: false, // Don't show until ready to avoid flash
  })

  // Add debugging for loading events
  if (isDevelopment) {
    win.webContents.on(
      'did-fail-load',
      (event, errorCode, errorDescription, validatedURL) => {
        logger.error(
          { errorCode, errorDescription, validatedURL },
          'Failed to load page',
        )
      },
    )

    win.webContents.on('did-finish-load', () => {
      logger.debug('Page finished loading')
    })

    win.webContents.on(
      'console-message',
      (event, level, message, _line, _sourceId) => {
        logger.debug({ level, message }, 'Console message from renderer')
      },
    )
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    if (isDevelopment) {
      win.webContents.openDevTools()
    }
  } else {
    const vitePublic = process.env.VITE_PUBLIC || RENDERER_DIST
    const htmlPath = path.join(vitePublic, '200.html')
    if (isDevelopment) {
      logger.debug({ htmlPath }, 'Loading file from path')
    }
    win
      .loadFile(htmlPath)
      .then(() => {
        if (isDevelopment) {
          logger.debug('File loaded successfully')
        }
      })
      .catch((error) => {
        logger.error({ error, htmlPath }, 'Failed to load file')
      })
  }

  // Show window when ready
  win.once('ready-to-show', () => {
    win?.show()
    win?.focus()
  })
}

function initIpc() {
  ipcMain.handle('app-start-time', () => new Date().toLocaleString())

  // Database file operations
  ipcMain.handle('db:getPath', () => {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'booklib-data.json')
  })

  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch (error) {
      logger.error({ error, filePath }, 'File read error')
      Sentry.captureException(error)
      throw handleFileError('read', filePath, error)
    }
  })

  ipcMain.handle('file:write', async (_, filePath: string, data: string) => {
    try {
      await fs.writeFile(filePath, data, 'utf-8')
    } catch (error) {
      logger.error({ error, filePath }, 'File write error')
      Sentry.captureException(error)
      throw handleFileError('write', filePath, error)
    }
  })

  ipcMain.handle('file:exists', async (_, filePath: string) => {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('dir:ensure', async (_, dirPath: string) => {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    } catch (error) {
      logger.error({ error, dirPath }, 'Directory creation error')
      Sentry.captureException(error)
      throw handleFileError('ensure', dirPath, error)
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  initIpc()
  createWindow()
})

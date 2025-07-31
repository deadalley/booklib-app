import * as Sentry from '@sentry/electron/main'
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'url'

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry main process event:', event)
    }
    return event
  },
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in main process:', error)
  Sentry.captureException(error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    'Unhandled Rejection in main process at:',
    promise,
    'reason:',
    reason,
  )
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
  win.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        'Failed to load:',
        errorCode,
        errorDescription,
        validatedURL,
      )
    },
  )

  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading')
  })

  win.webContents.on(
    'console-message',
    (event, level, message, _line, _sourceId) => {
      console.log(`Console [${level}]:`, message)
    },
  )

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    const htmlPath = path.join(process.env.VITE_PUBLIC!, '200.html')
    console.log('Loading file from:', htmlPath)
    win
      .loadFile(htmlPath)
      .then(() => {
        console.log('File loaded successfully')
      })
      .catch((error) => {
        console.error('Failed to load file:', error)
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
      console.error('File read error:', error)
      Sentry.captureException(error)
      throw new Error(`Failed to read file: ${error}`)
    }
  })

  ipcMain.handle('file:write', async (_, filePath: string, data: string) => {
    try {
      await fs.writeFile(filePath, data, 'utf-8')
    } catch (error) {
      console.error('File write error:', error)
      Sentry.captureException(error)
      throw new Error(`Failed to write file: ${error}`)
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
      console.error('Directory creation error:', error)
      Sentry.captureException(error)
      throw new Error(`Failed to create directory: ${error}`)
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

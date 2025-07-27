import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'url'

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
      webSecurity: false, // Allow loading local files
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

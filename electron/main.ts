// import { app, BrowserWindow } from 'electron'

// app.whenReady().then(() => {
//   if (process.env.VITE_DEV_SERVER_URL) {
//     new BrowserWindow().loadURL(process.env.VITE_DEV_SERVER_URL)
//   }
// })
// import { app, BrowserWindow } from 'electron'
// import path from 'path'
// import { spawn } from 'child_process'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// function isProduction() {
//   return app.isPackaged
// }

// let mainWindow: BrowserWindow | null = null
// function createWindow() {
//   // Create the browser window
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       nodeIntegration: true,
//     },
//   })
//   // Start frontend
//   const frontPath = getPath()
//   const frontProcess = spawn('node', [frontPath], {
//     detached: true,
//     stdio: 'inherit',
//   })
//   mainWindow.loadURL('http://localhost:3000') // or any other port defined
//   // Handle window closed event properly
//   mainWindow.on('closed', () => {
//     mainWindow = null
//   })
// }
// function getPath() {
//   if (!isProduction()) {
//     return path.join(__dirname, '../', '.output', 'server', 'index.mjs')
//   } else {
//     return path.join(__dirname, '../../', '.output', 'server', 'index.mjs')
//   }
// }

// app.whenReady().then(createWindow)

// function killAllProcesses() {
//     return new Promise((resolve) => {
//         if (!frontProcess) return resolve()

//         const pids = []
//         if (frontProcess && frontProcess.pid) pids.push(frontProcess.pid)

//         if (pids.length === 0) return resolve()

//         let killed = 0
//         pids.forEach(pid => {
//             treeKill(pid, 'SIGKILL', (err) => {
//                 if (!err) console.log(`Killed process ${pid}`)
//                 killed++
//                 if (killed === pids.length) resolve()
//             })
//         })
//     })
// }

// // Unified shutdown handler
// async function handleShutdown() {
//     console.log('Shutting down...')

//     try {
//         await killAllProcesses()

//         // Close window if it exists and isn't destroyed
//         if (mainWindow && !mainWindow.isDestroyed()) {
//             mainWindow.close()
//         }
//     } catch (err) {
//         console.error('Error during shutdown:', err)
//     } finally {
//         app.quit()
//     }
// }

// // Set up signal handlers
// process.on('SIGINT', handleShutdown)
// process.on('SIGTERM', handleShutdown)
// process.on('uncaughtException', (error) => {
//     console.error('Uncaught error:', error)
// })
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         handleShutdown()
//     }
// })

// import { app, BrowserWindow } from 'electron'
// import path from 'path'

// let mainWindow: BrowserWindow | null = null

// function createWindow() {
//   console.log('Creating main window...')

//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     show: false, // Don't show until ready
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//     }
//   })

//   // Handle both development and production
//   if (process.env.VITE_DEV_SERVER_URL) {
//     // Development mode
//     console.log('Loading development server:', process.env.VITE_DEV_SERVER_URL)
//     mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
//   } else {
//     // Production mode - load the built Nuxt app
//     const indexPath = path.join(__dirname, '../.output/public/index.html')
//     console.log('Loading production build from:', indexPath)
//     mainWindow.loadFile(indexPath)
//       .catch((error) => {
//         console.error('Failed to load file:', error)
//         // Fallback: try loading a simple HTML to test if window works
//         mainWindow?.loadURL('data:text/html,<h1>BookLib</h1><p>Error loading main app. Check console for details.</p>')
//       })
//   }

//   // Show window when ready
//   mainWindow.once('ready-to-show', () => {
//     console.log('Window ready, showing...')
//     mainWindow?.show()
//     mainWindow?.focus()
//   })

//   // Handle window closed
//   mainWindow.on('closed', () => {
//     mainWindow = null
//   })

//   // Log any navigation errors
//   mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
//     console.error('Failed to load:', errorCode, errorDescription, validatedURL)
//   })
// }

// app.whenReady().then(() => {
//   console.log('App ready, creating window...')
//   createWindow()
// })

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow()
//   }
// })

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
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'))
  }
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

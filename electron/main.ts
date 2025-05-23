import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  if (process.env.VITE_DEV_SERVER_URL) {
    new BrowserWindow().loadURL(process.env.VITE_DEV_SERVER_URL)
  }
})

const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const path = require('path')

let tray = null
let mainWindow = null

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,  // Add this line to make the window not resizable
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico')
  })
  
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'index.html'))

  // Listen for the 'minimize' event
  mainWindow.on('minimize', (event) => {
    event.preventDefault()
    mainWindow.hide()
    if (tray === null) {
      createTray()
    }
  })

  // Listen for the 'close' event
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

function createTray() {
  tray = new Tray(path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'SHOW', click: () => {
      mainWindow.show()
      if (tray) tray.destroy()
      tray = null
    }},
    { label: 'QUIT', click: () => {
      app.isQuitting = true
      app.quit()
    }}
  ])
  tray.setToolTip('AtomSuite Boilerplate')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow.show()
    if (tray) tray.destroy()
    tray = null
  })
}

function createTitlebarIconContextMenu() {
  return Menu.buildFromTemplate([
    { label: 'MINIMIZE', click: () => mainWindow.minimize() },
    { label: 'QUIT', click: () => {
      app.isQuitting = true
      app.quit()
    }},
  ])
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('ping', () => 'pong')

ipcMain.handle('show-titlebar-icon-context-menu', (event) => {
  const menu = createTitlebarIconContextMenu()
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.handle('close-window', () => {
  app.isQuitting = true
  app.quit()
})

const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const path = require('path')

let tray = null
let mainWindow = null
let windowState = {
  width: 400,
  height: 600,
  x: undefined,
  y: undefined
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: false,  // Show in taskbar by default
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico')
  })
  
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'index.html'))

  // Store window size and position when it's about to be hidden
  mainWindow.on('minimize', (event) => {
    event.preventDefault()
    storeWindowState()
    mainWindow.hide()
    mainWindow.setSkipTaskbar(true)  // Hide from taskbar
    if (tray === null) {
      createTray()
    }
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      storeWindowState()
      mainWindow.hide()
      mainWindow.setSkipTaskbar(true)  // Hide from taskbar
      if (tray === null) {
        createTray()
      }
    }
    return false
  })
}

function storeWindowState() {
  const bounds = mainWindow.getBounds()
  windowState = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y
  }
}

function restoreWindowState() {
  mainWindow.setBounds(windowState)
}

function createTray() {
  tray = new Tray(path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'SHOW', click: () => {
      restoreWindowState()
      mainWindow.show()
      mainWindow.setSkipTaskbar(false)  // Show in taskbar
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
    restoreWindowState()
    mainWindow.show()
    mainWindow.setSkipTaskbar(false)  // Show in taskbar
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
    } else {
      restoreWindowState()
      mainWindow.show()
      mainWindow.setSkipTaskbar(false)  // Show in taskbar
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

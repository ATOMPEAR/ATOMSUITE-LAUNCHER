const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron')
const path = require('path')

let tray = null
let mainWindow = null
let splashWindow = null
let windowState = {
  width: 400,
  height: 600,
  x: undefined,
  y: undefined
}

let originalPosition = {
  x: undefined,
  y: undefined
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,  // Add this line to hide from taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  splashWindow.loadFile(path.join(__dirname, '..', '..', 'splash.html'))
}

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const windowWidth = 400
  const windowHeight = 600
  const padding = 10  // Distance from screen edges

  windowState = {
    width: windowWidth,
    height: windowHeight,
    x: width - windowWidth - padding,
    y: height - windowHeight - padding
  }

  originalPosition = {
    x: windowState.x,
    y: windowState.y
  }

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,  // Add this line to make the window always on top
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico'),
    show: false  // Add this line to prevent the window from showing immediately
  })

  mainWindow.loadFile(path.join(__dirname, '..', '..', 'index.html'))

  // Store window size and position when it's about to be hidden
  mainWindow.on('minimize', (event) => {
    event.preventDefault()
    storeWindowState()
    mainWindow.hide()
    mainWindow.setSkipTaskbar(true)  // Hide from taskbar
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      storeWindowState()
      mainWindow.hide()
      mainWindow.setSkipTaskbar(true)  // Hide from taskbar
      return false
    }
  })

  // Add this IPC handler
  ipcMain.on('resize-window', (event, width) => {
    const currentBounds = mainWindow.getBounds();
    mainWindow.setBounds({
      x: currentBounds.x,
      y: currentBounds.y,
      width: width,
      height: currentBounds.height
    });
  });

  ipcMain.on('resize-and-move-window', (event, width, direction) => {
    const currentBounds = mainWindow.getBounds();
    let newX = currentBounds.x;

    if (direction === 'left') {
      newX -= 40;
    } else if (direction === 'right') {
      newX += 40;
    }

    mainWindow.setBounds({
      x: newX,
      y: currentBounds.y,
      width: width,
      height: currentBounds.height
    });
  });

  // Show the window when it's ready to be displayed
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    splashWindow.destroy()  // Destroy the splash window when the main window is ready
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
  if (tray === null) {
    tray = new Tray(path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico'))

    function getContextMenu() {
      const isVisible = mainWindow.isVisible() && !mainWindow.isMinimized();
      return Menu.buildFromTemplate([
        {
          label: 'CONTROLS',
          submenu: [
            ...(isVisible ? [{
              label: 'MINIMIZE',
              click: () => {
                mainWindow.minimize()
                mainWindow.setSkipTaskbar(true)  // Hide from taskbar when minimized
                tray.setContextMenu(getContextMenu())  // Update menu
              }
            }] : []),
            ...((!isVisible) ? [{
              label: 'SHOW',
              click: () => {
                restoreWindowState()
                mainWindow.show()
                mainWindow.setSkipTaskbar(false)  // Show in taskbar
                tray.setContextMenu(getContextMenu())  // Update menu
              }
            }] : []),
            { label: 'POSITION', click: () => {
              mainWindow.setBounds({
                x: originalPosition.x,
                y: originalPosition.y,
                width: windowState.width,
                height: windowState.height
              })
              mainWindow.show()
              mainWindow.setSkipTaskbar(false)  // Show in taskbar
              tray.setContextMenu(getContextMenu())  // Update menu
            }}
          ]
        },
        { type: 'separator' },
        { label: 'QUIT', click: () => {
          app.isQuitting = true
          app.quit()
        }}
      ])
    }

    tray.setToolTip('AtomSuite Boilerplate')
    tray.setContextMenu(getContextMenu())

    tray.on('click', () => {
      if (mainWindow.isVisible()) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        } else {
          mainWindow.minimize()
        }
      } else {
        restoreWindowState()
        mainWindow.show()
      }
      tray.setContextMenu(getContextMenu())  // Update menu
    })

    // Listen for window state changes to update the menu
    mainWindow.on('minimize', () => tray.setContextMenu(getContextMenu()))
    mainWindow.on('restore', () => tray.setContextMenu(getContextMenu()))
    mainWindow.on('show', () => tray.setContextMenu(getContextMenu()))
    mainWindow.on('hide', () => tray.setContextMenu(getContextMenu()))
  }
}

function createTitlebarIconContextMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'CONTROLS',
      submenu: [
        { label: 'MINIMIZE', click: () => mainWindow.minimize() },
        { label: 'POSITION', click: () => {
          mainWindow.setBounds({
            x: originalPosition.x,
            y: originalPosition.y,
            width: windowState.width,
            height: windowState.height
          })
          mainWindow.show()
          mainWindow.setSkipTaskbar(false)  // Show in taskbar
        }}
      ]
    },
    { type: 'separator' },
    { label: 'QUIT', click: () => {
      app.isQuitting = true
      app.quit()
    }},
  ])
}

app.whenReady().then(() => {
  createSplashWindow()
  createWindow()
  createTray()

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

ipcMain.handle('snap-window', () => {
  if (mainWindow) {
    mainWindow.setBounds({
      x: originalPosition.x,
      y: originalPosition.y,
      width: windowState.width,
      height: windowState.height
    })
  }
})

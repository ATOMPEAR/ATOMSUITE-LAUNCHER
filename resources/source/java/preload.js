const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  showTitlebarIconContextMenu: () => ipcRenderer.invoke('show-titlebar-icon-context-menu'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  snapWindow: () => ipcRenderer.invoke('snap-window'),
  resizeWindow: (width) => ipcRenderer.send('resize-window', width),
  resizeAndMoveWindow: (width, direction) => ipcRenderer.send('resize-and-move-window', width, direction),
})

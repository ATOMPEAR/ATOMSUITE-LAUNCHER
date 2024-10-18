const { ipcRenderer } = require('electron');
const loadingBar = document.getElementById('loading-bar');

ipcRenderer.on('update-loading-progress', (event, progress) => {
  loadingBar.style.width = `${progress}%`;
});

// This file is executed in the renderer process
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('minimize-button').addEventListener('click', () => {
    window.electronAPI.minimizeWindow()
  })

  document.getElementById('close-button').addEventListener('click', () => {
    window.electronAPI.closeWindow()
  })

  document.getElementById('snap-button').addEventListener('click', () => {
    window.electronAPI.snapWindow()
  })

  // Titlebar icon click functionality
  const titlebarIcon = document.getElementById('titlebar-icon');
  const mainContent1 = document.getElementById('main-content-1');
  const mainContent2 = document.getElementById('main-content-2');

  titlebarIcon.addEventListener('click', () => {
    if (mainContent1.classList.contains('active')) {
      mainContent1.classList.remove('active');
      mainContent2.classList.add('active');
    } else {
      mainContent2.classList.remove('active');
      mainContent1.classList.add('active');
    }
  });

  // Ensure only one content area is active initially
  mainContent1.classList.add('active');
  mainContent2.classList.remove('active');

  // Titlebar icon context menu functionality
  titlebarIcon.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    window.electronAPI.showTitlebarIconContextMenu()
  })
})

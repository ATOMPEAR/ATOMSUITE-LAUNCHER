// This file is executed in the renderer process
document.addEventListener('DOMContentLoaded', () => {
  const windowControls = document.getElementById('window-controls');
  const controlButtons = windowControls.querySelectorAll('.control-button');

  controlButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      windowControls.setAttribute('data-active-tooltip', button.getAttribute('data-tooltip'));
      windowControls.style.setProperty('--tooltip-visible', 'visible');
      windowControls.style.setProperty('--tooltip-opacity', '1');
    });

    button.addEventListener('mouseleave', () => {
      windowControls.style.setProperty('--tooltip-visible', 'hidden');
      windowControls.style.setProperty('--tooltip-opacity', '0');
    });
  });

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
      mainContent1.style.display = 'none';
      mainContent2.classList.add('active');
      mainContent2.style.display = 'flex';
      window.electronAPI.resizeAndMoveWindow(440, 'left');
    } else {
      mainContent2.classList.remove('active');
      mainContent2.style.display = 'none';
      mainContent1.classList.add('active');
      mainContent1.style.display = 'flex';
      window.electronAPI.resizeAndMoveWindow(400, 'right');
      window.electronAPI.snapWindow(); // Add this line to set window to original position
    }
  });

  // Ensure only main-content-1 is active initially
  mainContent1.classList.add('active');
  mainContent1.style.display = 'flex';
  mainContent2.classList.remove('active');
  mainContent2.style.display = 'none';
  window.electronAPI.resizeAndMoveWindow(400, 'right');
  window.electronAPI.snapWindow(); // Add this line to set initial window position

  // Titlebar icon context menu functionality
  titlebarIcon.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    window.electronAPI.showTitlebarIconContextMenu()
  })

  // Toggle search functionality
  const toggleSearchButton = document.getElementById('toggle-search');
  const quickCommandForm = document.querySelector('.quick-command');

  // Ensure quick command is hidden by default
  quickCommandForm.style.display = 'none';
  quickCommandForm.classList.remove('visible');

  toggleSearchButton.addEventListener('click', () => {
    if (quickCommandForm.classList.contains('visible')) {
      // Closing animation
      quickCommandForm.style.maxHeight = '0px';
      quickCommandForm.style.opacity = '0';
      setTimeout(() => {
        quickCommandForm.classList.remove('visible');
        quickCommandForm.style.display = 'none';  // Hide after animation
      }, 300); // Match this delay with the transition duration in CSS
    } else {
      // Opening animation
      quickCommandForm.style.display = 'flex';  // Show before animation
      setTimeout(() => {
        quickCommandForm.classList.add('visible');
        quickCommandForm.style.maxHeight = '30px';
        quickCommandForm.style.opacity = '1';
        quickCommandForm.querySelector('input[type="text"]').focus();
      }, 10); // Small delay to ensure display: flex is applied before the animation starts
    }
  });
})

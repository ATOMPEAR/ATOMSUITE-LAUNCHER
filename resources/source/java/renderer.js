// This file is executed in the renderer process
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const windowControls = document.getElementById('window-controls');
  const controlButtons = windowControls.querySelectorAll('.control-button');

  controlButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      console.log(`Mouse entered ${button.id}`);
      windowControls.setAttribute('data-active-tooltip', button.getAttribute('data-tooltip'));
      windowControls.style.setProperty('--tooltip-visible', 'visible');
      windowControls.style.setProperty('--tooltip-opacity', '1');
    });

    button.addEventListener('mouseleave', () => {
      console.log(`Mouse left ${button.id}`);
      windowControls.style.setProperty('--tooltip-visible', 'hidden');
      windowControls.style.setProperty('--tooltip-opacity', '0');
    });
  });

  document.getElementById('minimize-button').addEventListener('click', () => {
    console.log('Minimize button clicked');
    window.electronAPI.minimizeWindow()
  })

  document.getElementById('close-button').addEventListener('click', () => {
    console.log('Close button clicked');
    window.electronAPI.closeWindow()
  })

  document.getElementById('snap-button').addEventListener('click', () => {
    console.log('Snap button clicked');
    window.electronAPI.snapWindow()
  })

  // Titlebar icon click functionality
  const titlebarIcon = document.getElementById('titlebar-icon');
  const mainContent1 = document.getElementById('main-content-1');
  const mainContent2 = document.getElementById('main-content-2');

  titlebarIcon.addEventListener('click', () => {
    console.log('Titlebar icon clicked');
    if (mainContent1.classList.contains('active')) {
      console.log('Switching to main content 2');
      mainContent1.classList.remove('active');
      mainContent1.style.display = 'none';
      mainContent2.classList.add('active');
      mainContent2.style.display = 'flex';
      window.electronAPI.resizeAndMoveWindow(440, 'left');
    } else {
      console.log('Switching to main content 1');
      mainContent2.classList.remove('active');
      mainContent2.style.display = 'none';
      mainContent1.classList.add('active');
      mainContent1.style.display = 'flex';
      window.electronAPI.resizeAndMoveWindow(400, 'right');
      window.electronAPI.snapWindow();
    }
  });

  // Ensure only main-content-1 is active initially
  console.log('Setting initial content state');
  mainContent1.classList.add('active');
  mainContent1.style.display = 'flex';
  mainContent2.classList.remove('active');
  mainContent2.style.display = 'none';
  window.electronAPI.resizeAndMoveWindow(400, 'right');
  window.electronAPI.snapWindow();

  // Titlebar icon context menu functionality
  titlebarIcon.addEventListener('contextmenu', (e) => {
    console.log('Titlebar icon right-clicked');
    e.preventDefault()
    window.electronAPI.showTitlebarIconContextMenu()
  })

  // Toggle search functionality
  const toggleSearchButton = document.getElementById('toggle-search');
  const quickCommandForm = document.querySelector('.quick-command');

  toggleSearchButton.addEventListener('click', () => {
    console.log('Toggle search button clicked');
    quickCommandForm.classList.toggle('visible');
    if (quickCommandForm.classList.contains('visible')) {
      console.log('Quick command form is now visible');
      quickCommandForm.style.display = 'flex';
      quickCommandForm.querySelector('input[type="text"]').focus();
    } else {
      console.log('Quick command form is now hidden');
      setTimeout(() => {
        quickCommandForm.style.display = 'none';
      }, 300);
    }
  });

  // Accordion functionality
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      console.log(`Accordion header "${header.textContent}" clicked`);
      const accordionContent = header.nextElementSibling;
      const isActive = header.classList.contains('active');

      // Close all accordion items
      accordionHeaders.forEach(h => {
        h.classList.remove('active');
        h.nextElementSibling.style.maxHeight = null;
      });

      // If the clicked item wasn't active, open it
      if (!isActive) {
        console.log(`Opening accordion item "${header.textContent}"`);
        header.classList.add('active');
        accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
      }
    });
  });

  // Quick-command search functionality
  const quickCommandForm = document.getElementById('quick-command-form');
  const quickCommandInput = document.getElementById('quick-command-input');
  const accordionItems = document.querySelectorAll('.accordion-item');

  quickCommandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = quickCommandInput.value.toLowerCase();
    console.log(`Quick command search submitted with term: "${searchTerm}"`);

    accordionItems.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      const subMenuItems = content.querySelectorAll('.sub-menu-item');

      let isMatch = header.textContent.toLowerCase().includes(searchTerm);

      subMenuItems.forEach(subItem => {
        if (subItem.textContent.toLowerCase().includes(searchTerm)) {
          isMatch = true;
        }
      });

      if (isMatch) {
        console.log(`Match found in "${header.textContent}"`);
        item.style.display = '';
        content.style.maxHeight = content.scrollHeight + "px";
        header.classList.add('active');
      } else {
        console.log(`No match found in "${header.textContent}"`);
        item.style.display = 'none';
        content.style.maxHeight = null;
        header.classList.remove('active');
      }
    });
  });

  // Clear search and reset accordion when input is cleared
  quickCommandInput.addEventListener('input', () => {
    if (quickCommandInput.value === '') {
      console.log('Quick command input cleared, resetting accordion');
      accordionItems.forEach(item => {
        item.style.display = '';
        const content = item.querySelector('.accordion-content');
        const header = item.querySelector('.accordion-header');
        content.style.maxHeight = null;
        header.classList.remove('active');
      });
    }
  });

  console.log('All event listeners set up');
})

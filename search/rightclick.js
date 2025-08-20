// == CONTEXT MENU SETUP ==

window.queuedFiles = window.queuedFiles || new Set();
window.fileDownloadURLs = window.fileDownloadURLs || {};
window.folderQueueState = window.folderQueueState || {};  // Initialize folder state tracking
window.fileSizes = window.fileSizes || {}; // for file sizes

const contextMenu = document.createElement('div');
contextMenu.id = 'custom-context-menu';
contextMenu.style.position = 'absolute';
contextMenu.style.background = '#222';
contextMenu.style.color = '#eee';
contextMenu.style.border = '1px solid #444';
contextMenu.style.padding = '5px 0';
contextMenu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
contextMenu.style.zIndex = 10000;
contextMenu.style.display = 'none';
contextMenu.style.minWidth = '150px';
contextMenu.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
contextMenu.style.fontSize = '14px';
contextMenu.style.borderRadius = '4px';
contextMenu.style.userSelect = 'none';
contextMenu.style.transition = 'opacity 0.15s ease';

document.body.appendChild(contextMenu);

// == MODAL SETUP ==

const modalOverlay = document.createElement('div');
modalOverlay.id = 'properties-modal-overlay';
modalOverlay.style.position = 'absolute';
modalOverlay.style.top = '0';
modalOverlay.style.left = '0';
modalOverlay.style.width = '100%';
modalOverlay.style.height = '100%';
modalOverlay.style.minWidth = '100vw';
modalOverlay.style.minHeight = '100vh';
modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
modalOverlay.style.display = 'none';
modalOverlay.style.zIndex = '11000';
modalOverlay.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

document.body.appendChild(modalOverlay);

const modalDialog = document.createElement('div');
modalDialog.id = 'properties-modal-dialog';
modalDialog.style.background = '#2e2e2e';
modalDialog.style.color = '#eee';
modalDialog.style.border = '1px solid #555';
modalDialog.style.borderRadius = '6px';
modalDialog.style.width = '400px';
modalDialog.style.maxWidth = '90vw';
modalDialog.style.padding = '20px';
modalDialog.style.position = 'absolute'; // changed to absolute
modalDialog.style.boxShadow = '0 6px 20px rgba(0,0,0,0.7)';
modalDialog.style.userSelect = 'text';

modalOverlay.appendChild(modalDialog);

const modalTitle = document.createElement('div');
modalTitle.textContent = 'Properties';
modalTitle.style.fontSize = '18px';
modalTitle.style.fontWeight = '600';
modalTitle.style.marginBottom = '15px';
modalTitle.style.borderBottom = '1px solid #555';
modalTitle.style.paddingBottom = '8px';
modalDialog.appendChild(modalTitle);

const modalContent = document.createElement('div');
modalContent.style.display = 'flex';
modalContent.style.flexDirection = 'column';
modalContent.style.gap = '10px';
modalDialog.appendChild(modalContent);

const closeButton = document.createElement('button');
closeButton.textContent = 'Close';
closeButton.style.marginTop = '20px';
closeButton.style.alignSelf = 'flex-end';
closeButton.style.padding = '6px 12px';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '3px';
closeButton.style.background = '#444';
closeButton.style.color = '#eee';
closeButton.style.cursor = 'pointer';
closeButton.style.fontSize = '14px';
closeButton.style.transition = 'background-color 0.2s ease';
closeButton.addEventListener('mouseenter', () => closeButton.style.background = '#555');
closeButton.addEventListener('mouseleave', () => closeButton.style.background = '#444');
closeButton.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});
modalDialog.appendChild(closeButton);

function createPropertyRow(label, value) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.justifyContent = 'space-between';

  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  labelEl.style.fontWeight = '600';

  const valueEl = document.createElement('span');
  valueEl.textContent = value;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  return row;
}

// == MODAL CENTERING FIX ==

function centerModal() {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const modalWidth = modalDialog.offsetWidth;
  const modalHeight = modalDialog.offsetHeight;

  modalDialog.style.top = `${scrollY + (viewportHeight - modalHeight) / 2}px`;
  modalDialog.style.left = `${scrollX + (viewportWidth - modalWidth) / 2}px`;
}

function showModal() {
  modalOverlay.style.display = 'block';
  centerModal();
}

// Recenter on resize/scroll
window.addEventListener('resize', centerModal);
window.addEventListener('scroll', centerModal);

modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});

// == QUEUE SHARED STATE SETUP ==

window.queuedFiles = window.queuedFiles || new Set();
window.fileDownloadURLs = window.fileDownloadURLs || {};
const queuedFiles = window.queuedFiles;
const fileDownloadURLs = window.fileDownloadURLs;

// == FILE URL MAPPING ==

if (typeof jsonFiles === 'undefined') {
  const jsonFiles = [
    'chunk_001.json',
    'chunk_002.json',
  ];
}
async function loadAllFileData(){
  try {
    for (const url of jsonFiles) {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data)) continue;
      data.forEach(fileEntry => {
        if (fileEntry.name && fileEntry.download_url) {
          fileDownloadURLs[fileEntry.name] = fileEntry.download_url;
          if (fileEntry.size != null) {
            window.fileSizes[fileEntry.name] = fileEntry.size;
          }
        }
      });
    }
  } catch {}
}

loadAllFileData();

// == CONTEXT MENU LOGIC ==

function getFileNameFromElement(target) {
  const filenameEl = target.querySelector('.filename');
  if (!filenameEl) return 'Unknown';

  if (target.classList.contains('file')) {
    for (const node of filenameEl.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
        return node.textContent.trim();
      }
    }
    return 'Unknown';
  } else {
    return filenameEl.textContent.trim();
  }
}

function isFolderInQueue(folderName) {
  const folderNameLower = folderName.toLowerCase();
  const hasFilesInQueue = Array.from(window.queuedFiles).some(filePath => {
    const filePathLower = filePath.toLowerCase();
    return filePathLower === folderNameLower || filePathLower.startsWith(folderNameLower + '.');
  });
  return window.folderQueueState[folderName] || hasFilesInQueue;
}

function removeFolderAndContents(folderName) {
  const folderNameLower = folderName.toLowerCase();
  Array.from(window.queuedFiles).forEach(filePath => {
    const filePathLower = filePath.toLowerCase();
    if (filePathLower === folderNameLower || filePathLower.startsWith(folderNameLower + '.')) {
      window.queuedFiles.delete(filePath);
    }
  });
  window.folderQueueState[folderName] = false;
}

function handleAddToQueue(folderName, recursive = false, dryRun = false) {
  const filesToAdd = getAllFilesInFolder(folderName);

  if (dryRun) {
    return filesToAdd.length;
  }

  for (const file of filesToAdd) {
    window.queuedFiles.add(file);
  }

  return filesToAdd.length;
}

function buildContextMenu(target) {
  contextMenu.innerHTML = '';

  const isFolder = target.classList.contains('folder');
  const fileName = getFileNameFromElement(target);
  const fileNameLower = fileName.toLowerCase();

  const fileCount = isFolder 
    ? Array.from(window.queuedFiles).filter(filePath => {
        const filePathLower = filePath.toLowerCase();
        return filePathLower === fileNameLower || filePathLower.startsWith(fileNameLower + '.');
      }).length
    : 0;

  const inQueue = isFolder ? (window.folderQueueState[fileName] || fileCount > 0) : window.queuedFiles.has(fileName);

  const menuOptions = [
    { 
      label: 'Open', 
      action: (target) => target.click() 
    },
    { 
      label: 'Properties', 
      action: (target) => {
        const name = getFileNameFromElement(target);
        const type = isFolder ? 'Folder' : 'File';
        const size = isFolder ? "-" : (window.fileSizes[fileName] ? formatSize(window.fileSizes[fileName]) : "Unknown");
        const dateModified = 'WIP';

        modalContent.innerHTML = '';

        if (!isFolder) {
          modalContent.appendChild(createPropertyRow('Name:', name));
          modalContent.appendChild(createPropertyRow('Type:', type));

          const descriptionEl = target.querySelector('.file-description');
          const extensionEl = target.querySelector('.file-extension');

          const description = descriptionEl ? descriptionEl.textContent.trim() : '-';
          const extension = extensionEl ? extensionEl.textContent.trim() : '-';

          modalContent.appendChild(createPropertyRow('Description:', description));
          modalContent.appendChild(createPropertyRow('Extension:', extension));
          modalContent.appendChild(createPropertyRow('Size:', size));
          modalContent.appendChild(createPropertyRow('Date modified:', dateModified));
        } else {
          modalContent.appendChild(createPropertyRow('Name:', name));
          modalContent.appendChild(createPropertyRow('Type:', type));
          modalContent.appendChild(createPropertyRow('Size:', size));
          modalContent.appendChild(createPropertyRow('Date modified:', dateModified));
        }

        showModal();
      }
    },
    {
      label: inQueue ?
        (isFolder ? `Remove from queue (${fileCount} files)` : 'Remove from queue') :
        'Add to queue',
      action: () => {
        if (isFolder) {
          if (inQueue) {
            const folderNameLower = fileName.toLowerCase();
            const filesToRemove = Array.from(window.queuedFiles).filter(filePath =>
              filePath.toLowerCase() === folderNameLower ||
              filePath.toLowerCase().startsWith(folderNameLower + '.')
            );

            filesToRemove.forEach(filePath => window.queuedFiles.delete(filePath));
            window.folderQueueState[fileName] = false;
          } else {
            if (window.handleAddToQueue) {
              const estimatedCount = window.handleAddToQueue(fileName, true, true);
              if (estimatedCount >= 100) {
                const confirmAdd = confirm(`This folder contains ${estimatedCount} files. Are you sure you want to add them all to the queue?`);
                if (!confirmAdd) return;
              }
              const actualCount = window.handleAddToQueue(fileName, true, false);
              window.folderQueueState[fileName] = true;
            } else {
              alert('Folder queuing requires handleAddToQueue');
            }
          }
        } else {
          if (inQueue) {
            window.queuedFiles.delete(fileName);
          } else {
            window.queuedFiles.add(fileName);
          }
        }

        buildContextMenu(target); // Refresh menu
      }
    }
  ];

  menuOptions.forEach(({ label, action }) => {
    const item = document.createElement('div');
    item.textContent = label;
    item.style.padding = '8px 16px';
    item.style.cursor = 'pointer';
    item.style.userSelect = 'none';
    item.style.transition = 'background-color 0.2s ease, color 0.2s ease';
    item.style.borderRadius = '2px';
    item.style.color = '#eee';
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = '#555';
      item.style.color = '#fff';
    });
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
      item.style.color = '#eee';
    });
    item.addEventListener('click', () => {
      action(target);
      hideContextMenu();
    });
    contextMenu.appendChild(item);
  });
}

function showContextMenu(x, y) {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  contextMenu.style.top = `${y}px`;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.display = 'block';
  contextMenu.style.opacity = '1';

  const rect = contextMenu.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  if (rect.right > viewportWidth) {
    const newLeft = x - rect.width;
    contextMenu.style.left = `${Math.max(scrollLeft + 10, newLeft)}px`;
  }
  
  if (rect.bottom > viewportHeight) {
    const newTop = y - rect.height;
    contextMenu.style.top = `${Math.max(scrollTop + 10, newTop)}px`;
  }
  
  if (rect.left < 0) {
    contextMenu.style.left = `${scrollLeft + 10}px`;
  }
  
  if (rect.top < 0) {
    contextMenu.style.top = `${scrollTop + 10}px`;
  }
}

function hideContextMenu() {
  contextMenu.style.display = 'none';
  contextMenu.style.opacity = '0';
}

document.addEventListener('contextmenu', event => {
  const target = event.target.closest('.folder, .file');
  if (!target) {
    hideContextMenu();
    return;
  }
  event.preventDefault();
  buildContextMenu(target);
  showContextMenu(event.pageX, event.pageY);
});

document.addEventListener('click', event => {
  if (!contextMenu.contains(event.target)) {
    hideContextMenu();
  }
});

function formatSize(bytes) {
  if (typeof bytes !== "number" || isNaN(bytes)) return "Unknown";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

// ==============
// == Helper example ==
// ==============

window.getAllFilesInFolder = function(folderName) {
  return [
    folderName + '.file1.txt',
    folderName + '.file2.txt',
    folderName + '.file3.txt'
  ];
};

window.handleAddToQueue = function(folderName, recursive = true, dryRun = false) {
  const files = window.getAllFilesInFolder(folderName);
  if (dryRun) {
    return files.length;
  }
  files.forEach(f => window.queuedFiles.add(f));
  window.folderQueueState[folderName] = true;
  return files.length;
};
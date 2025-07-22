window.onload = function () {
  (function () {
    const queuedFiles = window.queuedFiles || new Set();
    const fileDownloadURLs = window.fileDownloadURLs || {};
    let fullTree = {}; // Store the complete file tree structure

    // Create container for controls
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.width = '100%';
    controlsContainer.style.marginBottom = '20px';
    controlsContainer.style.gap = '20px';

    // Get the entryCount element
    const entryCount = document.getElementById('entryCount');

    // Create container for button and queue status
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '15px';

    // Create queue status display
    const queueStatus = document.createElement('div');
    queueStatus.id = 'queue-status';
    queueStatus.style.fontSize = '14px';
    queueStatus.style.color = '#8b949e';
    queueStatus.style.maxWidth = '300px';
    queueStatus.style.width = '300px';
    queueStatus.style.overflow = 'hidden';
    queueStatus.style.textOverflow = 'ellipsis';
    queueStatus.style.whiteSpace = 'nowrap';
    queueStatus.style.cursor = 'pointer';
    queueStatus.style.textAlign = 'right';

    // Open a separate window for showing queued files
    queueStatus.addEventListener('click', () => {
      if (queuedFiles.size === 0) {
        alert('Queue is empty.');
        return;
      }

      const popup = window.open('', 'QueuePopup', 'width=500,height=400,resizable=yes,scrollbars=yes');
      if (!popup) {
        alert('Popup blocked. Please allow popups for this site.');
        return;
      }

      const fileList = Array.from(queuedFiles).sort();
      popup.document.write(`
        <html>
          <head>
            <title>Queued Files</title>
            <style>
              body {
                font-family: sans-serif;
                padding: 10px;
                background-color: #111;
                color: #eee;
              }
              ul {
                max-height: 90vh;
                overflow-y: auto;
                padding-left: 20px;
              }
              li {
                margin-bottom: 5px;
              }
            </style>
          </head>
          <body>
            <h2>${fileList.length} File${fileList.length !== 1 ? 's' : ''} in Queue</h2>
            <ul>
              ${fileList.map(file => `<li>${file}</li>`).join('')}
            </ul>
          </body>
        </html>
      `);
      popup.document.close();
    });

    // Create Download Queue button
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-queue-btn';
    downloadButton.textContent = 'Download Queue';
    downloadButton.style.padding = '10px 20px';
    downloadButton.style.fontSize = '14px';
    downloadButton.style.backgroundColor = '#444';
    downloadButton.style.color = '#eee';
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '5px';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.zIndex = '12000';
    downloadButton.style.transition = 'background-color 0.2s ease';
    downloadButton.style.flexShrink = '0';

    // Assemble button container
    buttonContainer.appendChild(queueStatus);
    buttonContainer.appendChild(downloadButton);

    // Move entryCount into container
    if (entryCount && entryCount.parentNode) {
      entryCount.parentNode.insertBefore(controlsContainer, entryCount);
      controlsContainer.appendChild(entryCount);
      controlsContainer.appendChild(buttonContainer);
    } else {
      // Fallback if entryCount isn't found
      document.body.appendChild(buttonContainer);
    }

    // Function to recursively get all files in a folder
    function getAllFilesInFolder(folderNode, path = '', fileList = []) {
      for (const [name, node] of Object.entries(folderNode.__children || {})) {
        const currentPath = path ? `${path}/${name}` : name;
        if (node.__type === 'file') {
          fileList.push(currentPath);
        } else if (node.__type === 'folder') {
          getAllFilesInFolder(node, currentPath, fileList);
        }
      }
      return fileList;
    }

    // Function to update queue status display
    // Function to update queue status display
function updateQueueStatus() {
  if (queuedFiles.size === 0) {
    queueStatus.textContent = 'No files in queue';
    queueStatus.title = '';
  } else {
    const allFiles = Array.from(queuedFiles);
    const fileCountText = `Queued: ${allFiles.length} file${allFiles.length !== 1 ? 's' : ''}`;
    const previewFiles = allFiles.slice(0, 3);
    let statusText = `${fileCountText}: ${previewFiles.join(', ')}`;
    if (allFiles.length > 3) {
      statusText += ` (+${allFiles.length - 3} more)`;
    }
    queueStatus.textContent = statusText;
    queueStatus.title = allFiles.join('\n');
  }
  updateFileBadges();
}

// Add hover effect to show "Show all..." on queueStatus
queueStatus.addEventListener('mouseenter', () => {
  if (queuedFiles.size > 0) {
    queueStatus.textContent = 'Show all...';
    // Keep the tooltip showing all files
    queueStatus.title = Array.from(queuedFiles).join('\n');
  }
});

queueStatus.addEventListener('mouseleave', () => {
  updateQueueStatus();
});


    // Function to add or remove visual badges next to files/folders in the UI
    function updateFileBadges() {
      const fileElements = document.querySelectorAll('.file, .folder');
      fileElements.forEach(el => {
        const filenameSpan = el.querySelector('.filename');
        if (!filenameSpan) return;

        // Clone the filename span and remove description and extension spans for clean text
        const clone = filenameSpan.cloneNode(true);
        const desc = clone.querySelector('.file-description');
        const ext = clone.querySelector('.file-extension');
        if (desc) desc.remove();
        if (ext) ext.remove();

        const fileName = clone.textContent.trim();

        if (queuedFiles.has(fileName)) {
          if (!el.querySelector('.queue-badge')) {
            const badge = document.createElement('span');
            badge.className = 'queue-badge';
            badge.style.backgroundColor = '#1e90ff'; // DodgerBlue
            badge.style.color = 'white';
            badge.style.fontSize = '12px';
            badge.style.padding = '2px 6px';
            badge.style.marginLeft = '8px';
            badge.style.borderRadius = '12px';
            badge.style.userSelect = 'none';
            badge.textContent = 'Queued';
            el.appendChild(badge);
          }
        } else {
          const existingBadge = el.querySelector('.queue-badge');
          if (existingBadge) existingBadge.remove();
        }
      });
    }

    // === MutationObserver observing entire document.body subtree ===
    const observer = new MutationObserver((mutationsList) => {
      let foundNewFilesOrFolders = false;
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (
              node.nodeType === 1 && // Element node
              (node.classList.contains('file') || node.classList.contains('folder') ||
               node.querySelector('.file') || node.querySelector('.folder'))
            ) {
              foundNewFilesOrFolders = true;
              break;
            }
          }
        }
        if (foundNewFilesOrFolders) break;
      }
      if (foundNewFilesOrFolders) {
        updateFileBadges();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    // === End MutationObserver ===

    // Initial status update
    updateQueueStatus();

    // Override queuedFiles methods to auto-update status and badges
    const originalAdd = queuedFiles.add.bind(queuedFiles);
    const originalDelete = queuedFiles.delete.bind(queuedFiles);

    queuedFiles.add = function (...args) {
      const result = originalAdd(...args);
      updateQueueStatus();
      return result;
    };

    queuedFiles.delete = function (...args) {
      const result = originalDelete(...args);
      updateQueueStatus();
      return result;
    };

    // Function to handle adding files/folders to queue
    window.handleAddToQueue = function (fileName, isFolder) {
      if (isFolder) {
        const pathParts = fileName.split('/');
        let currentNode = fullTree;

        for (const part of pathParts) {
          if (currentNode[part] && currentNode[part].__children) {
            currentNode = currentNode[part].__children;
          } else {
            console.warn('Folder not found in tree:', fileName);
            return false;
          }
        }

        const folderFiles = getAllFilesInFolder({ __children: currentNode });
        folderFiles.forEach(file => queuedFiles.add(file));
        updateQueueStatus();
        return folderFiles.length;
      } else {
        queuedFiles.add(fileName);
        updateQueueStatus();
        return 1;
      }
    };

    // Store the full tree when loading files
    const originalBuildNestedTree = buildNestedTreeFromFlatArray;
    buildNestedTreeFromFlatArray = function (flatArray) {
      fullTree = originalBuildNestedTree(flatArray);
      return fullTree;
    };

    // Button event handlers
    downloadButton.addEventListener('mouseenter', () => {
      downloadButton.style.backgroundColor = '#555';
    });

    downloadButton.addEventListener('mouseleave', () => {
      downloadButton.style.backgroundColor = '#444';
    });

    downloadButton.addEventListener('click', async () => {
      if (queuedFiles.size === 0) {
        alert('Queue is empty. Add files before downloading.');
        return;
      }

      if (!window.JSZip) {
        alert('JSZip library not loaded yet. Please wait and try again.');
        return;
      }

      const zip = new JSZip();
      queueStatus.textContent = 'Preparing download...';

      const filesToDownload = Array.from(queuedFiles);
      let successfulDownloads = 0;

      for (const fileName of filesToDownload) {
        const url = fileDownloadURLs[fileName];
        if (!url) {
          console.warn(`No download URL found for "${fileName}", skipping.`);
          continue;
        }

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          zip.file(fileName, blob);
          successfulDownloads++;
        } catch (err) {
          console.warn(`Error fetching ${fileName} from ${url}:`, err);
        }
      }

      if (successfulDownloads === 0) {
        queueStatus.textContent = 'Download failed for all files';
        return;
      }

      zip.generateAsync({ type: 'blob' }).then(content => {
        queueStatus.textContent = 'Download ready!';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'packed.zip';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(a.href);
          document.body.removeChild(a);
          setTimeout(() => updateQueueStatus(), 1000);
        }, 100);
      });
    });

    function loadJSZip() {
      if (window.JSZip) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    loadJSZip().then(() => {
      // JSZip loaded
    });
  })();
};

window.onload = function () {
  (function () {
    window.queuedFiles = window.queuedFiles || new Set();
    const queuedFiles = window.queuedFiles;

    let flatData = [];
    const fileDownloadURLsByPath = {};
    const fileSizesByPath = {};
    const nameToPaths = {};

    // --- UI setup ---
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.width = '100%';
    controlsContainer.style.marginBottom = '20px';
    controlsContainer.style.gap = '20px';

    const entryCount = document.getElementById('entryCount');

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '15px';

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
    downloadButton.style.zIndex = '9000';
    downloadButton.style.transition = 'background-color 0.2s ease';
    downloadButton.style.flexShrink = '0';

    buttonContainer.appendChild(queueStatus);
    buttonContainer.appendChild(downloadButton);

    if (entryCount && entryCount.parentNode) {
      entryCount.parentNode.insertBefore(controlsContainer, entryCount);
      controlsContainer.appendChild(entryCount);
      controlsContainer.appendChild(buttonContainer);
    } else {
      document.body.appendChild(buttonContainer);
    }

    // --------------------------
    // Initialization from JSON
    // --------------------------
    function initializeFromSharedData() {
      if (!window.sharedDataManager || !window.sharedDataManager.getData) return false;
      const data = window.sharedDataManager.getData();
      if (!Array.isArray(data)) return false;
      flatData = data;

      Object.keys(fileDownloadURLsByPath).forEach(k => delete fileDownloadURLsByPath[k]);
      Object.keys(fileSizesByPath).forEach(k => delete fileSizesByPath[k]);
      Object.keys(nameToPaths).forEach(k => delete nameToPaths[k]);

      for (const entry of flatData) {
        if (!entry || !entry.path) continue;
        const path = entry.path;
        const name = (entry.name || path).toString();
        if (entry.download_url) fileDownloadURLsByPath[path] = entry.download_url;
        if (entry.size != null) fileSizesByPath[path] = entry.size;

        if (!nameToPaths[name]) nameToPaths[name] = [];
        nameToPaths[name].push(path);
      }

      window._fileDownloadURLsByPath = fileDownloadURLsByPath;
      window._fileSizesByPath = fileSizesByPath;
      window._nameToPaths = nameToPaths;

      return true;
    }

    if (window.sharedDataManager && window.sharedDataManager.isLoaded && window.sharedDataManager.isLoaded()) {
      initializeFromSharedData();
    } else if (window.sharedDataManager && typeof window.sharedDataManager.addListener === 'function') {
      window.sharedDataManager.addListener(() => initializeFromSharedData());
    }

    // --------------------------
    // Queue status & badges
    // --------------------------
    function updateQueueStatus() {
      if (queuedFiles.size === 0) {
        queueStatus.textContent = 'No files in queue';
        queueStatus.title = '';
      } else {
        const all = Array.from(queuedFiles);
        const preview = all.slice(0, 3);
        let text = `Queued: ${all.length} file${all.length !== 1 ? 's' : ''}: ${preview.join(', ')}`;
        if (all.length > 3) text += ` (+${all.length - 3} more)`;
        queueStatus.textContent = text;
        queueStatus.title = all.join('\n');
      }
      updateFileBadges();
    }

    queueStatus.addEventListener('mouseenter', () => {
      if (queuedFiles.size > 0) {
        queueStatus.textContent = 'Show all...';
        queueStatus.title = Array.from(queuedFiles).join('\n');
      }
    });
    queueStatus.addEventListener('mouseleave', updateQueueStatus);

    function updateFileBadges() {
      const fileElements = document.querySelectorAll('.file, .folder');
      fileElements.forEach(el => {
        const filenameSpan = el.querySelector('.filename');
        if (!filenameSpan) return;
        const clone = filenameSpan.cloneNode(true);
        const desc = clone.querySelector('.file-description');
        const ext = clone.querySelector('.file-extension');
        if (desc) desc.remove();
        if (ext) ext.remove();
        const displayName = clone.textContent.trim();
        const pathsForName = nameToPaths[displayName] || [];
        const isQueued = pathsForName.some(p => queuedFiles.has(p)) || queuedFiles.has(displayName);

        if (isQueued) {
          if (!el.querySelector('.queue-badge')) {
            const badge = document.createElement('span');
            badge.className = 'queue-badge';
            badge.style.backgroundColor = '#1e90ff';
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

    const observer = new MutationObserver(mutationsList => {
      for (const m of mutationsList) {
        if (m.type === 'childList' && m.addedNodes.length) {
          updateFileBadges();
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const origAdd = queuedFiles.add.bind(queuedFiles);
    const origDelete = queuedFiles.delete.bind(queuedFiles);
    queuedFiles.add = function (...args) { const r = origAdd(...args); updateQueueStatus(); return r; };
    queuedFiles.delete = function (...args) { const r = origDelete(...args); updateQueueStatus(); return r; };

    // --------------------------
    // Add / Remove queue
    // --------------------------
    window.handleAddToQueue = function (displayNameOrPath, isFolder) {
      if (!flatData.length) initializeFromSharedData();
      const keyLower = displayNameOrPath.toLowerCase();

      if (isFolder) {
        const matches = flatData.filter(f => {
          const p = f.path.toLowerCase();
          return p === keyLower || p.startsWith(keyLower + '/');
        }).map(f => f.path);

        matches.forEach(p => queuedFiles.add(p));
        return matches.length;
      } else {
        const exactByPath = flatData.find(f => f.path.toLowerCase() === keyLower);
        if (exactByPath) { queuedFiles.add(exactByPath.path); return 1; }
        const byName = flatData.find(f => f.name && f.name.toLowerCase() === keyLower);
        if (byName) { queuedFiles.add(byName.path); return 1; }
        return 0;
      }
    };

    window.handleRemoveFromQueue = function (displayNameOrPath, isFolder) {
      if (!flatData.length) initializeFromSharedData();
      const keyLower = displayNameOrPath.toLowerCase();

      if (isFolder) {
        const matches = flatData.filter(f => {
          const p = f.path.toLowerCase();
          return p === keyLower || p.startsWith(keyLower + '/');
        }).map(f => f.path);

        matches.forEach(p => queuedFiles.delete(p));
        return matches.length;
      } else {
        const exactByPath = flatData.find(f => f.path.toLowerCase() === keyLower);
        if (exactByPath) { queuedFiles.delete(exactByPath.path); return 1; }
        const byName = flatData.find(f => f.name && f.name.toLowerCase() === keyLower);
        if (byName) { queuedFiles.delete(byName.path); return 1; }
        return 0;
      }
    };

    // --------------------------
    // Download with fallback URLs
    // --------------------------
    
    // Helper functions to generate alternative URLs
    function getAlternativeURLs(rawUrl) {
      try {
        const urls = [];
        
        // Parse the raw URL
        const match = rawUrl.match(/^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/(.+)$/);
        if (!match) return urls;
        
        const [, user, repo, branchAndPath] = match;
        
        // Clean up branch reference (remove refs/heads/ if present)
        const cleanBranchAndPath = branchAndPath.replace(/^refs\/heads\//, '');
        
        // Option 1: GitHub blob URL with ?raw=true (will work on HTTPS, blocked on localhost)
        urls.push(`https://github.com/${user}/${repo}/blob/${cleanBranchAndPath}?raw=true`);
        
        // Option 2: jsdelivr CDN (best fallback - no CORS issues)
        const pathParts = cleanBranchAndPath.split('/');
        const branch = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        urls.push(`https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${filePath}`);
        
        // Option 3: Try with different branch format (fixes refs/heads/ issues)
        if (branchAndPath.includes('refs/heads/')) {
          urls.push(`https://raw.githubusercontent.com/${user}/${repo}/${cleanBranchAndPath}`);
        }
        
        // Option 4: statically.io CDN (another CDN option)
        urls.push(`https://cdn.statically.io/gh/${user}/${repo}/${branch}/${filePath}`);
        
        // Option 5: Try different raw URL with retry
        urls.push(`https://raw.githubusercontent.com/${user}/${repo}/${branchAndPath}?t=${Date.now()}`);
        
        return urls;
      } catch (err) {
        // console.warn('Error generating alternative URLs:', err);
        return [];
      }
    }

    // Function to display failed files modal
    function showFailedFilesModal(failedFiles) {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '10000';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';

      // Create modal content
      const modal = document.createElement('div');
      modal.style.backgroundColor = '#2d2d2d';
      modal.style.color = '#eee';
      modal.style.padding = '20px';
      modal.style.borderRadius = '10px';
      modal.style.maxWidth = '80%';
      modal.style.maxHeight = '80%';
      modal.style.overflow = 'auto';
      modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';

      // Create title
      const title = document.createElement('h3');
      title.textContent = `Failed Downloads (${failedFiles.length} files)`;
      title.style.marginTop = '0';
      title.style.marginBottom = '15px';
      title.style.color = '#ff6b6b';

      // Create file list
      const fileList = document.createElement('div');
      fileList.style.marginBottom = '20px';
      fileList.style.maxHeight = '300px';
      fileList.style.overflow = 'auto';
      fileList.style.border = '1px solid #444';
      fileList.style.borderRadius = '5px';
      fileList.style.padding = '10px';

      failedFiles.forEach(filePath => {
        const fileItem = document.createElement('div');
        fileItem.style.marginBottom = '8px';
        fileItem.style.fontSize = '14px';
        fileItem.style.fontFamily = 'monospace';
        
        const fileName = document.createElement('span');
        fileName.textContent = filePath;
        fileName.style.marginRight = '10px';
        
        const downloadLink = document.createElement('a');
        downloadLink.textContent = '[Download]';
        downloadLink.style.color = '#4dabf7';
        downloadLink.style.textDecoration = 'none';
        downloadLink.style.fontSize = '12px';
        downloadLink.href = fileDownloadURLsByPath[filePath] || '#';
        downloadLink.target = '_blank';
        downloadLink.style.cursor = 'pointer';
        
        fileItem.appendChild(fileName);
        fileItem.appendChild(downloadLink);
        fileList.appendChild(fileItem);
      });

      // Create buttons container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'space-between';
      buttonContainer.style.gap = '10px';

      // Create copy list button
      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy File List';
      copyButton.style.padding = '8px 16px';
      copyButton.style.backgroundColor = '#4dabf7';
      copyButton.style.color = 'white';
      copyButton.style.border = 'none';
      copyButton.style.borderRadius = '5px';
      copyButton.style.cursor = 'pointer';

      copyButton.addEventListener('click', () => {
        const fileNames = failedFiles.join('\n');
        navigator.clipboard.writeText(fileNames).then(() => {
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy File List';
          }, 2000);
        });
      });

      // Create close button
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.padding = '8px 16px';
      closeButton.style.backgroundColor = '#6c757d';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '5px';
      closeButton.style.cursor = 'pointer';

      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });

      buttonContainer.appendChild(copyButton);
      buttonContainer.appendChild(closeButton);

      modal.appendChild(title);
      modal.appendChild(fileList);
      modal.appendChild(buttonContainer);
      overlay.appendChild(modal);

      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
        }
      });

      document.body.appendChild(overlay);
    }

    // Enhanced download function with wave-based fallbacks
    async function downloadFilesInWaves(zip, paths) {
      let remainingFiles = paths.map(path => ({
        path,
        primaryUrl: fileDownloadURLsByPath[path]
      })).filter(item => item.primaryUrl);

      let totalSuccess = 0;
      let waveCount = 0;

      // Helper function to try downloading a batch of files with specific URLs
      async function tryDownloadWave(files, urlGenerator, waveName) {
        // console.log(`\n--- ${waveName} (${files.length} files) ---`);
        const results = await Promise.all(files.map(async (item) => {
          const url = urlGenerator(item);
          if (!url) return { success: false, item };

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout per file
            
            const resp = await fetch(url, {
              signal: controller.signal
              // Removed headers to avoid CORS preflight issues
            });
            
            clearTimeout(timeoutId);
            
            if (!resp.ok) {
              throw new Error(`HTTP ${resp.status}`);
            }
            
            // Check if response is actually a file
            const contentType = resp.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
              throw new Error('Received HTML instead of file');
            }
            
            const blob = await resp.blob();
            
            if (blob.size === 0) {
              throw new Error('Empty file received');
            }
            
            zip.file(item.path, blob);
            // console.log(`✓ ${item.path} (${blob.size} bytes)`);
            return { success: true, item };
            
          } catch (err) {
            // console.log(`✗ ${item.path}: ${err.message}`);
            return { success: false, item };
          }
        }));

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success);
        
        // console.log(`${waveName} results: ${successful}/${files.length} successful`);
        
        return {
          successful,
          failedItems: failed.map(r => r.item)
        };
      }

      // Wave 1: Primary sources
      if (remainingFiles.length > 0) {
        waveCount++;
        queueStatus.textContent = `Downloading from primary sources...`;
        
        const wave1 = await tryDownloadWave(remainingFiles, 
          (item) => item.primaryUrl, 
          "Wave 1: Primary sources"
        );
        
        totalSuccess += wave1.successful;
        remainingFiles = wave1.failedItems;
        queueStatus.textContent = `Downloaded ${totalSuccess}/${paths.length} files`;
      }

      // Wave 2: Alternative CDN
      if (remainingFiles.length > 0) {
        waveCount++;
        queueStatus.textContent = `Trying alternative sources...`;
        
        const wave2 = await tryDownloadWave(remainingFiles,
          (item) => {
            const match = item.primaryUrl.match(/^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/(.+)$/);
            if (!match) return null;
            const [, user, repo, branchAndPath] = match;
            const cleanPath = branchAndPath.replace(/^refs\/heads\//, '');
            const pathParts = cleanPath.split('/');
            const branch = pathParts[0];
            const filePath = pathParts.slice(1).join('/');
            return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${filePath}`;
          },
          "Wave 2: Alternative CDN"
        );
        
        totalSuccess += wave2.successful;
        remainingFiles = wave2.failedItems;
        queueStatus.textContent = `Downloaded ${totalSuccess}/${paths.length} files`;
      }

      // Wave 3: Backup sources
      if (remainingFiles.length > 0) {
        waveCount++;
        queueStatus.textContent = `Trying backup sources...`;
        
        const wave3 = await tryDownloadWave(remainingFiles,
          (item) => {
            const match = item.primaryUrl.match(/^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/(.+)$/);
            if (!match) return null;
            const [, user, repo, branchAndPath] = match;
            const cleanPath = branchAndPath.replace(/^refs\/heads\//, '');
            return `https://raw.githubusercontent.com/${user}/${repo}/${cleanPath}`;
          },
          "Wave 3: Backup sources"
        );
        
        totalSuccess += wave3.successful;
        remainingFiles = wave3.failedItems;
        queueStatus.textContent = `Downloaded ${totalSuccess}/${paths.length} files`;
      }

      // Wave 4: Additional mirror
      if (remainingFiles.length > 0) {
        waveCount++;
        queueStatus.textContent = `Trying additional mirrors...`;
        
        const wave4 = await tryDownloadWave(remainingFiles,
          (item) => {
            const match = item.primaryUrl.match(/^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/(.+)$/);
            if (!match) return null;
            const [, user, repo, branchAndPath] = match;
            const cleanPath = branchAndPath.replace(/^refs\/heads\//, '');
            const pathParts = cleanPath.split('/');
            const branch = pathParts[0];
            const filePath = pathParts.slice(1).join('/');
            return `https://cdn.statically.io/gh/${user}/${repo}/${branch}/${filePath}`;
          },
          "Wave 4: Additional mirror"
        );
        
        totalSuccess += wave4.successful;
        remainingFiles = wave4.failedItems;
        queueStatus.textContent = `Downloaded ${totalSuccess}/${paths.length} files`;
      }

      // Wave 5: Final retry
      if (remainingFiles.length > 0) {
        waveCount++;
        queueStatus.textContent = `Final retry attempt...`;
        
        const wave5 = await tryDownloadWave(remainingFiles,
          (item) => `${item.primaryUrl}?t=${Date.now()}`,
          "Wave 5: Final retry"
        );
        
        totalSuccess += wave5.successful;
        remainingFiles = wave5.failedItems;
      }

      return {
        totalSuccess,
        totalAttempted: paths.length,
        failedFiles: remainingFiles.map(item => item.path)
      };
    }

    downloadButton.addEventListener('click', async () => {
      if (queuedFiles.size === 0) { alert('Queue empty'); return; }
      if (!window.JSZip) { alert('JSZip not loaded'); return; }
      
      const zip = new JSZip();
      const paths = Array.from(queuedFiles);

      // Update button text to show progress
      const originalText = downloadButton.textContent;
      downloadButton.textContent = 'Downloading...';
      downloadButton.disabled = true;

      // console.log(`\n=== Starting download of ${paths.length} files ===`);
      
      try {
        const result = await downloadFilesInWaves(zip, paths);
        
        // Reset button state
        downloadButton.textContent = originalText;
        downloadButton.disabled = false;

        if (result.totalSuccess === 0) { 
          queueStatus.textContent = 'All downloads failed'; 
          return; 
        }

        // Show results
        const successRate = `${result.totalSuccess}/${result.totalAttempted}`;
        
        if (result.failedFiles.length > 0) {
          // console.log(`\n=== Failed files (${result.failedFiles.length}) ===`);
          // result.failedFiles.forEach(path => console.log(`✗ ${path}`));
          
          // Create clickable status for failed files
          queueStatus.textContent = `Downloaded ${successRate} files - ${result.failedFiles.length} failed (click to view)`;
          queueStatus.style.cursor = 'pointer';
          queueStatus.style.textDecoration = 'underline';
          queueStatus.style.color = '#ff6b6b';
          
          // Add click handler to show failed files
          const showFailedHandler = () => {
            showFailedFilesModal(result.failedFiles);
          };
          queueStatus.addEventListener('click', showFailedHandler);
          
          // Remove the handler after 30 seconds to prevent memory leaks
          setTimeout(() => {
            queueStatus.removeEventListener('click', showFailedHandler);
            queueStatus.style.cursor = 'default';
            queueStatus.style.textDecoration = 'none';
            queueStatus.style.color = '#8b949e';
            queueStatus.textContent = `Downloaded ${successRate} files`;
          }, 30000);
          
        } else {
          queueStatus.textContent = `✓ Downloaded all ${result.totalSuccess} files`;
        }

        // Generate and download the zip
        const content = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `packed_${result.totalSuccess}_files.zip`;
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); }, 100);
        
      } catch (err) {
        console.error('Download process failed:', err);
        queueStatus.textContent = 'Download process failed';
        downloadButton.textContent = originalText;
        downloadButton.disabled = false;
      }
    });

    function loadJSZip() {
      if (window.JSZip) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    loadJSZip();
    updateQueueStatus();
  })();
};
const jsonFiles = [
  'OTA-PART-1/chunk_001.json',
  'OTA-PART-1/chunk_002.json',
  'OTA-PART-2/chunk_001.json',
  // If we need another, add it here
];

Promise.all(jsonFiles.map(file => 
  fetch(file)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ${file}`);
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        const entryCount = data.length;
        const totalSize = data.reduce((sum, entry) => {
          // Add the size if it exists and is a number, otherwise add 0
          const size = typeof entry.size === 'number' ? entry.size : 0;
          return sum + size;
        }, 0);
        
        // Build path breakdown with file references
        const pathData = {};
        const filesInFolders = {};
        
        data.forEach(entry => {
          if (entry.path) {
            const pathParts = entry.path.split('/');
            if (pathParts.length >= 2) {
              // Remove the filename (last part) to get just the folder structure
              const folderParts = pathParts.slice(0, -1);
              const fileName = pathParts[pathParts.length - 1];
              
              // Build nested structure: folder -> subfolder -> sub-subfolder -> etc.
              let currentLevel = pathData;
              let pathSoFar = '';
              
              folderParts.forEach((folder, index) => {
                pathSoFar += (index > 0 ? '/' : '') + folder;
                
                if (!currentLevel[folder]) {
                  currentLevel[folder] = { count: 0, subfolders: {} };
                }
                
                currentLevel[folder].count++;
                currentLevel = currentLevel[folder].subfolders;
                
                // Store files for each folder path
                if (!filesInFolders[pathSoFar]) {
                  filesInFolders[pathSoFar] = [];
                }
              });
              
              // Add the file to the complete folder path
              const completeFolderPath = folderParts.join('/');
              if (!filesInFolders[completeFolderPath]) {
                filesInFolders[completeFolderPath] = [];
              }
              filesInFolders[completeFolderPath].push({
                name: fileName,
                size: entry.size || 0,
                fullPath: entry.path
              });
            }
          }
        });
        
        return { entryCount, totalSize, pathData, filesInFolders };
      } else {
        console.warn(`${file} is not an array.`);
        return { entryCount: 0, totalSize: 0, pathData: {}, filesInFolders: {} };
      }
    })
    .catch(err => {
      console.error(`Error processing ${file}:`, err);
      return { entryCount: 0, totalSize: 0, pathData: {}, filesInFolders: {} };
    })
)).then(results => {
  const totalEntries = results.reduce((sum, r) => sum + r.entryCount, 0);
  const totalSizeBytes = results.reduce((sum, r) => sum + r.totalSize, 0);
  
  // Build path breakdown from all results
  const pathBreakdown = {};
  const allFilesInFolders = {};
  
  results.forEach(result => {
    if (result.pathData) {
      // Merge nested folder structures
      function mergePathData(source, target) {
        Object.keys(source).forEach(folder => {
          if (!target[folder]) {
            target[folder] = { count: 0, subfolders: {} };
          }
          target[folder].count += source[folder].count;
          mergePathData(source[folder].subfolders, target[folder].subfolders);
        });
      }
      mergePathData(result.pathData, pathBreakdown);
    }
    
    // Merge files in folders
    if (result.filesInFolders) {
      Object.keys(result.filesInFolders).forEach(folderPath => {
        if (!allFilesInFolders[folderPath]) {
          allFilesInFolders[folderPath] = [];
        }
        allFilesInFolders[folderPath].push(...result.filesInFolders[folderPath]);
      });
    }
  });
  
  const entryCountElem = document.getElementById('entryCount');
  
  // Array of size units and their conversion factors
  const sizeUnits = [
    { unit: 'B', divisor: 1, label: 'bytes' },
    { unit: 'KB', divisor: 1024, label: 'KB' },
    { unit: 'MB', divisor: 1024 * 1024, label: 'MB' },
    { unit: 'GB', divisor: 1024 * 1024 * 1024, label: 'GB' },
    { unit: 'TB', divisor: 1024 * 1024 * 1024 * 1024, label: 'TB' }
  ];
  
  let currentUnitIndex = 0;
  
  // Function to create path breakdown HTML with clickable folders
  function createPathBreakdownHTML() {
    let breakdownHTML = '';
    
    function buildFolderTree(folderData, indentLevel = 0, currentPath = '') {
      const indent = '  '.repeat(indentLevel);
      
      Object.keys(folderData).forEach(folder => {
        const data = folderData[folder];
        const folderPath = currentPath ? `${currentPath}/${folder}` : folder;
        const folderId = `folder-${folderPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        breakdownHTML += `${indent}<span class="folder-item" data-folder-path="${folderPath}" onclick="toggleFolderFiles('${folderId}', '${folderPath}')" style="cursor: pointer; color: #58a6ff; text-decoration: underline;">${folder}</span>: ${data.count}\n`;
        breakdownHTML += `<div id="${folderId}" class="folder-files" style="display: none;"></div>`;
        
        // Recursively add subfolders
        if (Object.keys(data.subfolders).length > 0) {
          buildFolderTree(data.subfolders, indentLevel + 1, folderPath);
        }
      });
    }
    
    buildFolderTree(pathBreakdown);
    return breakdownHTML.trim();
  }
  
  // Function to format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Function to update the display
  function updateDisplay() {
    const currentUnit = sizeUnits[currentUnitIndex];
    const convertedSize = (totalSizeBytes / currentUnit.divisor).toFixed(2);
    
    const pathBreakdownHTML = createPathBreakdownHTML();
    
    entryCountElem.innerHTML = `
      <div style="cursor: pointer;" onclick="showPathBreakdown()" title="Click to view detailed breakdown">
        Total amount: ${totalEntries} (${convertedSize} ${currentUnit.label})
      </div>
    `;
    
    // Store the breakdown HTML and files data globally so the popup can access it
    window.currentPathBreakdownHTML = pathBreakdownHTML;
    window.allFilesInFolders = allFilesInFolders;
    
    // Move to next unit, cycle back to beginning if at end
    currentUnitIndex = (currentUnitIndex + 1) % sizeUnits.length;
  }
  
  // Function to show path breakdown in popup
  window.showPathBreakdown = function() {
    const popup = window.open('', 'pathBreakdown', 'width=800,height=600,scrollbars=yes,resizable=yes');
    popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Breakdown of Categories - Omega Threat Archive</title>
        <style>
          :root {
            --bg-gradient-start: #000000;
            --bg-gradient-end: #050505;
            --text-color: #c9d1d9;
            --dim-text: #8b949e;
            --primary-accent: #58a6ff;
            --folder-hover-bg: #2c323c;
            --folder-shadow: #58a6ff88;
            --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            --font-size: 15px;
            --container-padding: 20px;
            --border-radius: 6px;
            --transition-fast: 0.3s;
          }
          body { 
            font-family: var(--font-family);
            font-size: var(--font-size);
            padding: var(--container-padding); 
            background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
            color: var(--text-color); 
            margin: 0;
            min-height: 100vh;
          }
          h1 { 
            color: var(--text-color); 
            border-bottom: 2px solid var(--primary-accent); 
            padding-bottom: 10px;
            margin-bottom: var(--container-padding);
            font-size: 1.4em;
          }
          pre { 
            white-space: pre-wrap; 
            line-height: 1.2;
            font-size: 14px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            color: var(--text-color);
          }
          .folder-item:hover {
            background-color: var(--folder-hover-bg);
            padding: 2px 4px;
            border-radius: 3px;
          }
          .file-item {
            padding: 0;
            border-left: 2px solid var(--dim-text);
            padding-left: 8px;
            line-height: 1.0;
            display: block;
          }
          .file-name {
            color: var(--text-color);
            font-weight: 500;
            display: inline;
          }
          .file-size {
            color: var(--dim-text);
            font-size: 12px;
            display: inline;
            margin-left: 8px;
          }
          .folder-files {
            margin-top: 5px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Omega Threat Archive - Breakdown</h1>
        <pre id="breakdown-content">${window.currentPathBreakdownHTML}</pre>
        <script>
          // Copy the files data to the popup window
          const allFilesInFolders = ${JSON.stringify(window.allFilesInFolders)};
          
          function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          }
          
          function toggleFolderFiles(folderId, folderPath) {
            const filesDiv = document.getElementById(folderId);
            
            if (filesDiv.style.display === 'none') {
              // Show files
              const files = allFilesInFolders[folderPath] || [];
              if (files.length > 0) {
                let filesHTML = '';
                // Get the indentation level from the folder path
                const pathParts = folderPath.split('/');
                const indent = '  '.repeat(pathParts.length);
                
                files.forEach(file => {
                  filesHTML += \`\<div class="file-item"><span class="file-name">\${file.name}</span><span class="file-size">\${formatFileSize(file.size)}</span></div>\`;
                });
                filesDiv.innerHTML = filesHTML;
              } else {
                const pathParts = folderPath.split('/');
                const indent = '  '.repeat(pathParts.length);
                filesDiv.innerHTML = \`\${indent}  <div style="color: #8b949e; font-style: italic;">No files found in this folder</div>\`;
              }
              filesDiv.style.display = 'block';
            } else {
              // Hide files
              filesDiv.style.display = 'none';
            }
          }
        </script>
      </body>
      </html>
    `);
    popup.document.close();
  };
  
  // Initial display
  updateDisplay();
  
  // Cycle through units every 10 seconds
  setInterval(updateDisplay, 10000);
});
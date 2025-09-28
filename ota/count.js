(function() {
    let currentUnitIndex = 0;
    
    // Array of size units and their conversion factors
    const sizeUnits = [
        { unit: 'B', divisor: 1, label: 'bytes' },
        { unit: 'KB', divisor: 1024, label: 'KB' },
        { unit: 'MB', divisor: 1024 * 1024, label: 'MB' },
        { unit: 'GB', divisor: 1024 * 1024 * 1024, label: 'GB' },
        { unit: 'TB', divisor: 1024 * 1024 * 1024 * 1024, label: 'TB' }
    ];
    
    // Function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Function to create path breakdown HTML with clickable folders
    function createPathBreakdownHTML(pathBreakdown) {
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
    
    // Function to update the display
    function updateDisplay(dataManager) {
        const entryCountElem = document.getElementById('entryCount');
        if (!entryCountElem) return;
        
        const totalEntries = dataManager.getTotalCount();
        const totalSizeBytes = dataManager.getTotalSize();
        const pathBreakdown = dataManager.getPathBreakdown();
        const allFilesInFolders = dataManager.getAllFilesInFolders();
        
        const currentUnit = sizeUnits[currentUnitIndex];
        const convertedSize = (totalSizeBytes / currentUnit.divisor).toFixed(2);
        
        const pathBreakdownHTML = createPathBreakdownHTML(pathBreakdown);
        
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
                                    filesHTML += \`<div class="file-item"><span class="file-name">\${file.name}</span><span class="file-size">\${formatFileSize(file.size)}</span></div>\`;
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
    
    // Initialize when shared data manager is ready
    function initialize() {
        if (window.sharedDataManager) {
            // Add listener for data updates
            window.sharedDataManager.addListener(updateDisplay);
            
            // Load data if not already loaded
            if (!window.sharedDataManager.isLoaded()) {
                window.sharedDataManager.loadData();
            }
            
            // Start cycling through units every 10 seconds
            setInterval(() => {
                if (window.sharedDataManager.isLoaded()) {
                    updateDisplay(window.sharedDataManager);
                }
            }, 10000);
        } else {
            // Retry in 100ms if shared data manager not ready
            setTimeout(initialize, 100);
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
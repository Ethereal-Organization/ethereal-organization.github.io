// Shared Data Manager - Load JSON files once and share across all components
class SharedDataManager {
    constructor() {
        this.data = null;
        this.loadPromise = null;
        this.listeners = new Set();
        
        // Configuration
        this.jsonFiles = [
            'OTA-PART-1/chunk_001.json',
            'OTA-PART-1/chunk_002.json',
            'OTA-PART-2/chunk_001.json',
            // Add more files when needed
        ];
        
        // Derived data caches
        this.totalCount = 0;
        this.totalSize = 0;
        this.pathBreakdown = {};
        this.allFilesInFolders = {};
        this.fileDownloadURLs = {};
        this.fileSizes = {};
        
        // Bind methods
        this.loadData = this.loadData.bind(this);
        this.getData = this.getData.bind(this);
        this.addListener = this.addListener.bind(this);
        this.removeListener = this.removeListener.bind(this);
        
        // Show console easter egg
        //this.showConsoleEasterEgg();
    }
    
	showConsoleEasterEgg() {
		// Wait a bit for console to be ready
		setTimeout(() => {
			const styles = {
				title: 'color: #58a6ff; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #58a6ff;',
				subtitle: 'color: #f0f6fc; font-size: 16px; font-weight: bold;',
				accent: 'color: #3fb950; font-weight: bold;',
				dim: 'color: #8b949e; font-size: 12px;',
				warning: 'color: #f85149; font-weight: bold;',
				code: 'color: #79c0ff; font-family: monospace; background: #161b22; padding: 2px 4px; border-radius: 3px;',
				ascii: 'color: #58a6ff; font-family: monospace; font-size: 12px;'
			};

			const lines = [
				{ text: "Let's make it genuine. If you see this, just look into the network tab in your browser. See how the queries are only loaded once? Well it loaded for every file that needed it individually before, but now that we changed it with this, look how faster it loads! Give us more suggestions on how we can make this site faster and more user-friendly. Love,", style: 'subtitle' },
				{ text: '███████╗████████╗██╗  ██╗███████╗██████╗ ███████╗ █████╗ ██╗', style: 'ascii', instant: true },
				{ text: '██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝██╔══██╗██║', style: 'ascii', instant: true },
				{ text: '█████╗     ██║   ███████║█████╗  ██████╔╝█████╗  ███████║██║', style: 'ascii', instant: true },
				{ text: '██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ██╔══██║██║', style: 'ascii', instant: true },
				{ text: '███████╗   ██║   ██║  ██║███████╗██║  ██║███████╗██║  ██║███████╗', style: 'ascii', instant: true },
				{ text: '╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝', style: 'ascii', instant: true }
			];

			let printed = []; // store already completed lines

			function typeLine(line, style, callback) {
				// if instant: just print and continue
				if (line.instant) {
					printed.push({ text: line.text, style });
					console.clear();
					printed.forEach(l => console.log('%c' + l.text, styles[l.style]));
					if (callback) callback();
					return;
				}

				// typewriter effect for normal lines
				let i = 0;
				let buffer = '';

				function typeChar() {
					buffer += line.text[i];
					console.clear();
					printed.forEach(l => console.log('%c' + l.text, styles[l.style]));
					console.log('%c' + buffer, styles[style]);

					i++;
					if (i < line.text.length) {
						setTimeout(typeChar, 100);
					} else {
						printed.push({ text: line.text, style });
						if (callback) callback();
					}
				}

				if (line.text.length > 0) {
					typeChar();
				} else {
					printed.push({ text: line.text, style });
					if (callback) callback();
				}
			}

			function printLines(lines, index = 0) {
				if (index >= lines.length) return;
				typeLine(lines[index], lines[index].style, () => {
					setTimeout(() => printLines(lines, index + 1), 100);
				});
			}

			printLines(lines);
		}, 1000);
	}
    // Load JSON files once
    async loadData() {
        if (this.loadPromise) {
            return this.loadPromise;
        }
        
        this.loadPromise = this._loadDataInternal();
        return this.loadPromise;
    }
    
    async _loadDataInternal() {
        try {
            //console.log('SharedDataManager: Loading data...');
            
            const allData = await Promise.all(
                this.jsonFiles.map(file =>
                    fetch(file)
                        .then(response => {
                            if (!response.ok) throw new Error(`Failed to fetch ${file}`);
                            return response.json();
                        })
                        .then(data => {
                            if (Array.isArray(data)) {
                                //console.log(`SharedDataManager: Loaded ${data.length} entries from ${file}`);
                                return data;
                            }
                            //console.warn(`SharedDataManager: ${file} is not an array.`);
                            return [];
                        })
                        .catch(err => {
                            //console.error(`SharedDataManager: Error loading ${file}:`, err);
                            return [];
                        })
                )
            );
            
            // Flatten and store raw data
            this.data = allData.flat();
            //console.log(`SharedDataManager: Total entries loaded: ${this.data.length}`);
            
            // Process derived data
            this._processData();
            
            // Notify listeners
            this._notifyListeners();
            
            return this.data;
        } catch (error) {
            //console.error('SharedDataManager: Critical error loading data:', error);
            this.data = [];
            return this.data;
        }
    }
    
    _processData() {
        // Calculate totals
        this.totalCount = this.data.length;
        this.totalSize = this.data.reduce((sum, entry) => {
            const size = typeof entry.size === 'number' ? entry.size : 0;
            return sum + size;
        }, 0);
        
        // Build path breakdown and file mappings
        this.pathBreakdown = {};
        this.allFilesInFolders = {};
        this.fileDownloadURLs = {};
        this.fileSizes = {};
        
        this.data.forEach(entry => {
            // Store download URLs and sizes
            if (entry.name || entry.path) {
                const fileName = entry.name || entry.path.split('/').pop();
                if (entry.download_url) {
                    this.fileDownloadURLs[fileName] = entry.download_url;
                }
                if (typeof entry.size === 'number') {
                    this.fileSizes[fileName] = entry.size;
                }
            }
            
            // Build path structure
            if (entry.path) {
                this._processPath(entry);
            }
        });
        
        //console.log('SharedDataManager: Data processing complete');
        //console.log(`- Total entries: ${this.totalCount}`);
        //console.log(`- Total size: ${this.totalSize} bytes`);
        //console.log(`- Download URLs: ${Object.keys(this.fileDownloadURLs).length}`);
        //console.log(`- File sizes: ${Object.keys(this.fileSizes).length}`);
    }
    
    _processPath(entry) {
        const pathParts = entry.path.split('/');
        if (pathParts.length >= 2) {
            const folderParts = pathParts.slice(0, -1);
            const fileName = pathParts[pathParts.length - 1];
            
            // Build nested structure
            let currentLevel = this.pathBreakdown;
            let pathSoFar = '';
            
            folderParts.forEach((folder, index) => {
                pathSoFar += (index > 0 ? '/' : '') + folder;
                
                if (!currentLevel[folder]) {
                    currentLevel[folder] = { count: 0, subfolders: {} };
                }
                
                currentLevel[folder].count++;
                currentLevel = currentLevel[folder].subfolders;
                
                // Store files for each folder path
                if (!this.allFilesInFolders[pathSoFar]) {
                    this.allFilesInFolders[pathSoFar] = [];
                }
            });
            
            // Add file to complete folder path
            const completeFolderPath = folderParts.join('/');
            if (!this.allFilesInFolders[completeFolderPath]) {
                this.allFilesInFolders[completeFolderPath] = [];
            }
            this.allFilesInFolders[completeFolderPath].push({
                name: fileName,
                size: entry.size || 0,
                fullPath: entry.path
            });
        }
    }
    
    _notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this);
            } catch (error) {
                console.error('SharedDataManager: Error in listener callback:', error);
            }
        });
    }
    
    // Public API
    getData() {
        return this.data;
    }
    
    getTotalCount() {
        return this.totalCount;
    }
    
    getTotalSize() {
        return this.totalSize;
    }
    
    getPathBreakdown() {
        return this.pathBreakdown;
    }
    
    getAllFilesInFolders() {
        return this.allFilesInFolders;
    }
    
    getFileDownloadURLs() {
        return this.fileDownloadURLs;
    }
    
    getFileSizes() {
        return this.fileSizes;
    }
    
    // Check if data is loaded
    isLoaded() {
        return this.data !== null;
    }
    
    // Add listener for data load events
    addListener(callback) {
        this.listeners.add(callback);
        
        // If data is already loaded, call immediately
        if (this.isLoaded()) {
            try {
                callback(this);
            } catch (error) {
                console.error('SharedDataManager: Error in immediate listener callback:', error);
            }
        }
    }
    
    // Remove listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }
    
    // Get file info by name
    getFileInfo(fileName) {
        return this.data.find(entry => {
            const entryName = entry.name || entry.path?.split('/').pop();
            return entryName === fileName;
        });
    }
    
    // Search functionality
    searchFiles(query, filterKey = '') {
        if (!query && !filterKey) return this.data;
        
        return this.data.filter(entry => {
            const fileName = entry.name || entry.path?.split('/').pop() || '';
            const matchesSearch = !query || fileName.toLowerCase().includes(query.toLowerCase());
            
            // Add filter logic here if needed
            const matchesFilter = !filterKey; // Simplified - extend based on your filter logic
            
            return matchesSearch && matchesFilter;
        });
    }
}

// Create global instance
window.sharedDataManager = new SharedDataManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedDataManager;
}
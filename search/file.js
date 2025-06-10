// Mapping for internal file type codes to real-world extensions and descriptions
const fileTypeDescriptions = {
    // ... (rest of your fileTypeDescriptions, no change needed here)
    ".asp.": { description: "ASP.NET file", extension: "asp" },
    ".java.": { description: "Java source file", extension: "java" },
    ".js.": { description: "JavaScript file", extension: "js" },
    ".linux.": { description: "Linux executable", extension: "bin" },
    ".mac.": { description: "macOS application", extension: "app" },
    ".msil.": { description: "Microsoft Intermediate Language file", extension: "dll" },
    ".mssql.": { description: "Microsoft SQL Server script", extension: "sql" },
    ".msword.": { description: "Microsoft Word document with macros", extension: "docm" },
    ".mysql.": { description: "MySQL script", extension: "sql" },
    ".os2.": { description: "OS/2 executable", extension: "exe" },
    ".perl.": { description: "Perl script", extension: "pl" },
    ".php.": { description: "PHP script", extension: "php" },
    ".python.": { description: "Python script", extension: "py" },
    ".sunos.": { description: "SunOS executable", extension: "sun" },
    ".unix.": { description: "UNIX executable", extension: "sh" },
    ".vbs.": { description: "VBScript file", extension: "vbs" },
    ".win16.": { description: "16-bit Windows executable", extension: "exe" },
    ".win32.": { description: "32-bit Windows executable", extension: "exe" },
    ".win64.": { description: "64-bit Windows executable", extension: "exe" },
    ".bat.": { description: "Batch file", extension: "bat" }, // This key is ".bat."
    ".dos.": { description: "MS-DOS executable", extension: "com" },
    ".html.": { description: "HTML file", extension: "html" },
    ".multi.": { description: "Multi-platform executable", extension: "jar" },
    ".ruby.": { description: "Ruby script", extension: "rb" },
    ".script.": { description: "Script file", extension: "scr" },
    ".sap.": { description: "SAP application file", extension: "sap" },
    "eicar": { description: "Antivirus test file", extension: "eicar" },
    ".pif.": { description: "Program Information File", extension: "pif" },
    ".hta.": { description: "HTML Application", extension: "hta" },
    ".iis.": { description: "IIS script file", extension: "iis" },
    ".msexcel.": { description: "Microsoft Excel macro-enabled spreadsheet", extension: "xlsm" },
    ".msppoint.": { description: "Microsoft PowerPoint file", extension: "pptm" },
    ".shell.": { description: "Command-line script", extension: "cmd" },
    ".swf.": { description: "Adobe Flash file", extension: "swf" },
    ".freebsd.": { description: "FreeBSD executable", extension: "elf" },
    ".symbos.": { description: "Symbian OS executable", extension: "sis" },
    "password-protected": { description: "Password-protected executable", extension: "exe" },
    ".acad.": { description: "AutoCAD script", extension: "scr" },
    ".ansi.": { description: "ANSI text file", extension: "ans" },
    ".nsis.": { description: "NSIS installer script", extension: "nsi" },
    ".novell.": { description: "Novell NetWare executable", extension: "exe" },
    ".palm.": { description: "PalmOS application", extension: "prc" },
    ".ole2.": { description: "OLE2 compound document", extension: "doc" },
    ".rar.": { description: "RAR archive", extension: "rar" },
    ".win9x.": { description: "Windows 9x executable", extension: "exe" },
    ".asf.": { description: "ASF media file", extension: "asf" },
    ".wma.": { description: "Windows Media Audio file", extension: "wma" },
    ".osx.": { description: "Mac OS X application", extension: "app" },
    ".winreg.": { description: "Windows Registry file", extension: "reg" },
    ".j2me.": { description: "Mobile Java application", extension: "jar" },
    ".winhlp.": { description: "Windows Help file", extension: "hlp" },
    ".wininf.": { description: "Windows Setup Information file", extension: "inf" },
    ".winlnk.": { description: "Windows Shortcut file", extension: "lnk" },
    ".zip.": { description: "ZIP archive", extension: "zip" },
    ".msaccess.": { description: "Microsoft Access database", extension: "mdb" },
    ".abap.": { description: "ABAP program file", extension: "abap" },
    ".1c.": { description: "1C business application file", extension: "1cd" },
    ".amipro.": { description: "AmiPro document", extension: "wpd" },
    ".als.": { description: "AutoLISP script", extension: "lsp" },
    ".boot.": { description: "Unknown", extension: "" },
    ".ferite.": { description: "Ferite script file", extension: "fer" },
    ".dos32.": { description: "32-bit DOS executable", extension: "exe" },
    ".kix.": { description: "KiXtart script", extension: "kix" },
    ".makefile.": { description: "Makefile script", extension: "mak" },
    ".matlab.": { description: "MATLAB script", extension: "m" },
    ".mel.": { description: "Maya Embedded Language script", extension: "mel" },
    ".menuet.": { description: "MenuetOS executable", extension: "mu" },
    ".msh.": { description: "PowerShell script", extension: "ps1" },
    ".msoffice.": { description: "Microsoft Office document", extension: "docx" },
    ".sgold.": { description: "Presumed Sgold assembler file?", extension: "sgd" },
    ".staroffice.": { description: "StarOffice document", extension: "sdo" },
    ".swscript.": { description: "SwScript file", extension: "sws" },
    ".tsql.": { description: "Transact-SQL script", extension: "sql" },
    ".wbs.": { description: "Work Breakdown Structure file", extension: "wbs" },
    ".whs.": { description: "WinHEX script file", extension: "whs" },
    ".winpif.": { description: "Windows Program Information file", extension: "pif" },
    ".wince.": { description: "Windows CE application", extension: "exe" },
    ".irc.": { description: "Unknown", extension: "" },
    ".bas.": { description: "BASIC script", extension: "bas" },
    ".boot-dos.": { description: "MS-DOS executable", extension: "com" },
    ".ichitaro.": { description: "Ichitaro document", extension: "jtd" }
};

const explorer = document.getElementById("fileExplorer");
const searchInput = document.getElementById("searchBar");
const spinner = document.getElementById("spinner");
const itemsPerPageSelect = document.getElementById("itemsPerPage");
const filterField = document.getElementById("filterField"); // Added: Get the filter dropdown

let fullTree = [];

const DEFAULT_DISPLAY_LIMIT = 10;

/**
 * Normalizes a file type key to match the format used in fileTypeDescriptions.
 * Adds leading/trailing dots if they are missing, unless it's a known exception like "eicar" or "password-protected".
 * @param {string} key - The raw type key from the JSON data.
 * @returns {string} The normalized key.
 */
function normalizeFileTypeKey(key) {
    if (!key) return "";
    key = key.toLowerCase(); // Ensure lowercase for consistency

    // Handle specific exceptions that don't use dots
    if (key === "eicar" || key === "password-protected") {
        return key;
    }

    // Add leading dot if missing
    if (!key.startsWith(".")) {
        key = "." + key;
    }
    // Add trailing dot if missing
    if (!key.endsWith(".")) {
        key = key + ".";
    }
    return key;
}


/**
 * Convert flat array with "path" strings into nested tree
 * IMPORTANT: This function expects 'item.type' to exist in your JSON data,
 * aligning with the keys in fileTypeDescriptions.
 */
function buildNestedTreeFromFlatArray(flatArray) {
    const root = {};

    flatArray.forEach(item => {
        const parts = item.path.split("/");
        let current = root;

        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = {
                    __type: index === parts.length - 1 ? "file" : "folder",
                    __children: {},
                    __data: null // __data will store the original item for files
                };
            }

            if (index === parts.length - 1) {
                // Store the original item, which should now contain 'type' if your JSON has it
                current[part].__data = item; 
            }

            current = current[part].__children;
        });
    });

    return root;
}

/**
 * Create a DOM node for folder or file, recursively build children
 */
function createNode(name, node, depth = 0, search = "") {
    const container = document.createElement("div");
    container.style.marginLeft = depth * 20 + "px";

    const isFolder = node.__type === "folder";
    const icon = isFolder ? "▶️" : "📄";

    const item = document.createElement("div");
    item.className = isFolder ? "folder" : "file";

    const iconSpan = document.createElement("span");
    iconSpan.className = "icon";
    iconSpan.textContent = icon;

    const label = document.createElement("span");
    label.className = "filename";
    label.textContent = name;

    item.appendChild(iconSpan);
    item.appendChild(label);

    if (!isFolder && node.__data) {
        // --- MODIFIED: Normalize the fileTypeKey before lookup ---
        const rawFileTypeKey = node.__data.type; 
        const fileTypeKey = normalizeFileTypeKey(rawFileTypeKey); // Use the new normalization function

        // console.log(`[createNode] Processing file: ${name}`); // Can remove now
        // console.log(`[createNode] node.__data:`, node.__data); // Can remove now
        // console.log(`[createNode] rawFileTypeKey: "${rawFileTypeKey}"`); // Can remove now
        // console.log(`[createNode] normalized fileTypeKey: "${fileTypeKey}"`); // Can remove now

        const fileInfo = fileTypeDescriptions[fileTypeKey];
        // console.log(`[createNode] fileInfo (lookup result from fileTypeDescriptions):`, fileInfo); // Can remove now
        // --- END MODIFIED ---

        if (fileInfo && fileInfo.description) {
            const descSpan = document.createElement("span");
            descSpan.className = "file-description";
            descSpan.textContent = ` ${fileInfo.description}`; // Added parentheses for better formatting
            label.appendChild(descSpan);
        }

        if (fileInfo && fileInfo.extension) {
            const extSpan = document.createElement("span");
            extSpan.className = "file-extension";
            extSpan.textContent = ` .${fileInfo.extension}`; // Added leading space for better formatting
            label.appendChild(extSpan);
        }
    }

    container.appendChild(item);

    if (isFolder) {
        item.style.cursor = "pointer";
        container.expanded = false;

        // Use a data attribute to track if children have been appended to this specific folder container
        container.dataset.childrenAppended = "false"; 

        item.addEventListener("click", () => {
            // Only append children if they haven't been appended yet for this folder instance
            if (container.dataset.childrenAppended === "false") {
                // Clear any old child nodes first, before re-appending during a refresh from search/filter
                // This prevents duplicates if the folder was already expanded in a previous state
                // However, be careful not to remove the folder's own header (item div)
                while (container.children.length > 1) { // Keep the first child (the folder header)
                    container.removeChild(container.lastChild);
                }

                // Pass true for isLazy when expanding a folder to ensure its files are lazy loaded.
                // The children are built directly into this container.
                buildExplorerUI(node.__children, container, depth + 1, searchInput.value.trim().toLowerCase(), true, filterField.value);
                container.dataset.childrenAppended = "true"; // Mark children as appended
            }

            // Toggle expansion state and visibility of children (elements after the first one)
            container.expanded = !container.expanded;
            const children = Array.from(container.children).slice(1); // Get all children except the folder's own header
            children.forEach(c => {
                c.style.display = container.expanded ? "block" : "none";
            });

            iconSpan.textContent = container.expanded ? "▼" : "▶️";
        });
    } else {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
            if (node.__data && node.__data.download_url) {
                window.open(node.__data.download_url, "_blank");
            }
        });
    }

    return container;
}

/**
 * Recursively build file explorer UI with optional lazy loading for files only
 * @param {object} treeNode - The current node in the nested tree.
 * @param {HTMLElement} container - The DOM element to append nodes to.
 * @param {number} depth - Current depth in the tree.
 * @param {string} search - Current search query (lowercase).
 * @param {boolean} isLazy - Whether to lazy load files.
 * @param {string} selectedFilterKey - The actual key from fileTypeDescriptions (e.g., ".win32.").
 */
function buildExplorerUI(treeNode, container, depth = 0, search = "", isLazy = true, selectedFilterKey = "") {
    const entries = Object.entries(treeNode).filter(([key]) => !key.startsWith("__"));

    const folders = entries.filter(([_, value]) => value.__type === "folder");
    let files = entries.filter(([_, value]) => value.__type === "file"); 

    // First render all folders
    for (const [key, value] of folders) {
        // A folder should only be shown if it contains a file that matches both search and filter criteria.
        // hasMatchingFileDescendant will now correctly check for the 'key' string.
        if ((!search && !selectedFilterKey) || hasMatchingFileDescendant(value.__children, search.toLowerCase(), selectedFilterKey.toLowerCase())) {
            const nodeElement = createNode(key, value, depth, search);
            container.appendChild(nodeElement);

            // Folders are always initially collapsed by default. User must click to expand them.
            nodeElement.expanded = false;
        }
    }

    // Filter the 'files' array once based on search and filename string filter criteria
    const filteredFiles = files.filter(([key, value]) => {
        let matchesSearch = true;
        let matchesFilter = true;

        if (search) {
            matchesSearch = key.toLowerCase().includes(search.toLowerCase());
        }
        
        // Filter by the file's name INCLUDING the selectedFilterKey string
        if (selectedFilterKey) {
            matchesFilter = key.toLowerCase().includes(selectedFilterKey.toLowerCase());
        }

        const overallMatch = matchesSearch && matchesFilter;
        return overallMatch;
    });

    // Then render filtered files with lazy loading
    let displayedCount = 0;

    // Reset displayedFileCount for the current container if it's the initial render for this level
    // This is crucial for lazy loading to work correctly with filtered results
    if (container.dataset.filteredFileCount === undefined || container.dataset.lastSearch !== search || container.dataset.lastFilter !== selectedFilterKey) {
        container.dataset.filteredFileCount = 0;
        container.dataset.lastSearch = search;
        container.dataset.lastFilter = selectedFilterKey;
        // Also remove any existing "Show more" button if the filter/search changed
        const existingBtn = container.querySelector(".show-more-button");
        if (existingBtn) existingBtn.remove();
    }
    
    // Convert to number
    let currentDisplayedFilteredCount = parseInt(container.dataset.filteredFileCount, 10);

    const selectedLimit = parseInt(itemsPerPageSelect.value, 10) || DEFAULT_DISPLAY_LIMIT;
    const effectiveLazy = isLazy; // Lazy loading is enabled if `isLazy` is true

    const startIdx = currentDisplayedFilteredCount;
    const endIdx = effectiveLazy ? Math.min(startIdx + selectedLimit, filteredFiles.length) : filteredFiles.length;

    for (let i = startIdx; i < endIdx; i++) {
        const [key, value] = filteredFiles[i]; // Iterate over filteredFiles
        const nodeElement = createNode(key, value, depth, search);
        container.appendChild(nodeElement);
        displayedCount++;
    }

    container.dataset.filteredFileCount = currentDisplayedFilteredCount + displayedCount; // Update count in dataset

    // Show more button for lazy loading, always if 'effectiveLazy' is true and more items exist in the FILTERED list
    if (effectiveLazy && parseInt(container.dataset.filteredFileCount, 10) < filteredFiles.length) {
        const existingBtn = container.querySelector(".show-more-button");
        if (existingBtn) existingBtn.remove(); // Remove old button to prevent duplicates

        const showMoreBtn = document.createElement("button");
        showMoreBtn.textContent = `Show more files (${filteredFiles.length - parseInt(container.dataset.filteredFileCount, 10)} remaining)`;
        showMoreBtn.className = "show-more-button";
        showMoreBtn.style.marginLeft = (depth * 20) + "px";
        showMoreBtn.style.marginTop = "5px";

        showMoreBtn.addEventListener("click", () => {
            showMoreBtn.remove();
            // Pass current search and filter context when showing more, keep isLazy true
            buildExplorerUI(treeNode, container, depth, search, true, selectedFilterKey);
        });

        container.appendChild(showMoreBtn);
    } else {
        // If all items are displayed or lazy loading is not effective, ensure no show more button
        const existingBtn = container.querySelector(".show-more-button");
        if (existingBtn) existingBtn.remove();
    }
}

/**
 * Recursively check if a node or any of its descendants are files matching search AND filter (by filename string)
 * @param {object} node - The current node in the nested tree.
 * @param {string} searchLower - Current search query (lowercase).
 * @param {string} selectedFilterKeyLower - The lowercase internal key string (e.g., ".win32.").
 * @returns {boolean} - True if a relevant descendant file is found, false otherwise.
 */
function hasMatchingFileDescendant(node, searchLower, selectedFilterKeyLower) {
    for (const [key, value] of Object.entries(node)) {
        if (key.startsWith("__")) continue; // Skip internal properties

        // If the folder name itself matches the search, consider it relevant.
        if (value.__type === "folder" && searchLower && key.toLowerCase().includes(searchLower)) {
            return true;
        }

        if (value.__type === "file") {
            let matchesSearch = true;
            let matchesFilter = true;

            if (searchLower) {
                matchesSearch = key.toLowerCase().includes(searchLower);
            }
            
            // Check if the filename INCLUDES the selectedFilterKey string
            if (selectedFilterKeyLower) {
                // Now, when checking for a match, we should normalize the file's type from its __data.type
                // and see if it matches the normalized selectedFilterKeyLower.
                // Or, more simply, check if the file's raw filename string contains the filter key string.
                // The current implementation checks if the *filename* itself contains the filter key string.
                // Let's ensure this logic correctly uses the 'type' for filtering if that was the intent.
                // For now, assuming the original intent was filename inclusion.
                matchesFilter = key.toLowerCase().includes(selectedFilterKeyLower);
            }

            if (matchesSearch && matchesFilter) {
                return true; // Found a file that matches both search and filename key filter
            }
        } else if (value.__type === "folder") {
            // Recursively check subfolders
            if (hasMatchingFileDescendant(value.__children, searchLower, selectedFilterKeyLower)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Load your JSON file, build tree, render explorer
 */
async function loadExplorer() {
    try {
        spinner.style.display = "block";

        const response = await fetch("files.json");
        if (!response.ok) throw new Error("Failed to load files.json");

        fullTree = await response.json();
        const nestedTree = buildNestedTreeFromFlatArray(fullTree);

        explorer.innerHTML = "";
        // Pass the actual key string to buildExplorerUI
        buildExplorerUI(nestedTree, explorer, 0, searchInput.value.trim().toLowerCase(), true, filterField.value);
    } catch (error) {
        console.error(error);
        explorer.textContent = "Failed to load file explorer.";
    } finally {
        spinner.style.display = "none";
    }
}

// Event listener for the search input
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedFilterKey = filterField.value; // This is now the internal key (e.g., ".win32.")
    explorer.innerHTML = "";
    // Reset dataset properties on the main explorer when search changes
    explorer.dataset.filteredFileCount = 0;
    explorer.dataset.lastSearch = query;
    explorer.dataset.lastFilter = selectedFilterKey; // Store the key here

    const nestedTree = buildNestedTreeFromFlatArray(fullTree); 
    buildExplorerUI(nestedTree, explorer, 0, query, true, selectedFilterKey);
});

// Event listener for the items per page dropdown
itemsPerPageSelect.addEventListener("change", () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedFilterKey = filterField.value; // This is now the internal key
    explorer.innerHTML = "";
    // Reset dataset properties on the main explorer when items per page changes
    explorer.dataset.filteredFileCount = 0;
    explorer.dataset.lastSearch = query;
    explorer.dataset.lastFilter = selectedFilterKey; // Store the key here

    const nestedTree = buildNestedTreeFromFlatArray(fullTree);
    buildExplorerUI(nestedTree, explorer, 0, query, true, selectedFilterKey);
});

// New event listener for the filter by type dropdown
filterField.addEventListener("change", () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedFilterKey = filterField.value; // This is now the internal key
    explorer.innerHTML = "";
    // Reset dataset properties on the main explorer when filter changes
    explorer.dataset.filteredFileCount = 0;
    explorer.dataset.lastSearch = query;
    explorer.dataset.lastFilter = selectedFilterKey; // Store the key here

    const nestedTree = buildNestedTreeFromFlatArray(fullTree);
    buildExplorerUI(nestedTree, explorer, 0, query, true, selectedFilterKey);
});

// Helper function to populate the filter dropdown options
function populateFilterOptions() {
    const sortedEntries = Object.entries(fileTypeDescriptions)
        .sort(([, a], [, b]) => a.description.localeCompare(b.description));

    // Add a default "All Types" option at the beginning
    const defaultOption = document.createElement('option');
    defaultOption.value = ""; // Empty value means no filter
    defaultOption.textContent = "All File Types";
    filterField.appendChild(defaultOption);

    sortedEntries.forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key; // Set value to the actual internal key (e.g., ".win32.")
        option.textContent = value.extension ?
            `${value.description} (.${value.extension})` :
            value.description;
        filterField.appendChild(option);
    });
}

// Ensure filter options are populated and explorer is loaded when the DOM is ready
window.addEventListener("DOMContentLoaded", () => {
    populateFilterOptions();
    loadExplorer();
});
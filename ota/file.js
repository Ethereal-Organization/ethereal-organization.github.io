// Updated file.js - Uses shared data manager

// Constants defined before the main object
const androidMistake = { description: "Android executable file", extensions: ["apk", "xapk", "apks"] };
const powershell = { description: "PowerShell script", extensions: ["ps1", "psm1", "psd1", "ps1xml"] };

// Mapping for internal file type codes to real-world extensions and descriptions
const fileTypeDescriptions = {
    ".asp.": { description: "Active Server Pages file", extensions: ["asp", "aspx"] },
    ".java.": { description: "Java source file", extensions: ["java", "class", "jar"] },
    ".js.": { description: "JavaScript file", extensions: ["js", "mjs", "jsx"] },
    ".linux.": { description: "Linux executable", extensions: ["", "bin", "run", "AppImage", "elf"] },
    ".mac.": { description: "Classic Mac OS application", extensions: ["", "sit", "hqx"] },
    ".msil.": { description: "Microsoft Intermediate Language file", extensions: ["exe", "dll", "netmodule"] },
    ".mssql.": { description: "Microsoft SQL Server script", extensions: ["sql", "sqlproj"] },
    ".msword.": { description: "Microsoft Word 97-2003 document", extensions: ["doc", "dot", "docm", "dotm"] },
    ".mysql.": { description: "MySQL script", extensions: ["sql", "mysql"] },
    ".os2.": { description: "OS/2 executable", extensions: ["exe", "cmd"] },
    ".perl.": { description: "Perl script", extensions: ["pl", "pm", "perl", "plx"] },
    ".php.": { description: "PHP script", extensions: ["php", "php3", "php4", "php5", "phtml"] },
    ".python.": { description: "Python script", extensions: ["py", "pyc", "pyo", "pyw", "pyz"] },
    ".sunos.": { description: "Solaris/SunOS executable", extensions: ["", "sun"] },
    ".unix.": { description: "Unix shell script", extensions: ["sh", "bash", "csh", "ksh", "zsh", ""] },
    ".vbs.": { description: "VBScript file", extensions: ["vbs", "vbe", "wsf", "wsh"] },
    ".win16.": { description: "16-bit Windows executable", extensions: ["exe", "com", "scr"] },
    ".win32.": { description: "32-bit Windows executable", extensions: ["exe", "dll", "scr", "cpl", "ocx"] },
    ".win64.": { description: "64-bit Windows executable", extensions: ["exe", "dll", "scr", "sys"] },
    ".bat.": { description: "Batch file", extensions: ["bat", "cmd"] },
    ".dos.": { description: "MS-DOS executable", extensions: ["exe", "com", "bat"], keys: [".dos.", ".boot-dos."] },
    ".html.": { description: "HTML file", extensions: ["html", "htm", "xhtml", "shtml"] },
    ".multi.": { description: "Multi-platform executable", extensions: ["jar", "war", "ear"] },
    ".ruby.": { description: "Ruby script", extensions: ["rb", "rbw", "rake", "gemspec"] },
    ".script.": { description: "Generic script file", extensions: ["", "script", "run"] },
    ".sap.": { description: "SAP application file", extensions: ["sap", "abap", "sapscript"] },
    "eicar": { description: "EICAR antivirus test file", extensions: ["com", "txt", "eicar"] },
    ".pif.": { description: "Program Information File", extensions: ["pif", "exe"] },
    ".hta.": { description: "HTML Application", extensions: ["hta"] },
    ".iis.": { description: "Internet Information Services script", extensions: ["asp", "aspx", "ashx", "asmx"] },
    ".msexcel.": { description: "Microsoft Excel 97-2003 spreadsheet", extensions: ["xls", "xlt", "xlsm", "xltm", "xlam"] },
    ".msppoint.": { description: "Microsoft PowerPoint 97-2003 presentation", extensions: ["ppt", "pot", "pps", "pptm", "potm", "ppsm"] },
    ".shell.": { description: "Shell script", extensions: ["sh", "bash", "zsh", "fish", "csh"] },
    ".swf.": { description: "Adobe Flash file", extensions: ["swf", "fla", "flv"] },
    ".freebsd.": { description: "FreeBSD executable", extensions: ["", "bin"] },
    ".symbos.": { description: "Symbian OS application", extensions: ["sis", "sisx", "jar"] },
    "password-protected": { description: "Password-protected archive or executable", extensions: ["zip", "rar", "7z", "exe", "pdf"] },
    ".acad.": { description: "AutoCAD script", extensions: ["scr", "lsp", "dcl", "mnl"] },
    ".ansi.": { description: "ANSI text file", extensions: ["ans", "asc", "txt"] },
    ".nsis.": { description: "Nullsoft Scriptable Install System script", extensions: ["nsi", "nsh", "exe"] },
    ".novell.": { description: "Novell NetWare executable", extensions: ["nlm", "exe"] },
    ".palm.": { description: "Palm OS application", extensions: ["prc", "pdb", "pqa"] },
    ".ole2.": { description: "OLE2 compound document", extensions: ["doc", "xls", "ppt", "msi", "msp"] },
    ".rar.": { description: "WinRAR archive", extensions: ["rar", "rev"] },
    ".win9x.": { description: "Windows 9x executable", extensions: ["exe", "com", "scr", "pif"] },
    ".asf.": { description: "Advanced Systems Format media file", extensions: ["asf", "wmv", "wma"] },
    ".wma.": { description: "Windows Media Audio file", extensions: ["wma", "wmv", "asf"] },
    ".osx.": { description: "Mac OS X application", extensions: ["app", "dmg", "pkg", "mpkg"] },
    ".winreg.": { description: "Windows Registry file", extensions: ["reg", "pol", "adm"] },
    ".j2me.": { description: "Java 2 Micro Edition application", extensions: ["jar", "jad", "cod"] },
    ".winhlp.": { description: "Windows Help file", extensions: ["hlp", "chm", "cnt"] },
    ".wininf.": { description: "Windows Setup Information file", extensions: ["inf", "cab", "cat"] },
    ".winlnk.": { description: "Windows Shortcut file", extensions: ["lnk", "url"] },
    ".zip.": { description: "ZIP archive", extensions: ["zip", "zipx", "jar", "war"] },
    ".msaccess.": { description: "Microsoft Access database", extensions: ["mdb", "accdb", "mde", "accde", "mda", "adp"] },
    ".abap.": { description: "Advanced Business Application Programming file", extensions: ["abap", "inc", "prog"] },
    ".1c.": { description: "1C Enterprise configuration file", extensions: ["cf", "1cd", "dt", "epf"] },
    ".amipro.": { description: "Lotus AmiPro document", extensions: ["sam", "ami"] },
    ".als.": { description: "AutoLISP script", extensions: ["lsp", "dcl", "fas", "vlx"] },
    ".boot.": { description: "Boot sector infector", extensions: ["", "com", "exe"] },
    ".ferite.": { description: "Ferite script file", extensions: ["fe", "feh"] },
    ".dos32.": { description: "32-bit DOS extended executable", extensions: ["exe", "com"] },
    ".kix.": { description: "KiXtart script", extensions: ["kix", "kx32", "kx16"] },
    ".makefile.": { description: "Make build script", extensions: ["", "mk", "mak", "make"] },
    ".matlab.": { description: "MATLAB script", extensions: ["m", "mat", "fig", "mlx", "mlapp"] },
    ".mel.": { description: "Maya Embedded Language script", extensions: ["mel"] },
    ".menuet.": { description: "MenuetOS executable", extensions: [""] },
    ".msh.": powershell,
    ".msoffice.": { description: "Microsoft Office document", extensions: ["docx", "xlsx", "pptx", "doc", "xls", "ppt"] },
    ".sgold.": { description: "Siemens mobile application", extensions: [""] },
    ".staroffice.": { description: "Apache OpenOffice document", extensions: ["odt", "ods", "odp", "odg", "odf", "sxw", "sxc", "sxi"] },
    ".swscript.": { description: "SageScript file", extensions: ["sws"] },
    ".tsql.": { description: "Transact-SQL script", extensions: ["sql", "tsql"] },
    ".wbs.": { description: "Work Breakdown Structure file", extensions: ["wbs", "mpp"] },
    ".whs.": { description: "Windows script file", extensions: ["wsh", "wsf", "js", "vbs"] },
    ".winpif.": { description: "Windows Program Information File", extensions: ["pif", "exe"] },
    ".wince.": { description: "Windows CE application", extensions: ["exe", "cab", "inf"] },
    ".irc.": { description: "IRC worm/trojan", extensions: [""] },
    ".bas.": { description: "BASIC file", extensions: ["bas", "vb", "frm", "cls"] },
    ".boot-dos.": { description: "DOS boot sector infector", extensions: ["", "com", "exe"] },
    ".ichitaro.": { description: "Ichitaro word processor document", extensions: ["jtd", "jtt", "jfw"] },
    ".androidos.": androidMistake,
    ".pdf.": { description: "Portable Document Format", extensions: ["pdf"] },
    ".iphoneos.": { description: "iOS application", extensions: ["ipa", "app", "deb"] },
    ".rtf.": { description: "Rich Text Format document", extensions: ["rtf"] },
};

const explorer = document.getElementById("fileExplorer");
const searchInput = document.getElementById("searchBar");
const spinner = document.getElementById("spinner");
const itemsPerPageSelect = document.getElementById("itemsPerPage");
const filterField = document.getElementById("filterField");

const aliases = {
    ".adnroidos.": ".androidos.",
    ".boot-dos.": ".dos.",
    ".powershell.": ".msh."
};

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

    key = key.toLowerCase();

    if (key === "eicar" || key === "password-protected") {
        return key;
    }
    // Normalize any boot-dos variants to ".dos."
    if (key.startsWith("boot-dos")) {
        return ".dos.";
    }

    // Remove leading/trailing dots
    key = key.replace(/^\.+|\.+$/g, "");

    // Normalize underscores to dashes
    key = key.replace(/_/g, "-");

    // Option 2 (recommended): Keep dashes but ensure filter keys have dashes too
    const cleanedKey = key;

    // Extract first segment only
    const firstSegment = cleanedKey.split(".")[0];

    // Add dots for internal matching style
    const lookupKey = `.${firstSegment}.`;

    const aliases = {
        ".adnroidos.": ".androidos.",
        ".boot-dos.": ".dos.",
        ".powershell.": ".msh."
    };

    return aliases[lookupKey] || lookupKey;
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
 * Helper function to format extensions for display
 * @param {Array|string} extensions - The extensions array or single extension
 * @returns {string} Formatted extension string
 */
function formatExtensions(extensions) {
    if (!extensions) return "";
    
    // Handle both old single extension format and new extensions array format
    if (Array.isArray(extensions)) {
        // Filter out empty strings and format
        const validExts = extensions.filter(ext => ext && ext.trim() !== "");
        if (validExts.length === 0) return "";
        
        // Format each extension with a dot prefix, then join with commas
        return validExts.map(ext => `.${ext}`).join(", ");
    } else if (typeof extensions === "string" && extensions.trim() !== "") {
        // Legacy single extension support
        return `.${extensions}`;
    }
    
    return "";
}

/**
 * Create a DOM node for folder or file, recursively build children
 */
function createNode(name, node, depth = 0, search = "") {
    const container = document.createElement("div");
    container.style.marginLeft = depth * 20 + "px";

    const isFolder = node.__type === "folder";
    const icon = isFolder ? "📁" : "📄";

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
        const rawFileTypeKey = extractTypeFromVirusName(name); 
        const fileTypeKey = normalizeFileTypeKey(rawFileTypeKey);

        let fileInfo = fileTypeDescriptions[fileTypeKey];

        // Fallback for .boot-dos.
        if ((!fileInfo || !fileInfo.description) && fileTypeKey === ".boot-dos.") {
            fileInfo = fileTypeDescriptions[".dos."];
        }

        if (fileInfo && fileInfo.description) {
            const descSpan = document.createElement("span");
            descSpan.className = "file-description";
            descSpan.textContent = ` ${fileInfo.description}`;
            label.appendChild(descSpan);
        }

        // Updated extension handling to support both extensions array and legacy extension
        const extensions = fileInfo && (fileInfo.extensions || fileInfo.extension);
        const formattedExtensions = formatExtensions(extensions);
        
        if (formattedExtensions) {
            const extSpan = document.createElement("span");
            extSpan.className = "file-extension";
            extSpan.textContent = ` ${formattedExtensions}`;
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
                while (container.children.length > 1) { // Keep the first child (the folder header)
                    container.removeChild(container.lastChild);
                }

                // Pass true for isLazy when expanding a folder to ensure its files are lazy loaded.
                buildExplorerUI(node.__children, container, depth + 1, searchInput.value.trim().toLowerCase(), true, filterField.value);
                container.dataset.childrenAppended = "true"; // Mark children as appended
            }

            // Toggle expansion state and visibility of children
            container.expanded = !container.expanded;
            const children = Array.from(container.children).slice(1);
            children.forEach(c => {
                c.style.display = container.expanded ? "block" : "none";
            });

            iconSpan.textContent = container.expanded ? "📂" : "📁";
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

function extractTypeFromVirusName(virusName) {
    // virusName example: "Virus.Boot-DOS.Shrapnel.6067"
    const parts = virusName.split(".");

    // Virus name format:
    // [0] = "Virus"
    // [1..n-2] = type parts (might contain hyphens)
    // [n-1] = version or variant (e.g., 6067)
    // We'll join all parts except the first and last as type

    if (parts.length < 3) return ""; // Not enough parts to extract type

    // Extract parts between 1 and length-2 inclusive
    const typeParts = parts.slice(1, parts.length - 1);

    // Join type parts back with '.'
    const type = typeParts.join(".");

    return type.toLowerCase();
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
        if ((!search && !selectedFilterKey) || hasMatchingFileDescendant(value.__children, search.toLowerCase(), selectedFilterKey.toLowerCase())) {
            const nodeElement = createNode(key, value, depth, search);
            container.appendChild(nodeElement);
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
        
        // Filter by the file's type normalized against selectedFilterKey
        if (selectedFilterKey) {
            const rawType = extractTypeFromVirusName(key);
            const normalized = normalizeFileTypeKey(rawType);
            matchesFilter = normalized === selectedFilterKey.toLowerCase();
        }

        return matchesSearch && matchesFilter;
    });

    // Then render filtered files with lazy loading
    let displayedCount = 0;

    if (container.dataset.filteredFileCount === undefined || container.dataset.lastSearch !== search || container.dataset.lastFilter !== selectedFilterKey) {
        container.dataset.filteredFileCount = 0;
        container.dataset.lastSearch = search;
        container.dataset.lastFilter = selectedFilterKey;
        const existingBtn = container.querySelector(".show-more-button");
        if (existingBtn) existingBtn.remove();
    }
    
    // Disable lazy loading if "all" is selected
    const showAll = itemsPerPageSelect.value === "all";

    let currentDisplayedFilteredCount = parseInt(container.dataset.filteredFileCount, 10);
    const selectedLimit = parseInt(itemsPerPageSelect.value, 10) || DEFAULT_DISPLAY_LIMIT;
    const effectiveLazy = isLazy && !showAll;

    const startIdx = currentDisplayedFilteredCount;
    const endIdx = effectiveLazy ? Math.min(startIdx + selectedLimit, filteredFiles.length) : filteredFiles.length;

    for (let i = startIdx; i < endIdx; i++) {
        const [key, value] = filteredFiles[i];
        const nodeElement = createNode(key, value, depth, search);
        container.appendChild(nodeElement);
        displayedCount++;
    }

    container.dataset.filteredFileCount = currentDisplayedFilteredCount + displayedCount;

    if (effectiveLazy && parseInt(container.dataset.filteredFileCount, 10) < filteredFiles.length) {
        const existingBtn = container.querySelector(".show-more-button");
        if (existingBtn) existingBtn.remove();

        const showMoreBtn = document.createElement("button");
        showMoreBtn.textContent = `Show more files (${filteredFiles.length - parseInt(container.dataset.filteredFileCount, 10)} remaining)`;
        showMoreBtn.className = "show-more-button";
        showMoreBtn.style.marginLeft = (depth * 20) + "px";
        showMoreBtn.style.marginTop = "5px";

        showMoreBtn.addEventListener("click", () => {
            showMoreBtn.remove();
            buildExplorerUI(treeNode, container, depth, search, true, selectedFilterKey);
        });

        container.appendChild(showMoreBtn);
    } else {
        const existingBtn = container.querySelector(".show-more-button");
        if (existingBtn) existingBtn.remove();
    }
}

/**
 * Recursively check if a node or any of its descendants are files matching search AND filter
 */
function hasMatchingFileDescendant(node, searchLower, selectedFilterKeyLower) {
    for (const [key, value] of Object.entries(node)) {
        if (key.startsWith("__")) continue;

        // If the folder name itself matches the search, consider it relevant.
        if (value.__type === "folder" && searchLower && key.toLowerCase().includes(searchLower)) {
            return true;
        }

        if (value.__type === "file") {
            let matchesSearch = true;
            let matchesFilter = true;

            if (searchLower) {
                const filename = key.toLowerCase();
                const rawType = extractTypeFromVirusName(key);
                const normalizedType = normalizeFileTypeKey(rawType);
                matchesSearch =
                    filename.includes(searchLower) ||
                    rawType.includes(searchLower) ||
                    normalizedType.includes(searchLower);
            }

            if (selectedFilterKeyLower) {
                const rawType = extractTypeFromVirusName(key);
                const normalizedType = normalizeFileTypeKey(rawType);
                matchesFilter = normalizedType === selectedFilterKeyLower;
            }

            if (matchesSearch && matchesFilter) {
                return true;
            }
        } else if (value.__type === "folder") {
            if (hasMatchingFileDescendant(value.__children, searchLower, selectedFilterKeyLower)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Load explorer using shared data manager
 */
async function loadExplorer() {
    if (!window.sharedDataManager) {
        console.error('Shared data manager not available');
        explorer.textContent = "Data manager not available.";
        return;
    }

    try {
        spinner.style.display = "block";
        
        // Load data through shared manager
        await window.sharedDataManager.loadData();
        fullTree = window.sharedDataManager.getData();

        const nestedTree = buildNestedTreeFromFlatArray(fullTree);
        explorer.innerHTML = "";
        buildExplorerUI(
            nestedTree,
            explorer,
            0,
            searchInput.value.trim().toLowerCase(),
            true,
            filterField.value
        );
    } catch (error) {
        console.error("Critical error loading explorer:", error);
        explorer.textContent = "Failed to load file explorer.";
    } finally {
        spinner.style.display = "none";
    }
}

// Event listener for the search input
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedFilterKey = filterField.value;
    explorer.innerHTML = "";
    explorer.dataset.filteredFileCount = 0;
    explorer.dataset.lastSearch = query;
    explorer.dataset.lastFilter = selectedFilterKey;

    if (fullTree.length > 0) {
        const nestedTree = buildNestedTreeFromFlatArray(fullTree); 
        buildExplorerUI(nestedTree, explorer, 0, query, true, selectedFilterKey);
    }
});

// Event listener for the items per page dropdown
itemsPerPageSelect.addEventListener("change", () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedFilterKey = filterField.value;
    explorer.innerHTML = "";
    explorer.dataset.filteredFileCount = 0;
    explorer.dataset.lastSearch = query;
    explorer.dataset.lastFilter = selectedFilterKey;

    if (fullTree.length > 0) {
        const nestedTree = buildNestedTreeFromFlatArray(fullTree);
        buildExplorerUI(nestedTree, explorer, 0, query, true, selectedFilterKey);
    }
});

// Event listener for the filter by type dropdown
filterField.addEventListener("change", () => {
    const query = searchInput.value.trim().toLowerCase();
    const selectedFilterKey = filterField.value;
    explorer.innerHTML = "";
    explorer.dataset.filteredFileCount = 0;
    explorer.dataset.lastSearch = query;
    explorer.dataset.lastFilter = selectedFilterKey;

    if (fullTree.length > 0) {
        const nestedTree = buildNestedTreeFromFlatArray(fullTree);
        buildExplorerUI(nestedTree, explorer, 0, query, true, selectedFilterKey);
    }
});

// Helper function to populate the filter dropdown options
function populateFilterOptions() {
    const sortedEntries = Object.entries(fileTypeDescriptions)
        .filter(([key, _]) => !key.toLowerCase().includes("boot-dos"))
        .sort(([, a], [, b]) => a.description.localeCompare(b.description));

    // Add a default "All Types" option at the beginning
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "All File Types";
    filterField.appendChild(defaultOption);

    sortedEntries.forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        
        const extensions = value.extensions || (value.extension ? [value.extension] : []);
        const formattedExtensions = formatExtensions(extensions);
        
        option.textContent = formattedExtensions ?
            `${value.description} (${formattedExtensions})` :
            value.description;
        filterField.appendChild(option);
    });
}

// Initialize when shared data manager is ready
function initialize() {
    populateFilterOptions();
    
    if (window.sharedDataManager) {
        // Add listener for data updates
        window.sharedDataManager.addListener((dataManager) => {
            fullTree = dataManager.getData();
            if (fullTree.length > 0) {
                const nestedTree = buildNestedTreeFromFlatArray(fullTree);
                explorer.innerHTML = "";
                buildExplorerUI(nestedTree, explorer, 0, searchInput.value.trim().toLowerCase(), true, filterField.value);
            }
        });
        
        // Load initial data
        loadExplorer();
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
// Define GitHub repo parameters
const owner = "ethereal-organization";
const repo = "omega-threat-archive";
const branch = "main";

// Get DOM elements
const explorer = document.getElementById("fileExplorer");
const searchInput = document.getElementById("searchBar");
const spinner = document.getElementById("spinner");

// Mapping for internal file type codes to real-world extensions and descriptions
const fileTypeDescriptions = {
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
  ".bat.": { description: "Batch file", extension: "bat" },
  ".dos.": { description: "MS-DOS executable", extension: "com" },
  ".html.": { description: "HTML file", extension: "html" },
  ".multi.": { description: "Multi-platform executable", extension: "jar" },
  ".ruby.": { description: "Ruby script", extension: "rb" },
  ".script.": { description: "Script file", extension: "scr" },
  ".sap.": { description: "SAP application file", extension: "sap" },
  ".eicar.": { description: "Antivirus test file", extension: "eicar" },
  ".pif.": { description: "Program Information File", extension: "pif" },
  ".hta.": { description: "HTML Application", extension: "hta" },
  ".iis.": { description: "IIS script file", extension: "iis" },
  ".msexcel.": { description: "Microsoft Excel macro-enabled spreadsheet", extension: "xlsm" },
  ".msppoint.": { description: "Microsoft PowerPoint file", extension: "pptm" },
  ".shell.": { description: "Command-line script", extension: "cmd" },
  ".swf.": { description: "Adobe Flash file", extension: "swf" },
  ".freebsd.": { description: "FreeBSD executable", extension: "elf" },
  ".symbos.": { description: "Symbian OS executable", extension: "sis" },
  "password-protected": { description: "Password-protected executable", extension: "password-protected" },
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
  ".basic.": { description: "Basic source code file", extension: "bas" },
  ".amipro.": { description: "AmiPro document", extension: "wpd" },
  ".als.": { description: "AutoLISP script", extension: "lsp" },
  ".boot.": { description: "Startup program file", extension: "sys" },
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
  "EICAR": { description: "EICAR test file", extension: "eicar" }
};

// Stores the complete file tree pulled from the GitHub repo
let fullTree = [];

/**
 * Extracts the custom "file type" segment from a malware-style name.
 * E.g., "Virus.DOS.Something" -> "dos"
 */
function extractExtensionFromFilename(filename) {
  const segments = filename.toLowerCase().split('.');
  if (segments.length >= 3) {
    return segments[1]; // Assumes format: NAME.TYPE.ID
  }
  return null;
}


/**
 * Fetches the entire tree of files/folders from GitHub (recursively)
 */
async function fetchFullRepoTree() {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  const data = await res.json();
  // Filter out README and keep only files and folders
  return data.tree.filter(item =>
    (item.type === "blob" || item.type === "tree") &&
    !(item.type === "blob" && item.path.toLowerCase() === "readme.md")
  );
}

/**
 * Converts the flat file tree from GitHub into a nested object tree
 */
function buildNestedTree(tree) {
  const root = {};
  tree.forEach(item => {
    const parts = item.path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {
          __type: i === parts.length - 1 ? item.type : "tree",
          __children: {},
          __path: item.path
        };
      }
      current = current[part].__children;
    }
  });
  return root;
}

function getInternalKeyFromName(name) {
  // Find the first matching internal key from the fileTypeDescriptions
  // Skip special keys like "password-protected" and "EICAR"
  for (const key in fileTypeDescriptions) {
    if (key === "password-protected" || key === "EICAR") continue;
    const trimmedKey = key.replace(/\./g, "");
    if (name.toLowerCase().includes(trimmedKey)) {
      return key;  // Return the matched key
    }
  }
  return null;
}

function createNode(name, node, depth = 0, search = "") {
  const container = document.createElement("div");
  container.style.marginLeft = depth * 20 + "px";

  const isFolder = node.__type === "tree";
  const icon = isFolder ? "▶️" : "📄";

  const item = document.createElement("div");
  item.className = isFolder ? "folder" : "file";

  const iconSpan = document.createElement("span");
  iconSpan.className = "icon";
  iconSpan.textContent = icon;

  const label = document.createElement("span");
  label.className = "filename";
  label.textContent = name;

  let customExtSpan = null;

if (!isFolder) {
  // Use internal key lookup to find matching file type description
  const internalKey = getInternalKeyFromName(name);
  if (internalKey && fileTypeDescriptions[internalKey]) {
    const desc = fileTypeDescriptions[internalKey].description;
    const ext = fileTypeDescriptions[internalKey].extension;

    // Create extension span
    const extensionSpan = document.createElement("span");
    extensionSpan.className = "file-extension";
    extensionSpan.textContent = `.${ext}`;

    // Append the extensionSpan directly to the label
    label.appendChild(extensionSpan);

    // Create description span
    customExtSpan = document.createElement("span");
    customExtSpan.className = "custom-ext";
    customExtSpan.textContent = ` ${desc}`;
  }
}

  // Assemble node UI
  item.appendChild(iconSpan);
  item.appendChild(label);
  if (customExtSpan) item.appendChild(customExtSpan);
  container.appendChild(item);

  // Folder expand/collapse
  if (isFolder) {
    item.addEventListener("click", () => {
      const expanded = item.dataset.expanded === "true";
      item.dataset.expanded = !expanded;
      iconSpan.textContent = expanded ? "▶️" : "🔽";

      if (container.children.length > 1) {
        container.querySelectorAll(".nested").forEach(e => e.remove());
        return;
      }

      const childrenContainer = document.createElement("div");
      childrenContainer.className = "nested";

      const searchLower = search.toLowerCase();

      function matchesSearch(path) {
        const filename = path.split('/').pop().toLowerCase();
        return filename.includes(searchLower);
      }

      function filterChildren(node) {
        if (node.__type === "tree") {
          const filtered = {};
          for (const childName in node.__children) {
            const childNode = node.__children[childName];
            const filteredChild = filterChildren(childNode);
            if (filteredChild) filtered[childName] = filteredChild;
          }
          if (Object.keys(filtered).length === 0) return null;
          return {
            __type: "tree",
            __children: filtered,
            __path: node.__path,
          };
        } else {
          return matchesSearch(node.__path) ? node : null;
        }
      }

      for (const childName in node.__children) {
        const childNode = node.__children[childName];
        const filteredNode = search ? filterChildren(childNode) : childNode;
        if (filteredNode) {
          childrenContainer.appendChild(createNode(childName, filteredNode, depth + 1, search));
        }
      }

      container.appendChild(childrenContainer);
    });
  } else {
    // File click downloads the raw file
    item.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${node.__path}`;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  return container;
}
function getInternalKeyFromName(name) {
  for (const key in fileTypeDescriptions) {
    if (key === "password-protected" || key === "EICAR") continue;
    const trimmedKey = key.replace(/\./g, "");
    if (name.toLowerCase().includes(trimmedKey)) {
      return key;  // return the key, not extension
    }
  }
  return null;
}



/**
 * Renders the nested tree in the browser
 */
function displayTree(treeRoot, search = "") {
  explorer.innerHTML = "";
  spinner.style.display = "none";

  // Recursive render function
  function walk(node, name, depth = 0) {
    if (node.__type === "tree") {
      const filteredChildren = {};
      for (const childName in node.__children) {
        const childNode = node.__children[childName];
        const filteredNode = search ? (function filterChildren(node) {
          if (node.__type === "tree") {
            const filtered = {};
            for (const childName in node.__children) {
              const childNode = node.__children[childName];
              const filteredChild = filterChildren(childNode);
              if (filteredChild) filtered[childName] = filteredChild;
            }
            if (Object.keys(filtered).length === 0) return null;
            return {
              __type: "tree",
              __children: filtered,
              __path: node.__path,
            };
          } else {
            const filename = node.__path.split('/').pop().toLowerCase();
            return filename.includes(search.toLowerCase()) ? node : null;
          }
        })(childNode) : childNode;

        if (filteredNode) {
          filteredChildren[childName] = filteredNode;
        }
      }

      if (Object.keys(filteredChildren).length === 0) return null;

      const filteredNode = {
        __type: "tree",
        __children: filteredChildren,
        __path: node.__path,
      };

      return createNode(name, filteredNode, depth, search);
    } else {
      const filename = node.__path.split('/').pop().toLowerCase();
      if (!search || filename.includes(search.toLowerCase())) {
        return createNode(name, node, depth, search);
      }
      return null;
    }
  }

  // Render all top-level items
  for (const name in treeRoot) {
    const node = treeRoot[name];
    const el = walk(node, name);
    if (el) explorer.appendChild(el);
  }
}

// Handle search input changes
searchInput.addEventListener("input", () => {
  displayTree(buildNestedTree(fullTree), searchInput.value);
});

// Initial load
(async () => {
  spinner.style.display = "block";
  try {
    fullTree = await fetchFullRepoTree();
    const nested = buildNestedTree(fullTree);
    displayTree(nested);
  } catch (e) {
    explorer.innerHTML = "<div style='color: red;'>Failed to load file tree.</div>";
    console.error(e);
  } finally {
    spinner.style.display = "none";
  }
})();

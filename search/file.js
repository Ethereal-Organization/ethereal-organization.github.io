const owner = "ethereal-organization";
const repo = "omega-threat-archive";
const branch = "main";

const explorer = document.getElementById("fileExplorer");
const searchInput = document.getElementById("searchBar");
const spinner = document.getElementById("spinner");

let fullTree = [];

async function fetchFullRepoTree() {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  const data = await res.json();
    return data.tree.filter(item => 
    (item.type === "blob" || item.type === "tree") && 
    !(item.type === "blob" && item.path.toLowerCase() === "readme.md")
  );
}

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

function createNode(name, node, depth = 0, search = "") {
  const container = document.createElement("div");
  container.style.marginLeft = depth * 20 + "px";

  const isFolder = node.__type === "tree";
  const icon = isFolder ? "▶️" : "📄";

  const item = document.createElement("div");
  item.className = isFolder ? "folder" : "file";
  item.innerHTML = `<span class="icon">${icon}</span><span>${name}</span>`;
  container.appendChild(item);

  if (isFolder) {
    item.addEventListener("click", () => {
      const expanded = item.dataset.expanded === "true";
      item.dataset.expanded = !expanded;
      item.querySelector(".icon").textContent = expanded ? "▶️" : "🔽";

      if (container.children.length > 1) {
        // Remove children if collapsing
        container.querySelectorAll(".nested").forEach(e => e.remove());
        return;
      }

      const childrenContainer = document.createElement("div");
      childrenContainer.className = "nested";

      // Filter children by search on expansion
      const filteredChildren = {};
      const searchLower = search.toLowerCase();

      // Helper to check if file name includes search
      function matchesSearch(path) {
        const filename = path.split('/').pop().toLowerCase();
        return filename.includes(searchLower);
      }

      // Recursively filter children
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
    item.dataset.ext = name.split('.').pop().toLowerCase(); // badge
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

function displayTree(treeRoot, search = "") {
  explorer.innerHTML = "";
  spinner.style.display = "none";

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

  for (const name in treeRoot) {
    const node = treeRoot[name];
    const el = walk(node, name);
    if (el) explorer.appendChild(el);
  }
}

searchInput.addEventListener("input", () => {
  displayTree(buildNestedTree(fullTree), searchInput.value);
});

(async () => {
  spinner.style.display = "block"; // Show loading spinner
  try {
    fullTree = await fetchFullRepoTree();
    const nested = buildNestedTree(fullTree);
    displayTree(nested);
  } catch (e) {
    explorer.innerHTML = "<div style='color: red;'>Failed to load file tree.</div>";
    console.error(e);
  } finally {
    spinner.style.display = "none"; // Hide spinner if error
  }
})();

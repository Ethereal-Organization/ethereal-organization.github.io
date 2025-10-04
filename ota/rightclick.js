// Updated rightclick.js - Supports flat paths and proper folder removal

// == CONTEXT MENU SETUP ==
window.queuedFiles = window.queuedFiles || new Set();
window.fileDownloadURLs = window.fileDownloadURLs || {};
window.folderQueueState = window.folderQueueState || {};
window.fileSizes = window.fileSizes || {};

let fileDownloadURLs = {};
let fileSizes = {};

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
modalDialog.style.position = 'absolute';
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
closeButton.addEventListener('click', () => { modalOverlay.style.display = 'none'; });
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

function showModal() { modalOverlay.style.display = 'block'; centerModal(); }
window.addEventListener('resize', centerModal);
window.addEventListener('scroll', centerModal);

// == QUEUE SHARED STATE SETUP ==
const queuedFiles = window.queuedFiles;

// == SHARED DATA MANAGER INTEGRATION ==
function initializeDataFromSharedManager() {
  if(window.sharedDataManager && window.sharedDataManager.isLoaded()) {
    fileDownloadURLs = window.sharedDataManager.getFileDownloadURLs();
    fileSizes = window.sharedDataManager.getFileSizes();
    window.fileDownloadURLs = fileDownloadURLs;
    window.fileSizes = fileSizes;
  } else if(window.sharedDataManager) {
    window.sharedDataManager.addListener(() => {
      fileDownloadURLs = window.sharedDataManager.getFileDownloadURLs();
      fileSizes = window.sharedDataManager.getFileSizes();
      window.fileDownloadURLs = fileDownloadURLs;
      window.fileSizes = fileSizes;
    });
  } else {
    setTimeout(initializeDataFromSharedManager, 100);
  }
}

// == CONTEXT MENU LOGIC ==
function getFileNameFromElement(target) {
  const filenameEl = target.querySelector('.filename');
  if(!filenameEl) return 'Unknown';
  if(target.classList.contains('file')) {
    for(const node of filenameEl.childNodes) {
      if(node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') return node.textContent.trim();
    }
    return 'Unknown';
  } else return filenameEl.textContent.trim();
}

function buildContextMenu(target) {
  contextMenu.innerHTML = '';

  const isFolder = target.classList.contains('folder');
  const fileName = getFileNameFromElement(target);
  const fileNameLower = fileName.toLowerCase();

  const fileCount = isFolder 
    ? Array.from(queuedFiles).filter(fp => fp.toLowerCase() === fileNameLower || fp.toLowerCase().startsWith(fileNameLower + '/')).length
    : 0;

  const inQueue = isFolder ? (window.folderQueueState[fileName] || fileCount > 0) : queuedFiles.has(fileName);

  const menuOptions = [
    { label:'Open', action: t => t.click() },
    { label:'Properties', action: t => {
      const name = getFileNameFromElement(t);
      const type = isFolder ? 'Folder' : 'File';
      const size = isFolder ? '-' : (fileSizes[fileName] ? formatSize(fileSizes[fileName]) : 'Unknown');
      const dateModified = 'WIP';
      modalContent.innerHTML = '';
      modalContent.appendChild(createPropertyRow('Name:', name));
      modalContent.appendChild(createPropertyRow('Type:', type));
      if(!isFolder) {
        const descEl = t.querySelector('.file-description');
        const extEl = t.querySelector('.file-extension');
        modalContent.appendChild(createPropertyRow('Description:', descEl ? descEl.textContent.trim() : '-'));
        modalContent.appendChild(createPropertyRow('Extensions:', extEl ? extEl.textContent.trim() : '-'));
        modalContent.appendChild(createPropertyRow('Size:', size));
      } else {
        modalContent.appendChild(createPropertyRow('Size:', size));
      }
      modalContent.appendChild(createPropertyRow('Date modified:', dateModified));
      showModal();
    }},
    { label: inQueue ? (isFolder ? `Remove from queue (${fileCount} files)` : 'Remove from queue') : 'Add to queue',
      action: () => {
        if(isFolder) {
          if(inQueue) {
	    const removedCount = handleRemoveFromQueue(fileName, true);
	    if (removedCount > 0) window.folderQueueState[fileName] = false;
          } else {
            handleAddToQueue(fileName, true);
            window.folderQueueState[fileName] = true;
          }
        } else {
          if(inQueue) queuedFiles.delete(fileName);
          else queuedFiles.add(fileName);
        }
        buildContextMenu(target);
      }
    }
  ];

  menuOptions.forEach(({label, action}) => {
    const item = document.createElement('div');
    item.textContent = label;
    item.style.padding = '8px 16px';
    item.style.cursor = 'pointer';
    item.style.userSelect = 'none';
    item.style.transition = 'background-color 0.2s ease, color 0.2s ease';
    item.style.borderRadius = '2px';
    item.style.color = '#eee';
    item.addEventListener('mouseenter', () => { item.style.backgroundColor='#555'; item.style.color='#fff'; });
    item.addEventListener('mouseleave', () => { item.style.backgroundColor='transparent'; item.style.color='#eee'; });
    item.addEventListener('click', () => { action(target); hideContextMenu(); });
    contextMenu.appendChild(item);
  });
}

function showContextMenu(x,y){
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  contextMenu.style.top = `${y}px`;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.display='block';
  contextMenu.style.opacity='1';
  const rect=contextMenu.getBoundingClientRect();
  const vw=window.innerWidth, vh=window.innerHeight;
  if(rect.right>vw) contextMenu.style.left=`${Math.max(scrollLeft+10, x-rect.width)}px`;
  if(rect.bottom>vh) contextMenu.style.top=`${Math.max(scrollTop+10, y-rect.height)}px`;
  if(rect.left<0) contextMenu.style.left=`${scrollLeft+10}px`;
  if(rect.top<0) contextMenu.style.top=`${scrollTop+10}px`;
}

function hideContextMenu(){ contextMenu.style.display='none'; contextMenu.style.opacity='0'; }

document.addEventListener('contextmenu', e=>{
  const target=e.target.closest('.folder, .file');
  if(!target){ hideContextMenu(); return; }
  e.preventDefault();
  buildContextMenu(target);
  showContextMenu(e.pageX, e.pageY);
});

document.addEventListener('click', e=>{ if(!contextMenu.contains(e.target)) hideContextMenu(); });

function formatSize(bytes){ if(typeof bytes!=="number"||isNaN(bytes)) return "Unknown"; const units=["B","KB","MB","GB","TB"]; let i=0; while(bytes>=1024&&i<units.length-1){ bytes/=1024;i++;} return `${bytes.toFixed(1)} ${units[i]}`; }

// == Folder operations with flat paths ==
window.getAllFilesInFolder = function(folderName){
  return window.sharedDataManager ? window.sharedDataManager.getData()
    .filter(f=>f.path.toLowerCase()===folderName.toLowerCase()||f.path.toLowerCase().startsWith(folderName.toLowerCase()+'/'))
    .map(f=>f.path) : [];
};

window.handleAddToQueue = function(folderName, recursive=true){
  const files = window.getAllFilesInFolder(folderName);
  files.forEach(f=>queuedFiles.add(f));
  window.folderQueueState[folderName] = true;
  return files.length;
};

window.handleRemoveFromQueue = function(folderName, recursive=true){
  const files = window.getAllFilesInFolder(folderName);
  files.forEach(f=>queuedFiles.delete(f));
  window.folderQueueState[folderName] = false;
  return files.length;
};

// Initialize shared data
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initializeDataFromSharedManager);
else initializeDataFromSharedManager();

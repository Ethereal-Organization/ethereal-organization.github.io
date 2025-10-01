(function() {
    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let selectionBox = null;
    const DRAG_THRESHOLD = 5; 

    // --- Utility Functions ---

    // Create selection box element: Changed to position: absolute
    function createSelectionBox() {
        const box = document.createElement('div');
        box.id = 'drag-selection-box';
        box.style.cssText = `
            position: absolute;
            border: 2px solid #58a6ff;
            background-color: rgba(88, 166, 255, 0.1);
            pointer-events: none;
            z-index: 9999;
            visibility: hidden; 
            opacity: 0; 
            transition: opacity 0.05s; 
            box-shadow: 0 0 10px rgba(88, 166, 255, 0.3);
            box-sizing: border-box; 
        `;
        document.body.appendChild(box);
        return box;
    }

    // Highlight items within selection box
    function highlightSelectedItems(selectionRect) {
        if (!selectionRect) return;
        
        // Target file/folder items within the fileExplorer container
        const items = document.querySelectorAll('#fileExplorer .file, #fileExplorer .folder');

        // FIX: The intersection logic (itemRect) uses viewport-relative coordinates, 
        // so we must convert the page-relative selectionRect to viewport coordinates.
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        const viewportSelectionRect = {
            left: selectionRect.left - scrollX,
            top: selectionRect.top - scrollY,
            right: selectionRect.right - scrollX,
            bottom: selectionRect.bottom - scrollY
        };

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect(); // Viewport-relative

            // Check if item intersects with selection box (using the corrected viewport coordinates)
            const intersects = !(
                itemRect.right < viewportSelectionRect.left ||
                itemRect.left > viewportSelectionRect.right ||
                itemRect.bottom < viewportSelectionRect.top ||
                itemRect.top > viewportSelectionRect.bottom
            );

            if (intersects) {
                if (!item.classList.contains('drag-selected')) {
                    item.classList.add('drag-selected');
                    item.style.backgroundColor = 'rgba(88, 166, 255, 0.2)';
                    item.style.outline = '2px solid #58a6ff';
                }
            } else {
                if (item.classList.contains('drag-selected')) {
                    item.classList.remove('drag-selected');
                    item.style.backgroundColor = '';
                    item.style.outline = '';
                }
            }
        });
    }

    // Remove all drag highlights
    function removeHighlights() {
        const items = document.querySelectorAll('.drag-selected');
        items.forEach(item => {
            item.classList.remove('drag-selected');
            item.style.backgroundColor = '';
            item.style.outline = '';
        });
    }

    function getFileNameFromElement(target) {
        const filenameEl = target.querySelector('.filename');
        if (!filenameEl) return 'Unknown';
        
        if (target.classList.contains('file')) {
            for (const node of filenameEl.childNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                    return node.textContent.trim();
                }
            }
            return 'Unknown';
        } else {
            return filenameEl.textContent.trim();
        }
    }
    
    function addSelectedItemsToQueue() {
        // Ensure global state functions are available
        if (!window.queuedFiles || typeof window.handleAddToQueue !== 'function') return;

        const selectedItems = document.querySelectorAll('.drag-selected');
        let addedCount = 0;

        selectedItems.forEach(item => {
            const isFolder = item.classList.contains('folder');
            const fileName = getFileNameFromElement(item);

            if (fileName && fileName !== 'Unknown') {
                if (isFolder) {
                    const count = window.handleAddToQueue(fileName, true);
                    addedCount += count;
                    window.folderQueueState = window.folderQueueState || {};
                    window.folderQueueState[fileName] = true;
                } else {
                    window.queuedFiles.add(fileName);
                    addedCount++;
                }
            }
        });

        if (addedCount > 0 && typeof showNotification === 'function') {
            showNotification(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to queue`);
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #58a6ff, #3b82f6);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(88, 166, 255, 0.4);
            z-index: 15000;
            animation: slideInRight 0.3s ease forwards;
            font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
        `;
        notification.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        if (!document.getElementById('drag-select-animations')) {
            style.id = 'drag-select-animations';
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // --- Core Drag Logic ---

    function attachDragListeners() {
        selectionBox = createSelectionBox();

        // MOUSE DOWN on DOCUMENT: Start the drag process globally
        document.addEventListener('mousedown', (e) => {
            // Only start drag if not on an interactive element and not right click
            const target = e.target.closest('.file, .folder, button, input, a, .download-panel, #custom-context-menu, .settings');
            if (e.button !== 0 || target) {
                return; 
            }
            
            isSelecting = true;
            
            // FIX: Use pageX/Y for absolute positioning relative to the document
            startX = e.pageX;
            startY = e.pageY;
            
            document.body.style.userSelect = 'none'; // Prevent text selection
            document.body.style.cursor = 'crosshair'; // Change cursor
            
            // Clear previous selections if CTRL/CMD key is not held
            if (!e.ctrlKey && !e.metaKey) {
                removeHighlights();
            }
        });

        // MOUSE MOVE on DOCUMENT: Draw the selection box
        document.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;

            // FIX: Use pageX/Y for absolute positioning relative to the document
            const currentX = e.pageX;
            const currentY = e.pageY;

            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            selectionBox.style.left = `${left}px`;
            selectionBox.style.top = `${top}px`;
            selectionBox.style.width = `${width}px`;
            selectionBox.style.height = `${height}px`;
            selectionBox.style.visibility = 'visible';
            selectionBox.style.opacity = '1';

            // Pass the page-relative selection rectangle to the highlight function
            highlightSelectedItems({ left, top, right: left + width, bottom: top + height });
        });

        // MOUSE UP on DOCUMENT: End the drag process
        document.addEventListener('mouseup', (e) => {
            if (!isSelecting) return;

            isSelecting = false;
            selectionBox.style.opacity = '0';
            selectionBox.style.visibility = 'hidden'; 

            // Restore default styles
            document.body.style.userSelect = '';
            document.body.style.cursor = ''; 
            
            if (window.getSelection) window.getSelection().removeAllRanges();

            // Check if it was a drag (not just a click)
            // FIX: Use pageX/Y to compare against the page-relative start coordinates
            const finalDx = Math.abs(e.pageX - startX);
            const finalDy = Math.abs(e.pageY - startY);

            if (finalDx >= DRAG_THRESHOLD || finalDy >= DRAG_THRESHOLD) {
                 addSelectedItemsToQueue();
            } else {
                 removeHighlights();
            }
        });

        // Handle escape key to cancel selection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isSelecting) {
                isSelecting = false;
                
                selectionBox.style.opacity = '0';
                selectionBox.style.visibility = 'hidden';
                
                // Restore default styles
                document.body.style.userSelect = '';
                document.body.style.cursor = ''; 
                removeHighlights();
            }
        });
    }

    // --- Initialization ---
    
    function initialize() { attachDragListeners(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
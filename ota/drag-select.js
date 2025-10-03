(function() {
    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let selectionBox = null;
    const DRAG_THRESHOLD = 5; 

    // Get body margin offset with cursor alignment adjustment
    function getBodyOffset() {
        const bodyStyles = window.getComputedStyle(document.body);
        const ALIGNMENT_OFFSET = 27; // Shift left to align with cursor
        return {
            left: (parseFloat(bodyStyles.marginLeft) || 0) + ALIGNMENT_OFFSET,
            top: parseFloat(bodyStyles.marginTop) || 0
        };
    }

    // Create selection box element with locked styles
    function createSelectionBox() {
        const box = document.createElement('div');
        box.id = 'drag-selection-box';
        
        // Set initial styles
        const initialStyles = {
            position: 'absolute',
            border: '2px solid #58a6ff',
            backgroundColor: 'rgba(88, 166, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: '9999',
            visibility: 'hidden',
            opacity: '0',
            transition: 'opacity 0.05s',
            boxShadow: '0 0 10px rgba(88, 166, 255, 0.3)',
            boxSizing: 'border-box',
            margin: '0',
            padding: '0',
            top: '0',
            left: '0',
            width: '0',
            height: '0'
        };
        
        // Apply styles
        Object.assign(box.style, initialStyles);
        
        document.body.appendChild(box);
        
        // Lock the styles - prevent any modifications
        const lockedProperties = ['position', 'border', 'backgroundColor', 'pointerEvents', 
                                  'zIndex', 'transition', 'boxShadow', 'boxSizing', 
                                  'margin', 'padding'];
        
        lockedProperties.forEach(prop => {
            Object.defineProperty(box.style, prop, {
                get: function() { return initialStyles[prop]; },
                set: function() { return initialStyles[prop]; },
                configurable: false
            });
        });
        
        return box;
    }

    // Highlight items within selection box
    function highlightSelectedItems(selectionRect) {
        if (!selectionRect) return;
        
        const items = document.querySelectorAll('#fileExplorer .file, #fileExplorer .folder');
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        const viewportSelectionRect = {
            left: selectionRect.left - scrollX,
            top: selectionRect.top - scrollY,
            right: selectionRect.right - scrollX,
            bottom: selectionRect.bottom - scrollY
        };

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
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

    // Update selection box position (only function allowed to modify it)
    function updateSelectionBox(left, top, width, height, visible) {
        if (!selectionBox) return;
        
        // Force set properties directly bypassing any locks
        selectionBox.style.cssText = `
            position: absolute !important;
            left: ${left}px !important;
            top: ${top}px !important;
            width: ${width}px !important;
            height: ${height}px !important;
            visibility: ${visible ? 'visible' : 'hidden'} !important;
            opacity: ${visible ? '1' : '0'} !important;
            border: 2px solid #58a6ff !important;
            background-color: rgba(88, 166, 255, 0.1) !important;
            pointer-events: none !important;
            z-index: 9999 !important;
            transition: opacity 0.05s !important;
            box-shadow: 0 0 10px rgba(88, 166, 255, 0.3) !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
        `;
    }

    // Core drag logic
    function attachDragListeners() {
        selectionBox = createSelectionBox();

        document.addEventListener('mousedown', (e) => {
            const target = e.target.closest('.file, .folder, button, input, a, .download-panel, #custom-context-menu, .settings');
            if (e.button !== 0 || target) return;
            
            isSelecting = true;
            const offset = getBodyOffset();
            startX = e.pageX - offset.left;
            startY = e.pageY - offset.top;
            
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'crosshair';
            
            if (!e.ctrlKey && !e.metaKey) {
                removeHighlights();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;

            const offset = getBodyOffset();
            const currentX = e.pageX - offset.left;
            const currentY = e.pageY - offset.top;

            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            updateSelectionBox(left, top, width, height, true);
            highlightSelectedItems({ left, top, right: left + width, bottom: top + height });
        });

        document.addEventListener('mouseup', (e) => {
            if (!isSelecting) return;

            isSelecting = false;
            updateSelectionBox(0, 0, 0, 0, false);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            if (window.getSelection) window.getSelection().removeAllRanges();

            const offset = getBodyOffset();
            const finalDx = Math.abs((e.pageX - offset.left) - startX);
            const finalDy = Math.abs((e.pageY - offset.top) - startY);

            if (finalDx >= DRAG_THRESHOLD || finalDy >= DRAG_THRESHOLD) {
                addSelectedItemsToQueue();
            } else {
                removeHighlights();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isSelecting) {
                isSelecting = false;
                updateSelectionBox(0, 0, 0, 0, false);
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
                removeHighlights();
            }
        });
    }

    function initialize() { attachDragListeners(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
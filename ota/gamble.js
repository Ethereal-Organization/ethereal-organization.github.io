// gamble.js - A joke feature to randomly gamble for a sample download
(function() {
    'use strict';

    // Gambling button configuration
    const GAMBLE_BUTTON_CONFIG = {
        text: '🎲 Random Sample',
        cooldownMs: 3000,
    };

    let isGambling = false;
    let lastGambleTime = 0;

    // Create the gambling button
    function createGambleButton() {
        const button = document.createElement('button');
        button.id = 'gamble-button';
        button.innerHTML = GAMBLE_BUTTON_CONFIG.text;
        button.className = 'gamble-button';

        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.lineHeight = '1';
        button.style.verticalAlign = 'middle';
        button.style.padding = '10px 20px';
        button.style.fontSize = '14px';
        button.style.backgroundColor = '#444';
        button.style.color = '#eee';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '9000';
        button.style.transition = 'background-color 0.2s ease';
        button.style.flexShrink = '0';
        button.style.setProperty('margin', '0', 'important');
        button.style.setProperty('vertical-align', 'middle', 'important');

        button.addEventListener('mouseenter', () => {
            if (!isGambling) button.style.backgroundColor = '#555';
        });

        button.addEventListener('mouseleave', () => {
            if (!isGambling) button.style.backgroundColor = '#444';
        });

        button.addEventListener('click', handleGambleClick);

        return button;
    }

    // Handle gambling button click
    async function handleGambleClick() {
        const now = Date.now();
        if (now - lastGambleTime < GAMBLE_BUTTON_CONFIG.cooldownMs) {
            showNotification('⏳ Slow down! Wait a moment...', 'warning');
            return;
        }

        if (!window.sharedDataManager || !window.sharedDataManager.isLoaded()) {
            showNotification('⚠️ Data not loaded yet. Please wait...', 'error');
            return;
        }

        if (isGambling) return;

        lastGambleTime = now;
        isGambling = true;

        await performGambleAnimation();

        isGambling = false;
    }

    // Perform the random selection with rolling
    async function performGambleAnimation() {
        const data = window.sharedDataManager.getData();
        if (!data || data.length === 0) {
            showNotification('No files available!', 'error');
            return;
        }

        const finalFile = data[Math.floor(Math.random() * data.length)];
        await createRollingModal(data, finalFile);
    }

    // Rolling animation modal
    function createRollingModal(allFiles, finalFile) {
        const overlay = document.createElement('div');
        overlay.id = 'gamble-modal-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex; justify-content: center; align-items: center;
            z-index: 15000;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(180deg, var(--bg-gradient-start), var(--bg-gradient-end));
            border: 2px solid var(--primary-accent);
            border-radius: var(--border-radius);
            padding: 40px;
            min-width: 400px; max-width: 90vw;
            box-shadow: 0 10px 40px rgba(88,166,255,0.5);
            text-align: center; color: var(--text-color);
            font-family: var(--font-family);
            position: absolute;
        `;

        const title = document.createElement('h2');
        title.textContent = '🎲 Rolling for a Sample...';
        title.style.cssText = `
            margin: 0 0 30px 0; font-size: 24px;
            color: var(--primary-accent);
            text-shadow: 0 0 10px rgba(88,166,255,0.5);
            font-weight: 700;
        `;

        const display = document.createElement('p');
        display.style.cssText = `
            font-size: 18px; color: var(--text-color);
            margin: 15px 0; height: 40px;
            display: flex; justify-content: center; align-items: center;
            user-select: none;
        `;

        modal.appendChild(title);
        modal.appendChild(display);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        centerModal(modal);
        window.addEventListener('scroll', () => centerModal(modal));
        window.addEventListener('resize', () => centerModal(modal));

        return new Promise(resolve => {
            let startInterval = 10;
            const maxInterval = 300;
            const rollDuration = 5000;
            const startTime = Date.now();

            const roll = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed >= rollDuration) {
                    // Stop rolling
                    display.textContent = '';
                    showFinalResult(modal, overlay, finalFile);
                    resolve();
                    return;
                }

                // Pick random file (shuffle)
                const randomFile = allFiles[Math.floor(Math.random() * allFiles.length)];
                const name = randomFile.name || randomFile.path?.split('/').pop() || 'Unknown File';
                display.textContent = name;


        	// Calculate interval based on elapsed time (linear easing)
        	const progress = elapsed / rollDuration; // 0 → 1
        	const currentInterval = startInterval + (maxInterval - startInterval) * progress;
                setTimeout(roll, currentInterval);
            };

            roll();
        });
    }

    // Center the modal and follow scrolling
    function centerModal(modal) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = modal.offsetWidth;
        const modalHeight = modal.offsetHeight;

        modal.style.top = `${scrollY + (viewportHeight - modalHeight)/2}px`;
        modal.style.left = `${scrollX + (viewportWidth - modalWidth)/2}px`;
    }

    // Show final result with fully styled buttons
    function showFinalResult(modal, overlay, file) {
        const resultContainer = document.createElement('div');
        resultContainer.innerHTML = `
            <p style="color: #10b981; font-size: 24px; font-weight: 700; margin: 10px 0;">
                You rolled the following:
            </p>
            <p style="color: var(--text-color); font-size: 16px; margin: 15px 0; word-break: break-word;">
                <strong>File:</strong> ${file.name || file.path?.split('/').pop() || 'Unknown'}
            </p>
            <p style="color: var(--dim-text); font-size: 14px; margin: 10px 0;">
                <strong>Size:</strong> ${file.size ? formatSize(file.size) : 'Unknown size'}
            </p>
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:20px';

        if (file.download_url) {
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download';
            downloadBtn.style.cssText = `
                display: inline-flex; align-items: center; justify-content: center;
                padding: 10px 15px; background: linear-gradient(135deg, #2c323c, #1b1f28);
                color: var(--primary-accent); font-weight: 600; font-size: 1em;
                border-radius: var(--border-radius); border: 1px solid var(--primary-accent);
                cursor: pointer; user-select: none;
                transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease, color 0.3s ease;
                box-shadow: 0 0 6px rgba(88,166,255,0.4);
            `;
            downloadBtn.addEventListener('mouseenter', () => {
                downloadBtn.style.background = 'linear-gradient(135deg, #58a6ff, #1e2a4d)';
                downloadBtn.style.boxShadow = '0 0 12px 2px var(--primary-accent)';
                downloadBtn.style.transform = 'scale(1.05)';
                downloadBtn.style.color = '#ffffff';
            });
            downloadBtn.addEventListener('mouseleave', () => {
                downloadBtn.style.background = 'linear-gradient(135deg, #2c323c, #1b1f28)';
                downloadBtn.style.boxShadow = '0 0 6px rgba(88,166,255,0.4)';
                downloadBtn.style.transform = 'scale(1)';
                downloadBtn.style.color = 'var(--primary-accent)';
            });
            downloadBtn.addEventListener('mousedown', () => downloadBtn.style.transform = 'scale(0.95)');
            downloadBtn.addEventListener('click', () => {
                window.open(file.download_url, '_blank');
                overlay.remove();
                showNotification('Lucky download started!', 'success');
            });
            buttonContainer.appendChild(downloadBtn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            display: inline-flex; align-items: center; justify-content: center;
            padding: 10px 15px; background: linear-gradient(135deg, #2c323c, #1b1f28);
            color: var(--dim-text); font-weight: 600; font-size: 1em;
            border-radius: var(--border-radius); border: 1px solid #30363d;
            cursor: pointer; user-select: none;
            transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease, color 0.3s ease;
            box-shadow: 0 0 6px rgba(48,54,61,0.4);
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'linear-gradient(135deg, #30363d, #21262d)';
            closeBtn.style.color = 'var(--text-color)';
            closeBtn.style.transform = 'scale(1.05)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'linear-gradient(135deg, #2c323c, #1b1f28)';
            closeBtn.style.color = 'var(--dim-text)';
            closeBtn.style.transform = 'scale(1)';
        });
        closeBtn.addEventListener('mousedown', () => closeBtn.style.transform = 'scale(0.95)');
        closeBtn.addEventListener('click', () => overlay.remove());

        buttonContainer.appendChild(closeBtn);
        modal.appendChild(resultContainer);
        modal.appendChild(buttonContainer);
    }

    // Notifications
    function showNotification(message, type='info') {
        const colors = { info:'#58a6ff', success:'#10b981', warning:'#f59e0b', error:'#ef4444' };
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top:20px; right:20px;
            background:${colors[type]}; color:white;
            padding:12px 20px; border-radius:6px;
            font-weight:600; box-shadow:0 4px 15px rgba(0,0,0,0.3);
            z-index:16000;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function formatSize(bytes) {
        if (typeof bytes!=='number'||isNaN(bytes)) return 'Unknown';
        const units=['B','KB','MB','GB','TB'];
        let i=0;
        while(bytes>=1024 && i<units.length-1){bytes/=1024;i++;}
        return `${bytes.toFixed(1)} ${units[i]}`;
    }

    // Insert button
    function insertGambleButton() {
        const button = createGambleButton();
        const downloadQueueButton = document.getElementById('download-queue-btn');
        if(downloadQueueButton){
            const buttonContainer = downloadQueueButton.parentNode;
            buttonContainer.style.display='flex';
            buttonContainer.style.alignItems='center';
            buttonContainer.style.gap='15px';

            const refStyles=window.getComputedStyle(downloadQueueButton);
            button.style.height=refStyles.height;
            button.style.padding=refStyles.padding;
            button.style.fontSize=refStyles.fontSize;
            button.style.borderRadius=refStyles.borderRadius;
            button.style.setProperty('margin','0','important');
            button.style.setProperty('vertical-align','middle','important');

            buttonContainer.appendChild(button);
        }else{
            const headerControls=document.getElementById('header-controls');
            if(headerControls) headerControls.appendChild(button);
        }
    }

    function initialize() {
        if(window.sharedDataManager){
            setTimeout(()=>{
                window.sharedDataManager.addListener(insertGambleButton);
                if(window.sharedDataManager.isLoaded()) insertGambleButton();
            },500);
        }else{
            setTimeout(initialize,100);
        }
    }

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initialize);
    else initialize();

})();

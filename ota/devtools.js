(function() {
    let devToolsOpen = false;
    let modalShown = false;
    
    // Console ASCII art animation frames
    const frames = [
        `
███████╗
██╔════╝
█████╗  
██╔══╝  
███████╗
╚══════╝
        `,
        `
███████╗████████╗
██╔════╝╚══██╔══╝
█████╗     ██║   
██╔══╝     ██║   
███████╗   ██║   
╚══════╝   ╚═╝  
        `,
        `
███████╗████████╗██╗  ██╗
██╔════╝╚══██╔══╝██║  ██║
█████╗     ██║   ███████║
██╔══╝     ██║   ██╔══██║
███████╗   ██║   ██║  ██║
╚══════╝   ╚═╝   ╚═╝  ╚═╝
        `,
        `
███████╗████████╗██╗  ██╗███████╗
██╔════╝╚══██╔══╝██║  ██║██╔════╝
█████╗     ██║   ███████║█████╗  
██╔══╝     ██║   ██╔══██║██╔══╝  
███████╗   ██║   ██║  ██║███████╗
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
        `,
        `
███████╗████████╗██╗  ██╗███████╗██████╗ 
██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗
█████╗     ██║   ███████║█████╗  ██████╔╝
██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗
███████╗   ██║   ██║  ██║███████╗██║  ██║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
        `,
        `
███████╗████████╗██╗  ██╗███████╗██████╗ ███████╗
██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝
█████╗     ██║   ███████║█████╗  ██████╔╝█████╗  
██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  
███████╗   ██║   ██║  ██║███████╗██║  ██║███████╗
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
                                                 
        `,
        `
███████╗████████╗██╗  ██╗███████╗██████╗ ███████╗ █████╗ 
██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝██╔══██╗
█████╗     ██║   ███████║█████╗  ██████╔╝█████╗  ███████║
██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ██╔══██║
███████╗   ██║   ██║  ██║███████╗██║  ██║███████╗██║  ██║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
        `,
        `
███████╗████████╗██╗  ██╗███████╗██████╗ ███████╗ █████╗ ██╗     
██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝██╔══██╗██║     
█████╗     ██║   ███████║█████╗  ██████╔╝█████╗  ███████║██║     
██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ██╔══██║██║     
███████╗   ██║   ██║  ██║███████╗██║  ██║███████╗██║  ██║███████╗
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
        `
    ];
    
    // Redirect URLs pool (50% chance to redirect) - Updated with new sites
    const redirectUrls = [
        'https://sliding.toys/mystic-square/8-puzzle/daily/',
        'https://maze.toys/mazes/mini/daily/',
        'https://optical.toys',
        'https://paint.toys/calligram/',
        'https://puginarug.com',
        'https://memory.toys/classic/easy/',
        'https://alwaysjudgeabookbyitscover.com',
        'https://clicking.toys/flip-grid/neat-nine/3-holes/',
        'https://weirdorconfusing.com/',
        'https://checkbox.toys/scale/',
        'https://binarypiano.com/',
        'https://mondrianandme.com/',
        'https://onesquareminesweeper.com/',
        'https://cursoreffects.com',
        'http://floatingqrcode.com/',
        'https://thatsthefinger.com/',
        'https://cant-not-tweet-this.com/',
        'http://heeeeeeeey.com/',
        'http://corndog.io/',
        'http://eelslap.com/',
        'http://www.staggeringbeauty.com/',
        'http://burymewithmymoney.com/',
        'https://smashthewalls.com/',
        'https://toms.toys',
        'http://endless.horse/',
        'https://duckstreet.net/',
        'http://drawing.garden/',
        'http://www.movenowthinklater.com/',
        'https://sliding.toys/mystic-square/15-puzzle/daily/',
        'https://paint.toys/',
        'https://checkboxrace.com/',
        'http://www.rrrgggbbb.com/',
        'http://www.koalastothemax.com/',
        'https://rotatingsandwiches.com/',
        'http://www.everydayim.com/',
        'http://randomcolour.com/',
        'http://maninthedark.com/',
        'http://cat-bounce.com/',
        'http://chrismckenzie.com/',
        'https://thezen.zone/',
        'http://ninjaflex.com/',
        'http://ihasabucket.com/',
        'http://corndogoncorndog.com/',
        'http://www.hackertyper.com/',
        'https://pointerpointer.com',
        'http://imaninja.com/',
        'http://www.partridgegetslucky.com/',
        'http://www.ismycomputeron.com/',
        'http://www.nullingthevoid.com/',
        'http://www.muchbetterthanthis.com/',
        'http://www.yesnoif.com/',
        'http://lacquerlacquer.com',
        'https://clicking.toys/peg-solitaire/solid/',
        'http://potatoortomato.com/',
        'http://iamawesome.com/',
        'https://strobe.cool/',
        'http://thisisnotajumpscare.com/',
        'http://doughnutkitten.com/',
        'http://crouton.net/',
        'http://corgiorgy.com/',
        'http://www.wutdafuk.com/',
        'http://unicodesnowmanforyou.com/',
        'http://chillestmonkey.com/',
        'http://scroll-o-meter.club/',
        'http://www.crossdivisions.com/',
        'http://tencents.info/',
        'https://memory.toys/maze/easy/',
        'https://boringboringboring.com/',
        'http://www.patience-is-a-virtue.org/',
        'http://pixelsfighting.com/',
        'http://isitwhite.com/',
        'https://existentialcrisis.com/',
        'http://onemillionlols.com/',
        'http://www.omfgdogs.com/',
        'http://oct82.com/',
        'http://chihuahuaspin.com/',
        'http://www.blankwindows.com/',
        'http://tunnelsnakes.com/',
        'http://www.trashloop.com/',
        'http://spaceis.cool/',
        'http://www.doublepressure.com/',
        'http://www.donothingfor2minutes.com/',
        'http://buildshruggie.com/',
        'https://optical.toys/thatcher-effect/',
        'http://yeahlemons.com/',
        'http://wowenwilsonquiz.com',
        'http://notdayoftheweek.com/',
        'https://number.toys/',
        'https://card.toys',
        'http://www.amialright.com/',
        'https://greatbignothing.com/',
        'https://zoomquilt.org/',
        "https://optical.toys/troxler-fade/",
        'https://dadlaughbutton.com/',
        'https://remoji.com/',
        'http://papertoilet.com/',
        'https://loopedforinfinity.com/',
        "https://www.ripefordebate.com/",
        'https://end.city/',
        'https://www.bouncingdvdlogo.com/',
        'https://toybox.toms.toys',
        'https://memory.toys'
    ];
    
    // Show blocking modal
    function showBlockingModal() {
        if (modalShown) return;
        modalShown = true;
        
        // Always trigger console animation and gamble
        setTimeout(() => {
            animateConsole();
        }, 500);
        
        const overlay = document.createElement('div');
        overlay.id = 'devtools-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
            animation: fadeIn 0.3s ease;
        `;
        
        // Block all mouse and keyboard events on the overlay
        overlay.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        
        overlay.addEventListener('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        
        overlay.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        
        overlay.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, var(--bg-gradient-start, #000000), var(--bg-gradient-end, #050505));
            color: var(--primary-accent, #58a6ff);
            padding: 40px;
            border-radius: var(--border-radius, 6px);
            border: 2px solid var(--primary-accent, #58a6ff);
            box-shadow: 0 0 40px rgba(88, 166, 255, 0.5);
            text-align: center;
            max-width: 600px;
            animation: glitchIn 0.5s ease;
        `;
        
        modal.innerHTML = `
            <h1 style="font-size: 2.5em; margin: 0 0 20px 0; text-shadow: 0 0 10px var(--primary-accent, #58a6ff); color: var(--text-color, #c9d1d9);">
                Really?
            </h1>
            <p style="font-size: 1.3em; margin: 20px 0; line-height: 1.6; color: var(--text-color, #c9d1d9);">
                If you're here, might as well check the console.
            </p>
            <p style="font-size: 0.9em; color: var(--dim-text, #8b949e); margin-top: 30px;">
                [ Close dev tools to continue ]
            </p>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes glitchIn {
                0% { transform: scale(0.8) translateX(-100px); opacity: 0; }
                20% { transform: scale(1.1) translateX(20px); }
                40% { transform: scale(0.9) translateX(-10px); }
                60% { transform: scale(1.05) translateX(5px); }
                80% { transform: scale(0.98) translateX(-2px); }
                100% { transform: scale(1) translateX(0); opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { text-shadow: 0 0 10px var(--primary-accent, #58a6ff); }
                50% { text-shadow: 0 0 20px var(--primary-accent, #58a6ff), 0 0 30px var(--primary-accent, #58a6ff); }
            }
        `;
        document.head.appendChild(style);
        
        // Add pulsing animation to title
        modal.querySelector('h1').style.animation = 'pulse 2s infinite';
        
        // Store overlay reference globally for closing
        window.devToolsOverlay = overlay;
        
        // Remove click and ESC handlers - only closes when dev tools close
        
        // Trigger console animation
        // Removed from here - now called at the start of showBlockingModal
    }
    
    // Animate console message
    function animateConsole() {
        console.clear();
        let frameIndex = 0;
        let count = 0;
        
        const interval = setInterval(() => {
            console.clear();
            console.log('%c' + frames[frameIndex], 'color: #58a6ff; font-weight: bold;');
            frameIndex = (frameIndex + 1) % frames.length;
            count++;
            
            if (count > 10) {
                clearInterval(interval);
                showFinalConsoleMessage();
            }
        }, 200);
    }
    
    // Show final console message with potential redirect
    function showFinalConsoleMessage() {
        console.clear();
        
        console.log('%c┌─────────────────────────────────────────────┐', 'color: #58a6ff; font-weight: bold;');
        console.log('%c│  Well, well, well... A curious developer!   │', 'color: #58a6ff; font-weight: bold;');
        console.log('%c└─────────────────────────────────────────────┘', 'color: #58a6ff; font-weight: bold;');
        console.log('');
        console.log('%cSince you\'re here, here are some neat tricks:', 'color: #c9d1d9; font-size: 14px;');
        console.log('%c• window.queuedFiles - See queued files', 'color: #8b949e;');
        console.log('%c• window.sharedDataManager - Access file data', 'color: #8b949e;');
        console.log('%c• window.collectionProgress - View progress', 'color: #8b949e;');
        console.log('');
        
        // 50% chance to redirect
        const shouldRedirect = Math.random() < 0.5;
        
        if (shouldRedirect) {
            const randomUrl = redirectUrls[Math.floor(Math.random() * redirectUrls.length)];
            console.log('%c⚠️  REDIRECT INITIATED...', 'color: #ef4444; font-size: 16px; font-weight: bold;');
            console.log('%cYou rolled the dice and lost! Redirecting in 3 seconds...', 'color: #f87171; font-size: 14px;');
            console.log('');
            
            let countdown = 3;
            const countInterval = setInterval(() => {
                console.log('%c' + countdown + '...', 'color: #ef4444; font-size: 20px; font-weight: bold;');
                countdown--;
                
                if (countdown < 0) {
                    clearInterval(countInterval);
                    console.log('%c🚀 REDIRECTING NOW!', 'color: #ef4444; font-size: 24px; font-weight: bold;');
                    setTimeout(() => {
                        window.location.href = randomUrl;
                    }, 500);
                }
            }, 1000);
        } else {
            console.log('%c✨ Lucky you! No redirect this time.', 'color: #10b981; font-size: 16px; font-weight: bold;');
            console.log('%cYou rolled the dice and won!', 'color: #10b981; font-size: 14px;');
            console.log('');
            console.log('%cHappy exploring! 🎉', 'color: #3b82f6; font-size: 14px;');
        }
    }
    
    // Dev tools detection methods
    
    // Function to close modal when dev tools are closed
    const closeModal = () => {
        if (window.devToolsOverlay) {
            window.devToolsOverlay.style.animation = 'fadeIn 0.3s ease reverse';
            
            // Re-enable pointer events on body
            document.body.style.pointerEvents = '';
            
            setTimeout(() => {
                if (window.devToolsOverlay && window.devToolsOverlay.parentNode) {
                    window.devToolsOverlay.remove();
                }
                window.devToolsOverlay = null;
                modalShown = false;
            }, 300);
        }
    };
    
    // Method 1: Console detection (improved)
    const consoleCheck = () => {
        const threshold = 200; // Increased threshold to reduce false positives
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        
        // More conservative detection - need significant size difference
        const isDevToolsOpen = (widthDiff > threshold) || (heightDiff > threshold);
        
        if (isDevToolsOpen) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                showBlockingModal();
            }
        } else {
            if (devToolsOpen) {
                devToolsOpen = false;
                closeModal();
            }
        }
    };
    
    // Method 2: Firebug detection (disabled to reduce false positives)
    // The debugger statement can be too aggressive
    /*
    let firebugCheck = function() {
        const start = new Date();
        debugger;
        const end = new Date();
        if (end - start > 100) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                showBlockingModal();
            }
        }
    };
    */
    
    // Method 3: Element ID detection (disabled - too sensitive)
    /*
    const devtoolsDetector = document.createElement('div');
    Object.defineProperty(devtoolsDetector, 'id', {
        get: function() {
            if (!devToolsOpen) {
                devToolsOpen = true;
                showBlockingModal();
            }
            return 'devtools-detector';
        }
    });
    */
    
    // Periodically check for dev tools (only using size detection now)
    setInterval(consoleCheck, 500);
    
    // Check on window resize (common when opening/closing dev tools)
    window.addEventListener('resize', () => {
        setTimeout(consoleCheck, 100);
    });
    
    // Initial check with delay to ensure page is loaded
    setTimeout(consoleCheck, 1000);
})();
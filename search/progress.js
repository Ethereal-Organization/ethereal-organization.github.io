// Collection Goal Progress Bar - Shows progress toward a target number of files
class CollectionProgressBar {
    constructor(config = {}) {
        this.targetGoal = config.targetGoal || 1000000; // Default goal: 1 million files
        this.currentCount = 0;
        this.progressContainer = null;
        this.progressBar = null;
        this.progressText = null;
        this.goalText = null;
        this.percentageText = null;
        this.isVisible = false;
        
        this.init();
        this.loadCurrentCount();
    }
    
    init() {
        // Create progress bar container
        this.progressContainer = document.createElement('div');
        this.progressContainer.id = 'collection-progress-container';
        this.progressContainer.style.cssText = `
            background: linear-gradient(180deg, var(--bg-gradient-start, #000000) 0%, var(--bg-gradient-end, #050505) 100%);
            border: 1px solid #30363d;
            border-radius: var(--border-radius, 6px);
            padding: var(--container-padding, 20px);
            margin: 10px 0 20px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            font-family: var(--font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
            transition: var(--transition-fast, 0.3s) ease;
            opacity: 0;
            animation: fadeSlideUp 0.6s ease forwards;
            animation-delay: 0.1s;
        `;

        // Progress header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        `;

        // Goal title
        const title = document.createElement('div');
        title.textContent = 'Collection Progress';
        title.style.cssText = `
            color: var(--text-color, #c9d1d9);
            font-size: var(--font-size, 15px);
            font-weight: 600;
        `;

        // Percentage display
        this.percentageText = document.createElement('div');
        this.percentageText.style.cssText = `
            color: var(--primary-accent, #58a6ff);
            font-size: 16px;
            font-weight: 600;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        `;

        // Progress bar track
        const progressTrack = document.createElement('div');
        progressTrack.style.cssText = `
            background: #161b22;
            border-radius: var(--border-radius, 6px);
            height: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            border: 1px solid #30363d;
            position: relative;
        `;

        // Progress bar fill
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            background: linear-gradient(90deg, var(--primary-accent, #58a6ff), #3b82f6, var(--primary-accent, #58a6ff));
            background-size: 200% 100%;
            height: 100%;
            width: 0%;
            border-radius: var(--border-radius, 6px);
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            animation: progressFlow 3s ease-in-out infinite;
            position: relative;
        `;

        // Progress glow effect
        const progressGlow = document.createElement('div');
        progressGlow.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: inherit;
            border-radius: inherit;
            filter: blur(4px);
            opacity: 0.6;
            z-index: -1;
        `;

        // Current count and goal display
        this.progressText = document.createElement('div');
        this.progressText.style.cssText = `
            color: var(--dim-text, #8b949e);
            font-size: 14px;
            text-align: center;
            line-height: 1.4;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        `;

        // Goal milestone text
        this.goalText = document.createElement('div');
        this.goalText.style.cssText = `
            color: var(--dim-text, #8b949e);
            font-size: 12px;
            text-align: center;
            margin-top: 8px;
            font-style: italic;
        `;

        // Assemble the progress bar
        header.appendChild(title);
        header.appendChild(this.percentageText);
        this.progressBar.appendChild(progressGlow);
        progressTrack.appendChild(this.progressBar);
        this.progressContainer.appendChild(header);
        this.progressContainer.appendChild(progressTrack);
        this.progressContainer.appendChild(this.progressText);
        this.progressContainer.appendChild(this.goalText);

        // Add CSS animations
        this.addProgressStyles();
        
        // Add hover effect
        this.progressContainer.addEventListener('mouseenter', () => {
            this.progressContainer.style.transform = 'translateX(6px) scale(1.02)';
            this.progressContainer.style.boxShadow = '0 0 15px rgba(88, 166, 255, 0.3)';
        });
        
        this.progressContainer.addEventListener('mouseleave', () => {
            this.progressContainer.style.transform = 'translateX(0) scale(1)';
            this.progressContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        });
    }

    addProgressStyles() {
        if (document.getElementById('collection-progress-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'collection-progress-styles';
        style.textContent = `
            @keyframes progressFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes milestone {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .milestone-reached {
                animation: milestone 0.6s ease-in-out 3;
            }
        `;
        document.head.appendChild(style);
    }

    async loadCurrentCount() {
        // Wait for the page to be fully loaded
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve, { once: true });
                }
            });
        }

        // Wait a bit more for other scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 500));

        // This integrates with your existing count.js logic
        try {
            const jsonFiles = [
                'OTA-PART-1/chunk_001.json',
                'OTA-PART-1/chunk_002.json',
                'OTA-PART-2/chunk_001.json',
                // Add more files when needed
            ];

            const allData = await Promise.all(
                jsonFiles.map(file => 
                    fetch(file)
                        .then(response => {
                            if (!response.ok) throw new Error(`Failed to fetch ${file}`);
                            return response.json();
                        })
                        .then(data => {
                            if (Array.isArray(data)) {
                                return data.length;
                            }
                            return 0;
                        })
                        .catch(err => {
                            console.error(`Error loading ${file}:`, err);
                            return 0;
                        })
                )
            );

            const totalCount = allData.reduce((sum, count) => sum + count, 0);
            this.updateProgress(totalCount);

        } catch (error) {
            console.error('Error loading file counts:', error);
            this.updateProgress(0);
        }
    }

    updateProgress(currentCount) {
        const previousCount = this.currentCount;
        this.currentCount = currentCount;
        
        const percentage = Math.min((this.currentCount / this.targetGoal) * 100, 100);
        const roundedPercentage = Math.round(percentage * 100) / 100; // Round to 2 decimal places
        
        // Update progress bar
        this.progressBar.style.width = `${percentage}%`;
        
        // Update percentage display
        this.percentageText.textContent = `${roundedPercentage}%`;
        
        // Update main progress text
        this.progressText.textContent = `${this.currentCount.toLocaleString()} / ${this.targetGoal.toLocaleString()} samples`;
        
        // Calculate remaining samples
        const remaining = Math.max(0, this.targetGoal - this.currentCount);
        
        // Update goal text with milestone info
        if (this.currentCount >= this.targetGoal) {
            this.goalText.textContent = 'Goal Achieved! 🎉';
            this.goalText.style.color = '#10b981';
            this.progressContainer.classList.add('milestone-reached');
        } else {
            this.goalText.textContent = `${remaining.toLocaleString()} samples remaining to reach goal`;
            
            // Check for milestones
            const milestones = [100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000, 425000, 450000, 475000, 500000, 525000, 550000, 575000, 600000, 625000, 650000, 675000, 700000, 725000, 750000];
	    milestones.sort((a, b) => a - b);
	    let highestMilestoneCrossed = 0;

            for (const milestone of milestones) {
                if (previousCount < milestone && this.currentCount >= milestone) {
		    highestMilestoneCrossed = milestone;
                }
            }
            if (highestMilestoneCrossed > 0) {
                this.showMilestone(highestMilestoneCrossed);
	    }
        }
        
        // Color coding based on progress
        if (percentage >= 100) {
            this.progressBar.style.background = 'linear-gradient(90deg, #10b981, #059669, #10b981)';
        } else if (percentage >= 75) {
            this.progressBar.style.background = 'linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6)';
        } else if (percentage >= 50) {
            this.progressBar.style.background = 'linear-gradient(90deg, #58a6ff, #3b82f6, #58a6ff)';
        } else if (percentage >= 25) {
            this.progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706, #f59e0b)';
        } else {
            this.progressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)';
        }
    }

    showMilestone(milestone) {
        const milestoneAlert = document.createElement('div');
        milestoneAlert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            z-index: 16000;
            animation: milestone 0.6s ease-in-out;
        `;
        milestoneAlert.textContent = `Milestone Reached: ${milestone.toLocaleString()} samples!`;
        
        document.body.appendChild(milestoneAlert);
        
        setTimeout(() => {
            milestoneAlert.remove();
        }, 4000);
    }

    setGoal(newGoal) {
        this.targetGoal = newGoal;
        this.updateProgress(this.currentCount);
    }

    show() {
        if (this.isVisible) return;
        this.isVisible = true;
        
        // Debug logging
        console.log('Attempting to show progress bar');
        
        // Try multiple insertion points
        const headerControls = document.getElementById('header-controls');
        const main = document.querySelector('main');
        const noticeBar = document.querySelector('.notice-bar');
        
        console.log('headerControls:', headerControls);
        console.log('main:', main);
        console.log('noticeBar:', noticeBar);
        
        if (headerControls) {
            console.log('Inserting after header-controls');
            headerControls.insertAdjacentElement('afterend', this.progressContainer);
        } else if (noticeBar) {
            console.log('Inserting after notice-bar');
            noticeBar.insertAdjacentElement('afterend', this.progressContainer);
        } else if (main) {
            console.log('Inserting at beginning of main');
            main.insertAdjacentElement('afterbegin', this.progressContainer);
        } else {
            console.log('Inserting to document body');
            document.body.appendChild(this.progressContainer);
        }
        
        console.log('Progress container added to DOM');
    }

    hide() {
        if (!this.isVisible) return;
        this.isVisible = false;
        if (this.progressContainer.parentNode) {
            this.progressContainer.parentNode.removeChild(this.progressContainer);
        }
    }
}

// Configuration options
const COLLECTION_CONFIG = {
    targetGoal: 500000, // 1 million samples goal - adjust as needed
};

// Initialize the collection progress bar
const collectionProgress = new CollectionProgressBar(COLLECTION_CONFIG);

// Auto-show on page load
document.addEventListener('DOMContentLoaded', () => {
    collectionProgress.show();
});

// Export for global access
window.CollectionProgressBar = CollectionProgressBar;
window.collectionProgress = collectionProgress;

// Function to manually update progress (for external use)
window.updateCollectionProgress = function(newCount) {
    collectionProgress.updateProgress(newCount);
};

// Function to set a new goal (for external use)
window.setCollectionGoal = function(newGoal) {
    collectionProgress.setGoal(newGoal);
};
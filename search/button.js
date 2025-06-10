// In your button.js file

// Logic for the Filter Section Toggle (Add this block)
const toggleFilterBtn = document.getElementById('toggleFilterBtn');
const filterSection = document.getElementById('filterSection');

if (toggleFilterBtn && filterSection) {
    toggleFilterBtn.addEventListener('click', () => {
        const expanded = toggleFilterBtn.getAttribute('aria-expanded') === 'true';
        toggleFilterBtn.setAttribute('aria-expanded', String(!expanded));
        filterSection.classList.toggle('expanded');
    });
}

// Existing Logic for the Settings Section Toggle
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
const settingsSection = document.getElementById('settingsSection');

if (toggleSettingsBtn && settingsSection) {
    toggleSettingsBtn.addEventListener('click', () => {
        const expanded = toggleSettingsBtn.getAttribute('aria-expanded') === 'true';
        toggleSettingsBtn.setAttribute('aria-expanded', String(!expanded));
        settingsSection.classList.toggle('expanded');
    });
}

// Existing Logic for the Notice Bar Dismissal
const noticeBar = document.querySelector(".notice-bar");
const closeNoticeButton = document.querySelector(".notice-bar-close");

if (noticeBar && closeNoticeButton) {
    closeNoticeButton.addEventListener("click", () => {
        noticeBar.classList.add('closing');
        noticeBar.addEventListener('transitionend', function handler() {
            noticeBar.style.display = 'none';
            noticeBar.removeEventListener('transitionend', handler);
        });
    });
}
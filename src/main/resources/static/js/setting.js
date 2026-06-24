// ===== SETTINGS PAGE LOGIC =====

// Initialize settings page
function initSettingsPage() {
    loadSavedSettings();
}

// Load saved settings
function loadSavedSettings() {

    // Theme
    const theme = ThemeManager.getTheme();
    if (theme === 'dark') {
        document.getElementById('darkThemeOption')
            .classList.add('selected');
        document.getElementById('lightThemeOption')
            .classList.remove('selected');
    } else {
        document.getElementById('lightThemeOption')
            .classList.add('selected');
        document.getElementById('darkThemeOption')
            .classList.remove('selected');
    }

    // Currency
    const currency = Utils.getCurrency();
    if (currency === 'INR') {
        document.getElementById('inrOption')
            .classList.add('selected');
        document.getElementById('usdOption')
            .classList.remove('selected');
    } else {
        document.getElementById('usdOption')
            .classList.add('selected');
        document.getElementById('inrOption')
            .classList.remove('selected');
    }

    // Toggles
    const animations   = localStorage.getItem('animations') !== 'false';
    const badges       = localStorage.getItem('badges')     !== 'false';
    const staleWarning = localStorage.getItem('staleWarning') !== 'false';

    document.getElementById('animationsToggle').checked   = animations;
    document.getElementById('badgesToggle').checked       = badges;
    document.getElementById('staleWarningToggle').checked = staleWarning;
}

// Select theme
function selectTheme(theme) {
    ThemeManager.setTheme(theme);

    // Update UI
    if (theme === 'dark') {
        document.getElementById('darkThemeOption')
            .classList.add('selected');
        document.getElementById('lightThemeOption')
            .classList.remove('selected');
    } else {
        document.getElementById('lightThemeOption')
            .classList.add('selected');
        document.getElementById('darkThemeOption')
            .classList.remove('selected');
    }

    Utils.showAlert(`${theme === 'dark'
        ? '🌙 Dark'
        : '☀️ Light'} mode activated`, 'success');
}

// Select currency
function selectCurrency(currency) {
    localStorage.setItem('currency', currency);

    // Update UI
    if (currency === 'INR') {
        document.getElementById('inrOption')
            .classList.add('selected');
        document.getElementById('usdOption')
            .classList.remove('selected');
    } else {
        document.getElementById('usdOption')
            .classList.add('selected');
        document.getElementById('inrOption')
            .classList.remove('selected');
    }

    Utils.showAlert(`Currency set to ${currency}`, 'success');
}

// Save toggle setting
function saveSetting(key, value) {
    localStorage.setItem(key, value);
    Utils.showAlert(`Setting saved`, 'success');
}

// Reset portfolio
function resetPortfolio() {
    if (!confirm('Reset portfolio? This will clear all holdings and restore $10,000 balance.')) {
        return;
    }

    fetch('http://localhost:8080/api/portfolio/reset', {
        method: 'POST'
    })
    .then(res => res.json())
    .then(() => {
        Utils.showAlert('Portfolio reset successfully!', 'success');
    })
    .catch(() => {
        Utils.showAlert('Could not reset portfolio', 'danger');
    });
}

// Clear order history
function clearHistory() {
    if (!confirm('Clear all order history? This cannot be undone.')) {
        return;
    }

    fetch('http://localhost:8080/api/orders/clear', {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => {
        Utils.showAlert('Order history cleared!', 'success');
    })
    .catch(() => {
        Utils.showAlert('Could not clear history', 'danger');
    });
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        Utils.removeLocal('user');
        window.location.href = 'login.html';
    }
}

// Start page
document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

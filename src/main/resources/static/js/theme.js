// ===== THEME MANAGER =====

const ThemeManager = {

    // Get current theme
    getTheme() {
        return localStorage.getItem('theme') || 'light';
    },

    // Set theme
    setTheme(theme) {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        this.updateToggleButton(theme);
    },

    // Toggle between light and dark
    toggle() {
        const current = this.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    // Update toggle button text
   
      updateToggleButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        if (theme === 'dark') {
            btn.innerHTML = '☀️';
        } else {
            btn.innerHTML = '🌙';
        }
    }
},

    // Initialize theme on page load
    init() {
        const saved = this.getTheme();
        this.setTheme(saved);
    }
};

// Auto initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

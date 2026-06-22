// ===== UTILITY FUNCTIONS =====

const Utils = {

    // Format price with 2 decimal places
    formatPrice(price, currency = 'USD') {
        if (currency === 'INR') {
            return '₹' + parseFloat(price).toFixed(2);
        }
        return '$' + parseFloat(price).toFixed(2);
    },

    // Format large numbers
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toString();
    },

    // Format timestamp to readable date
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour:   '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    // Format date
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year:  'numeric',
            month: 'short',
            day:   'numeric'
        });
    },

    // Calculate price change percentage
    calcChangePercent(oldPrice, newPrice) {
        const change = ((newPrice - oldPrice) / oldPrice) * 100;
        return change.toFixed(2);
    },

    // Get price direction
    getPriceDirection(oldPrice, newPrice) {
        if (newPrice > oldPrice) return 'up';
        if (newPrice < oldPrice) return 'down';
        return 'neutral';
    },

    // Save to local storage
    saveLocal(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // Get from local storage
    getLocal(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },

    // Remove from local storage
    removeLocal(key) {
        localStorage.removeItem(key);
    },

    // Get user from local storage
    getUser() {
        return this.getLocal('user');
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getLocal('user') !== null;
    },

    // Redirect if not logged in
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },

    // Show alert message
    showAlert(message, type = 'success', containerId = 'alertContainer') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.appendChild(alert);

        // Auto remove after 4 seconds
        setTimeout(() => {
            alert.remove();
        }, 4000);
    },

    // Get category badge HTML
    getCategoryBadge(category) {
        const cat = category ? category.toLowerCase() : 'other';
        return `<span class="category-badge badge-${cat}">${category}</span>`;
    },

    // Get currency preference
    getCurrency() {
        return localStorage.getItem('currency') || 'USD';
    }
};

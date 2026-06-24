// ===== PROFILE PAGE LOGIC =====

// Initialize profile page
function initProfilePage() {
    loadUserInfo();
    loadPortfolio();
    loadTradingStats();
    loadHoldings();
}

// Load user info
function loadUserInfo() {
    const user = Utils.getUser();
    if (!user) return;

    // Set avatar letter
    document.getElementById('profileAvatar').textContent =
        user.name.charAt(0).toUpperCase();

    // Set name and username
    document.getElementById('profileName').textContent =
        user.name;
    document.getElementById('profileUsername').textContent =
        '@' + user.username;

    // Set member since
    document.getElementById('memberSince').textContent =
        Utils.formatDate(user.createdAt);
}

// Load portfolio summary
function loadPortfolio() {
    fetch('http://localhost:8080/api/portfolio/summary')
        .then(res => res.json())
        .then(data => {
            const currency = Utils.getCurrency();
            const isProfit = data.profitLoss >= 0;

            document.getElementById('profileBalance').textContent =
                Utils.formatPrice(data.balance, currency);

            document.getElementById('profilePortfolioValue').textContent =
                Utils.formatPrice(data.portfolioValue, currency);

            document.getElementById('profileInvested').textContent =
                Utils.formatPrice(data.totalInvested, currency);

            const plEl = document.getElementById('profileProfitLoss');
            plEl.textContent = (isProfit ? '+' : '') +
                Utils.formatPrice(data.profitLoss, currency);
            plEl.style.color = isProfit
                ? 'var(--success)'
                : 'var(--danger)';

            // Update portfolio bar
            const bar = document.getElementById('portfolioBar');
            if (bar) {
                bar.innerHTML = Components.portfolioBar(
                    data.balance,
                    data.portfolioValue,
                    data.profitLoss
                );
            }
        })
        .catch(() => {
            const currency = Utils.getCurrency();
            document.getElementById('profileBalance').textContent =
                Utils.formatPrice(10000, currency);
            document.getElementById('profilePortfolioValue').textContent =
                Utils.formatPrice(0, currency);
            document.getElementById('profileInvested').textContent =
                Utils.formatPrice(0, currency);
            document.getElementById('profileProfitLoss').textContent =
                Utils.formatPrice(0, currency);
        });
}

// Load trading statistics
function loadTradingStats() {
    fetch('http://localhost:8080/api/orders/all')
        .then(res => res.json())
        .then(orders => {
            const buyOrders  = orders.filter(o => o.type === 'BUY');
            const sellOrders = orders.filter(o => o.type === 'SELL');

            document.getElementById('profileTotalOrders').textContent =
                orders.length;
            document.getElementById('profileBuyOrders').textContent =
                buyOrders.length;
            document.getElementById('profileSellOrders').textContent =
                sellOrders.length;
        })
        .catch(() => {
            document.getElementById('profileTotalOrders').textContent = 0;
            document.getElementById('profileBuyOrders').textContent   = 0;
            document.getElementById('profileSellOrders').textContent  = 0;
        });
}

// Load current holdings
function loadHoldings() {
    fetch('http://localhost:8080/api/portfolio/holdings')
        .then(res => res.json())
        .then(holdings => {
            const holdingsList = document.getElementById('holdingsList');
            const currency     = Utils.getCurrency();
            const symbols      = Object.keys(holdings);

            if (symbols.length === 0) {
                holdingsList.innerHTML = `
                <div class="text-center text-secondary py-3">
                    No holdings yet. Start trading!
                </div>`;
                return;
            }

            holdingsList.innerHTML = symbols.map(symbol => {
                const quantity = holdings[symbol];
                return `
                <div class="holdings-item">
                    <div>
                        <strong>${symbol}</strong>
                        <div style="font-size:0.8rem;
                                    color:var(--text-secondary);">
                            ${quantity} shares
                        </div>
                    </div>
                    <span class="category-badge
                        badge-tech">
                        ${quantity} shares
                    </span>
                </div>`;
            }).join('');
        })
        .catch(() => {
            document.getElementById('holdingsList').innerHTML = `
            <div class="text-center text-secondary py-3">
                Could not load holdings
            </div>`;
        });
}

// Edit profile
function editProfile() {
    const user    = Utils.getUser();
    const newName = prompt('Enter new name:', user.name);

    if (newName && newName.trim()) {
        user.name = newName.trim();
        Utils.saveLocal('user', user);

        // Update users list
        const users   = Utils.getLocal('users') || [];
        const updated = users.map(u => {
            if (u.username === user.username) {
                u.name = user.name;
            }
            return u;
        });
        Utils.saveLocal('users', updated);

        // Refresh page
        Utils.showAlert('Profile updated!', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
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
    initProfilePage();
});

// ===== REUSABLE UI COMPONENTS =====

const Components = {

    // ===== NAVBAR =====
    navbar(activePage = 'dashboard') {
        const user = Utils.getUser();
        const username = user ? user.username : 'Guest';

        return `
        <nav class="navbar navbar-expand-lg">
            <div class="container">

                <!-- Brand -->
                <a class="navbar-brand" href="index.html">
                    <img src="logo.png" 
     alt="FEIN AI" 
     style="height:35px; margin-right:8px;">
StockSim
                </a>

                <!-- Mobile Toggle -->
                <button class="navbar-toggler" type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Nav Links -->
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'dashboard' ? 'active fw-bold text-primary' : ''}"
                               href="index.html">
                               🏠 Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'history' ? 'active fw-bold text-primary' : ''}"
                               href="history.html">
                               📋 Orders
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'profile' ? 'active fw-bold text-primary' : ''}"
                               href="profile.html">
                               👤 Profile
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'settings' ? 'active fw-bold text-primary' : ''}"
                               href="settings.html">
                               ⚙️ Settings
                            </a>
                        </li>
                    </ul>

                    <!-- Right Side -->
                    <div class="d-flex align-items-center gap-3">

                        <!-- Theme Toggle -->
                        <button class="theme-toggle"
                            id="themeToggle"
                            onclick="ThemeManager.toggle()">
                            🌙 Dark Mode
                        </button>

                        <!-- User Badge -->
                        <div class="d-flex align-items-center gap-2">
                            <div style="
                                width: 35px;
                                height: 35px;
                                border-radius: 50%;
                                background: var(--primary);
                                color: white;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: 700;
                                font-size: 0.85rem;
                            ">
                                ${username.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-weight: 500; font-size: 0.9rem;">
                                ${username}
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </nav>
        `;
    },

    // ===== PORTFOLIO BAR =====
    portfolioBar(balance, portfolioValue, profitLoss) {
        const isProfit = profitLoss >= 0;
        const currency = Utils.getCurrency();
        return `
        <div class="portfolio-bar">
            <div class="container d-flex gap-4 flex-wrap">
                <span>
                    💰 Balance:
                    <strong>${Utils.formatPrice(balance, currency)}</strong>
                </span>
                <span>
                    📊 Portfolio:
                    <strong>${Utils.formatPrice(portfolioValue, currency)}</strong>
                </span>
                <span>
                    ${isProfit ? '📈' : '📉'} P&L:
                    <strong class="${isProfit ? 'profit' : 'loss'}">
                        ${isProfit ? '+' : ''}${Utils.formatPrice(profitLoss, currency)}
                    </strong>
                </span>
            </div>
        </div>
        `;
    },

    // ===== STOCK CARD =====
    stockCard(symbol, price, prevPrice, category) {
        const direction  =Utils.getPriceDirection(prevPrice, price);
        const change     = Utils.calcChangePercent(prevPrice, price);
        const currency   = Utils.getCurrency();
        const arrow      = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '●';
        const colorClass = direction === 'up' ? 'up' : direction === 'down' ? 'down' : '';

        return `
        <div class="stock-card animate__animated"
             id="card-${symbol}"
             onclick="window.location.href='stock.html?symbol=${symbol}'">

            <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="stock-symbol">${symbol}</span>
                ${Utils.getCategoryBadge(category)}
            </div>

            <div class="stock-price ${colorClass}" id="price-${symbol}">
                ${Utils.formatPrice(price, currency)}
            </div>

            <div class="stock-change ${colorClass} mt-1" id="change-${symbol}">
                ${arrow} ${Math.abs(change)}%
            </div>

            <div class="d-flex gap-2 mt-3">
                <button class="btn-buy flex-fill"
                    onclick="event.stopPropagation();
                    window.location.href='order.html?symbol=${symbol}&type=BUY'">
                    ▲ BUY
                </button>
                <button class="btn-sell flex-fill"
                    onclick="event.stopPropagation();
                    window.location.href='order.html?symbol=${symbol}&type=SELL'">
                    ▼ SELL
                </button>
            </div>
        </div>
        `;
    },

    // ===== LOADING SPINNER =====
    spinner() {
        return `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-secondary">Connecting to market...</p>
        </div>
        `;
    },

    // ===== ALERT CONTAINER =====
    alertContainer() {
        return `<div id="alertContainer" class="position-fixed top-0 end-0 p-3" style="z-index:9999"></div>`;
    },

    // ===== FOOTER =====
    footer() {
        return `
        <footer style="
            border-top: 1px solid var(--border-color);
            padding: 20px 0;
            margin-top: 60px;
            color: var(--text-secondary);
            font-size: 0.85rem;
            text-align: center;
        ">
            <div class="container">
                📈 StockSim — Stock Market Simulator
                &nbsp;|&nbsp;
                For educational purposes only
                &nbsp;|&nbsp;
                © 2026
            </div>
        </footer>
        `;
    }
};

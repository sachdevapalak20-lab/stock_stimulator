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
                    📈 StockSim
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
        const direction  =

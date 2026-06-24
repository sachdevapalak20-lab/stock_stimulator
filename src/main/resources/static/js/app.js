// ===== DASHBOARD LOGIC =====

let previousPrices = {};
let allStocks      = {};
let currentFilter  = 'ALL';
let ordersCount    = 0;

// Stock full names
const stockNames = {
    AAPL:     'Apple Inc.',
    TSLA:     'Tesla Inc.',
    RELIANCE: 'Reliance Industries',
    GOOGL:    'Alphabet Inc.',
    AMZN:     'Amazon.com',
    MSFT:     'Microsoft Corp.',
    META:     'Meta Platforms',
    NFLX:     'Netflix Inc.',
    NVDA:     'NVIDIA Corp.',
    INFY:     'Infosys Ltd.',
    TCS:      'Tata Consultancy',
    WIPRO:    'Wipro Ltd.',
    HDFC:     'HDFC Bank'
};

// Stock categories
const stockCategories = {
    AAPL:     'TECH',
    MSFT:     'TECH',
    GOOGL:    'TECH',
    META:     'TECH',
    NVDA:     'TECH',
    TSLA:     'EV',
    NFLX:     'STREAM',
    RELIANCE: 'INDIAN',
    INFY:     'INDIAN',
    TCS:      'INDIAN',
    WIPRO:    'INDIAN',
    HDFC:     'INDIAN',
    AMZN:     'ECOMM'
};

// Initialize dashboard
function initDashboard() {
    // Connect WebSocket
    WebSocketManager.onPriceUpdate = handlePriceUpdate;
    WebSocketManager.connect();

    // Load portfolio
    loadPortfolio();

    // Load orders count
    loadOrdersCount();
}

// Handle incoming price update
function handlePriceUpdate(prices) {
    allStocks = prices;
    updateStockGrid(prices);
    updateMarketSummary(prices);
    updateTickerTape(prices);
}

// Update stock grid
function updateStockGrid(prices) {
    const grid   = document.getElementById('stockGrid');
    const symbols = Object.keys(prices);

    // First load — build all cards
    if (Object.keys(previousPrices).length === 0) {
        let html = '';
        symbols.forEach(symbol => {
            const category = stockCategories[symbol] || 'OTHER';
            html += `
            <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 stock-grid-item"
                 id="grid-${symbol}"
                 data-category="${category}">
                ${buildStockCard(symbol, prices[symbol], prices[symbol], category)}
            </div>`;
        });
        grid.innerHTML = html;
    } else {
        // Update existing cards
        symbols.forEach(symbol => {
            const newPrice  = prices[symbol];
            const oldPrice  = previousPrices[symbol] || newPrice;
            const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : '';
            const category  = stockCategories[symbol] || 'OTHER';

            const priceEl = document.getElementById(`price-${symbol}`);
            const changeEl = document.getElementById(`change-${symbol}`);

            if (priceEl) {
                const currency = Utils.getCurrency();
                priceEl.textContent = Utils.formatPrice(newPrice, currency);
                priceEl.className   = `stock-price ${direction}`;

                // Flash animation
                if (direction) {
                    priceEl.classList.add(`price-${direction}`);
                    setTimeout(() => {
                        priceEl.classList.remove(`price-${direction}`);
                    }, 500);
                }
            }

            if (changeEl) {
                const change = Utils.calcChangePercent(oldPrice, newPrice);
                const arrow  = newPrice > oldPrice ? '▲' : newPrice < oldPrice ? '▼' : '●';
                changeEl.textContent = `${arrow} ${Math.abs(change)}%`;
                changeEl.className   = `stock-change ${direction}`;
            }
        });
    }

    previousPrices = {...prices};
    applyFilter(currentFilter);
}

// Build single stock card HTML
function buildStockCard(symbol, price, prevPrice, category) {
    const direction = Utils.getPriceDirection(prevPrice, price);
    const change    = Utils.calcChangePercent(prevPrice, price);
    const currency  = Utils.getCurrency();
    const arrow     = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '●';
    const name      = stockNames[symbol] || symbol;

    return `
    <div class="stock-card"
         onclick="window.location.href='stock.html?symbol=${symbol}'">

        <div class="d-flex justify-content-between align-items-start mb-1">
            <span class="stock-symbol">${symbol}</span>
            <span class="category-badge badge-${category.toLowerCase()}">${category}</span>
        </div>

        <div class="stock-name">${name}</div>

        <div class="stock-price ${direction} mt-2"
             id="price-${symbol}">
            ${Utils.formatPrice(price, currency)}
        </div>

        <div class="stock-change ${direction} mt-1"
             id="change-${symbol}">
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
    </div>`;
}

// Filter stocks by category
function filterStocks(category) {
    currentFilter = category;

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    applyFilter(category);
}

// Apply category filter
function applyFilter(category) {
    document.querySelectorAll('.stock-grid-item').forEach(item => {
        if (category === 'ALL') {
            item.style.display = 'block';
        } else {
            const cat = item.getAttribute('data-category');
            item.style.display = cat === category ? 'block' : 'none';
        }
    });
}

// Update market summary
function updateMarketSummary(prices) {
    const symbols = Object.keys(prices);
    let gainers   = 0;
    let losers    = 0;

    symbols.forEach(symbol => {
        const newPrice = prices[symbol];
        const oldPrice = previousPrices[symbol] || newPrice;
        if (newPrice > oldPrice) gainers++;
        if (newPrice < oldPrice) losers++;
    });

    document.getElementById('totalStocks').textContent = symbols.length;
    document.getElementById('gainers').textContent     = gainers;
    document.getElementById('losers').textContent      = losers;
}

// Update ticker tape
function updateTickerTape(prices) {
    const ticker = document.getElementById('tickerContent');
    if (!ticker) return;

    let html = '';
    Object.keys(prices).forEach(symbol => {
        const price    = prices[symbol];
        const oldPrice = previousPrices[symbol] || price;
        const direction = price > oldPrice ? 'up' : 'down';
        const arrow    = direction === 'up' ? '▲' : '▼';
        const currency = Utils.getCurrency();

        html += `
        <span class="ticker-item">
            <strong>${symbol}</strong>
            <span class="${direction}">
                ${arrow} ${Utils.formatPrice(price, currency)}
            </span>
        </span>`;
    });

    ticker.innerHTML = html + html;
}

// Load portfolio data
function loadPortfolio() {
    fetch('http://localhost:8081/api/portfolio/summary')
        .then(res => res.json())
        .then(data => {
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
            const bar = document.getElementById('portfolioBar');
            if (bar) {
                bar.innerHTML = Components.portfolioBar(10000, 0, 0);
            }
        });
}

// Load orders count
function loadOrdersCount() {
    fetch('http://localhost:8081/api/orders/all')
        .then(res => res.json())
        .then(data => {
            document.getElementById('ordersToday').textContent = data.length;
            ordersCount = data.length;
        })
        .catch(() => {
            document.getElementById('ordersToday').textContent = 0;
        });
}

// Start dashboard
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

// ===== ORDER PAGE LOGIC =====

let currentSymbol  = '';
let currentPrice   = 0;
let openPrice      = 0;
let orderType      = 'BUY';
let staleTimer     = null;
let balance        = 10000;

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

// Initialize order page
function initOrderPage() {
    // Get params from URL
    const params  = new URLSearchParams(window.location.search);
    currentSymbol = params.get('symbol') || 'AAPL';
    orderType     = params.get('type')   || 'BUY';

    // Set stock info
    document.getElementById('orderSymbol').textContent    = currentSymbol;
    document.getElementById('orderStockName').textContent = stockNames[currentSymbol] || currentSymbol;

    const category = stockCategories[currentSymbol] || 'OTHER';
    const catEl    = document.getElementById('orderCategory');
    catEl.textContent = category;
    catEl.className   = `category-badge badge-${category.toLowerCase()}`;

    // Set order type
    setOrderType(orderType);

    // Connect WebSocket
    WebSocketManager.onPriceUpdate = handlePriceUpdate;
    WebSocketManager.connect();

    // Load balance
    loadBalance();

    // Start stale price timer
    startStaleTimer();
}

// Handle price update
function handlePriceUpdate(prices) {
    if (!prices[currentSymbol]) return;

    currentPrice = prices[currentSymbol];
    const currency = Utils.getCurrency();

    // Update live price display
    document.getElementById('livePrice').textContent =
        Utils.formatPrice(currentPrice, currency);

    // Save open price on first update
    if (openPrice === 0) {
        openPrice = currentPrice;
    }

    // Reset stale timer
    resetStaleTimer();

    // Update total cost
    updateTotalCost();
}

// Set order type BUY or SELL
function setOrderType(type) {
    orderType = type;

    const buyBtn   = document.getElementById('buyTypeBtn');
    const sellBtn  = document.getElementById('sellTypeBtn');
    const orderBtn = document.getElementById('placeOrderBtn');

    if (type === 'BUY') {
        buyBtn.className   = 'order-type-btn buy-active';
        sellBtn.className  = 'order-type-btn';
        orderBtn.className = 'btn-place-order btn-place-buy';
        orderBtn.textContent = '▲ Place BUY Order';
    } else {
        buyBtn.className   = 'order-type-btn';
        sellBtn.className  = 'order-type-btn sell-active';
        orderBtn.className = 'btn-place-order btn-place-sell';
        orderBtn.textContent = '▼ Place SELL Order';
    }
}

// Update total cost display
function updateTotalCost() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const currency = Utils.getCurrency();

    if (!quantity || quantity <= 0) {
        document.getElementById('totalCostBox').style.display = 'none';
        return;
    }

    const total = quantity * currentPrice;
    document.getElementById('totalCostBox').style.display = 'block';
    document.getElementById('totalCost').textContent      = Utils.formatPrice(total, currency);
    document.getElementById('availableBalance').textContent = Utils.formatPrice(balance, currency);
}

// Place order
function placeOrder() {
    const quantity = parseInt(document.getElementById('quantity').value);

    // Validate quantity
    if (!quantity || quantity <= 0) {
        Utils.showAlert('Please enter a valid quantity', 'danger');
        return;
    }

    if (quantity > 1000) {
        Utils.showAlert('Maximum 1000 shares per order', 'danger');
        return;
    }

    // Check balance for buy
    if (orderType === 'BUY') {
        const total = quantity * currentPrice;
        if (total > balance) {
            Utils.showAlert('Insufficient balance', 'danger');
            return;
        }
    }

    // Save order data for confirm page
    const orderData = {
        symbol:    currentSymbol,
        type:      orderType,
        quantity:  quantity,
        price:     currentPrice,
        openPrice: openPrice,
        timestamp: Date.now()
    };

    Utils.saveLocal('pendingOrder', orderData);

    // Go to confirm page
    window.location.href = 'confirm.html';
}

// Start stale price timer — 5 seconds
function startStaleTimer() {
    staleTimer = setTimeout(() => {
        showStaleWarning();
    }, 5000);
}

// Reset stale timer on price update
function resetStaleTimer() {
    clearTimeout(staleTimer);
    hideStaleWarning();
    staleTimer = setTimeout(() => {
        showStaleWarning();
    }, 5000);
}

// Show stale warning
function showStaleWarning() {
    const warning = document.getElementById('staleWarning');
    if (warning) warning.classList.add('show');
}

// Hide stale warning
function hideStaleWarning() {
    const warning = document.getElementById('staleWarning');
    if (warning) warning.classList.remove('show');
}

// Load balance from backend
function loadBalance() {
    fetch('http://localhost:8080/api/portfolio/balance')
        .then(res => res.json())
        .then(data => {
            balance = data.balance;
            const bar = document.getElementById('portfolioBar');
            if (bar) {
                bar.innerHTML = Components.portfolioBar(balance, 0, 0);
            }
            updateTotalCost();
        })
        .catch(() => {
            balance = 10000;
        });
}

// Start page
document.addEventListener('DOMContentLoaded', () => {
    initOrderPage();
});

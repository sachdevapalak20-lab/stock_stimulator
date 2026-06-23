// ===== STOCK DETAIL PAGE LOGIC =====

let priceChart    = null;
let priceHistory  = [];
let currentSymbol = '';
let sessionHigh   = 0;
let sessionLow    = Infinity;

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

// Initialize page
function initStockPage() {
    // Get symbol from URL
    const params = new URLSearchParams(window.location.search);
    currentSymbol = params.get('symbol') || 'AAPL';

    // Set stock info
    document.getElementById('stockSymbol').textContent = currentSymbol;
    document.getElementById('stockName').textContent   = stockNames[currentSymbol] || currentSymbol;

    const category = stockCategories[currentSymbol] || 'OTHER';
    document.getElementById('stockCategory').textContent = category;
    document.getElementById('stockCategory').className  = `category-badge badge-${category.toLowerCase()}`;
    document.getElementById('statCategory').textContent = category;

    // Set buy/sell button links
    document.getElementById('buyBtn').onclick  = () => {
        window.location.href = `order.html?symbol=${currentSymbol}&type=BUY`;
    };
    document.getElementById('sellBtn').onclick = () => {
        window.location.href = `order.html?symbol=${currentSymbol}&type=SELL`;
    };

    // Initialize chart
    initChart();

    // Connect WebSocket
    WebSocketManager.onPriceUpdate = handlePriceUpdate;
    WebSocketManager.connect();

    // Load portfolio
    loadPortfolio();
}

// Initialize Chart.js
function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels:   [],
            datasets: [{
                label:           currentSymbol,
                data:            [],
                borderColor:     '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.08)',
                borderWidth:     2.5,
                pointRadius:     3,
                pointBackgroundColor: '#2563eb',
                fill:            true,
                tension:         0.4
            }]
        },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return Utils.formatPrice(context.raw, Utils.getCurrency());
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        color:    '#6c757d',
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        color:    '#6c757d',
                        callback: (value) => {
                            return Utils.formatPrice(value, Utils.getCurrency());
                        }
                    }
                }
            },
            animation: {
                duration: 300
            }
        }
    });
}

// Handle price update from WebSocket
function handlePriceUpdate(prices) {
    if (!prices[currentSymbol]) return;

    const price = prices[currentSymbol];
    const time  = Utils.formatTime(Date.now());

    // Update price history
    priceHistory.push(price);
    if (priceHistory.length > 20) {
        priceHistory.shift();
    }

    // Update session high/low
    if (price > sessionHigh) sessionHigh = price;
    if (price < sessionLow)  sessionLow  = price;

    // Update UI
    updatePriceDisplay(price);
    updateChart(time, price);
    updateStats(price);
    updatePortfolio();
}

// Update price display
function updatePriceDisplay(price) {
    const currency  = Utils.getCurrency();
    const prevPrice = priceHistory[priceHistory.length - 2] || price;
    const direction = Utils.getPriceDirection(prevPrice, price);
    const change    = Utils.calcChangePercent(prevPrice, price);
    const arrow     = direction === 'up' ? '▲' : '▼';

    // Update price
    const priceEl = document.getElementById('stockPrice');
    priceEl.textContent = Utils.formatPrice(price, currency);
    priceEl.style.color = direction === 'up'
        ? 'var(--success)'
        : direction === 'down'
        ? 'var(--danger)'
        : 'var(--text-primary)';

    // Update change
    const changeEl = document.getElementById('stockChange');
    changeEl.textContent = `${arrow} ${Math.abs(change)}%`;
    changeEl.className   = `stock-detail-change ${direction}`;
}

// Update chart
function updateChart(time, price) {
    priceChart.data.labels.push(time);
    priceChart.data.datasets[0].data.push(price);

    // Keep only last 20 points
    if (priceChart.data.labels.length > 20) {
        priceChart.data.labels.shift();
        priceChart.data.datasets[0].data.shift();
    }

    // Update chart color based on trend
    const data      = priceChart.data.datasets[0].data;
    const isUp      = data[data.length - 1] >= data[0];
    const lineColor = isUp ? '#16a34a' : '#dc2626';
    const fillColor = isUp
        ? 'rgba(22,163,74,0.08)'
        : 'rgba(220,38,38,0.08)';

    priceChart.data.datasets[0].borderColor     = lineColor;
    priceChart.data.datasets[0].backgroundColor = fillColor;
    priceChart.data.datasets[0].pointBackgroundColor = lineColor;

    priceChart.update('none');
}

// Update stats
function updateStats(price) {
    const currency = Utils.getCurrency();
    document.getElementById('statCurrentPrice').textContent = Utils.formatPrice(price, currency);
    document.getElementById('statHigh').textContent         = Utils.formatPrice(sessionHigh, currency);
    document.getElementById('statLow').textContent          = Utils.formatPrice(sessionLow === Infinity ? price : sessionLow, currency);
}

// Load portfolio
function loadPortfolio() {
    fetch('http://localhost:8080/api/portfolio/summary')
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

// Update portfolio bar
function updatePortfolio() {
    fetch('http://localhost:8080/api/portfolio/summary')
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
        .catch(() => {});
}

// Start page
document.addEventListener('DOMContentLoaded', () => {
    initStockPage();
});

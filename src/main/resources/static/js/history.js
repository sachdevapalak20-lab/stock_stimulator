// ===== ORDER HISTORY PAGE LOGIC =====

let allOrders     = [];
let currentFilter = 'ALL';

// Initialize history page
function initHistoryPage() {
    loadOrders();
    loadPortfolio();
}

// Load all orders from backend
function loadOrders() {
    fetch('http://localhost:8080/api/orders/all')
        .then(res => res.json())
        .then(data => {
            allOrders = data;
            renderOrders(allOrders);
            updateSummary(allOrders);
        })
        .catch(() => {
            Utils.showAlert('Could not load orders', 'danger');
        });
}

// Render orders in table
function renderOrders(orders) {
    const tbody      = document.getElementById('ordersBody');
    const emptyState = document.getElementById('emptyState');
    const table      = document.getElementById('ordersTable');
    const currency   = Utils.getCurrency();

    if (orders.length === 0) {
        table.style.display      = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display      = 'table';
    emptyState.style.display = 'none';

    // Newest first
    const sorted = [...orders].reverse();

    tbody.innerHTML = sorted.map(order => {
        const total    = order.quantity * order.price;
        const isBuy    = order.type === 'BUY';
        const category = order.category || 'OTHER';

        return `
        <tr class="animate__animated animate__fadeIn">
            <td>
                <strong>${order.symbol}</strong>
            </td>
            <td>
                <span class="${isBuy
                    ? 'order-badge-buy'
                    : 'order-badge-sell'}">
                    ${isBuy ? '▲' : '▼'} ${order.type}
                </span>
            </td>
            <td>${order.quantity}</td>
            <td>${Utils.formatPrice(order.price, currency)}</td>
            <td>
                <strong>
                    ${Utils.formatPrice(total, currency)}
                </strong>
            </td>
            <td>
                <span class="category-badge
                    badge-${category.toLowerCase()}">
                    ${category}
                </span>
            </td>
            <td style="color:var(--text-secondary);
                       font-size:0.85rem;">
                ${Utils.formatTime(order.timestamp)}
            </td>
        </tr>`;
    }).join('');
}

// Update summary chips
function updateSummary(orders) {
    const currency   = Utils.getCurrency();
    const buyOrders  = orders.filter(o => o.type === 'BUY');
    const sellOrders = orders.filter(o => o.type === 'SELL');
    const totalValue = orders.reduce((sum, o) => {
        return sum + (o.quantity * o.price);
    }, 0);

    document.getElementById('totalOrders').textContent =
        orders.length;
    document.getElementById('totalBuy').textContent    =
        buyOrders.length;
    document.getElementById('totalSell').textContent   =
        sellOrders.length;
    document.getElementById('totalValue').textContent  =
        Utils.formatPrice(totalValue, currency);
}

// Filter orders
function filterOrders(type) {
    currentFilter = type;

    // Update filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and render
    if (type === 'ALL') {
        renderOrders(allOrders);
    } else {
        const filtered = allOrders.filter(o => o.type === type);
        renderOrders(filtered);
    }
}

// Load portfolio bar
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

// Start page
document.addEventListener('DOMContentLoaded', () => {
    initHistoryPage();
});


// ===== ORDER HISTORY PAGE LOGIC =====

let allOrders     = [];
let currentFilter = 'ALL';

function initHistoryPage() {
    loadOrders();
    loadPortfolio();
}

function loadOrders() {
    fetch('wss://stockstimulator-production.up.railway.app/ws/api/orders/all')
        .then(res => res.json())
        .then(data => {
            console.log('Orders loaded:', data);
            allOrders = data;
            renderOrders(allOrders);
            updateSummary(allOrders);
        })
        .catch(err => {
            console.error('Error loading orders:', err);
            const tbody = document.getElementById('ordersBody');
            if (tbody) {
                tbody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center text-danger">
                        Could not load orders.
                        Make sure backend is running.
                    </td>
                </tr>`;
            }
        });
}

function renderOrders(orders) {
    const tbody      = document.getElementById('ordersBody');
    const emptyState = document.getElementById('emptyState');
    const table      = document.getElementById('tableContainer');
    const currency   = Utils.getCurrency();

    if (!orders || orders.length === 0) {
        if (table)      table.style.display      = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (table)      table.style.display      = 'block';
    if (emptyState) emptyState.style.display = 'none';

    const sorted = [...orders].reverse();

    if (tbody) {
        tbody.innerHTML = sorted.map(order => {
            const total    = order.quantity * order.price;
            const isBuy    = order.type === 'BUY';
            const category = order.category || 'OTHER';

            return `
            <tr>
                <td><strong>${order.symbol}</strong></td>
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
}

function updateSummary(orders) {
    const currency   = Utils.getCurrency();
    const buyOrders  = orders.filter(o => o.type === 'BUY');
    const sellOrders = orders.filter(o => o.type === 'SELL');
    const totalValue = orders.reduce((sum, o) => {
        return sum + (o.quantity * o.price);
    }, 0);

    const totalEl = document.getElementById('totalOrders');
    const buyEl   = document.getElementById('totalBuy');
    const sellEl  = document.getElementById('totalSell');
    const valueEl = document.getElementById('totalValue');

    if (totalEl) totalEl.textContent = orders.length;
    if (buyEl)   buyEl.textContent   = buyOrders.length;
    if (sellEl)  sellEl.textContent  = sellOrders.length;
    if (valueEl) valueEl.textContent = Utils.formatPrice(totalValue, currency);
}

function filterOrders(type, btn) {
    currentFilter = type;

    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    if (type === 'ALL') {
        renderOrders(allOrders);
    } else {
        const filtered = allOrders.filter(o => o.type === type);
        renderOrders(filtered);
    }
}

function loadPortfolio() {
    fetch('wss://stockstimulator-production.up.railway.app/ws/api/portfolio/summary')
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

document.addEventListener('DOMContentLoaded', () => {
    initHistoryPage();
});

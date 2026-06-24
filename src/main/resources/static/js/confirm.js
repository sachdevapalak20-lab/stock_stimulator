// ===== CONFIRM ORDER PAGE LOGIC =====

let pendingOrder = null;

function initConfirmPage() {
    // Direct localStorage read
    try {
        const raw = localStorage.getItem('pendingOrder');
        console.log('Raw order data:', raw);
        pendingOrder = raw ? JSON.parse(raw) : null;
    } catch(e) {
        console.error('Error reading order:', e);
    }

    if (!pendingOrder) {
        alert('No pending order found. Going back.');
        window.location.href = 'index.html';
        return;
    }

    displayOrderDetails();
    loadPortfolio();
}

function displayOrderDetails() {
    const currency     = Utils.getCurrency();
    const order        = pendingOrder;
    const priceDiff    = Math.abs(order.price - order.openPrice);
    const priceChanged = priceDiff > 2.0;
    const total        = order.quantity * order.price;

    document.getElementById('confirmSymbol').textContent =
        order.symbol;

    const typeEl = document.getElementById('confirmType');
    typeEl.textContent = order.type;
    typeEl.style.color = order.type === 'BUY'
        ? 'var(--success)'
        : 'var(--danger)';

    document.getElementById('confirmQuantity').textContent =
        order.quantity + ' shares';

    document.getElementById('confirmOpenPrice').textContent =
        Utils.formatPrice(order.openPrice, currency);

    document.getElementById('confirmCurrentPrice').textContent =
        Utils.formatPrice(order.price, currency);

    document.getElementById('confirmTotal').textContent =
        Utils.formatPrice(total, currency);

    if (priceChanged) {
        document.getElementById('priceChangedAlert')
            .classList.add('show');
    }

    const confirmBtn = document.getElementById('confirmBtn');
    if (order.type === 'BUY') {
        confirmBtn.className   = 'btn-confirm btn-confirm-buy';
        confirmBtn.textContent = '✓ Confirm BUY Order';
    } else {
        confirmBtn.className   = 'btn-confirm btn-confirm-sell';
        confirmBtn.textContent = '✓ Confirm SELL Order';
    }
}

function confirmOrder() {
    if (!pendingOrder) return;

    const confirmBtn       = document.getElementById('confirmBtn');
    confirmBtn.textContent = 'Placing Order...';
    confirmBtn.disabled    = true;

    fetch('http://localhost:8080/api/orders/place', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            symbol:   pendingOrder.symbol,
            type:     pendingOrder.type,
            quantity: pendingOrder.quantity,
            price:    pendingOrder.price
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('pendingOrder');
            showSuccess(data);
        } else {
            Utils.showAlert(data.message, 'danger');
            confirmBtn.textContent = '✓ Confirm Order';
            confirmBtn.disabled    = false;
        }
    })
    .catch(() => {
        Utils.showAlert('Connection error. Try again.', 'danger');
        confirmBtn.textContent = '✓ Confirm Order';
        confirmBtn.disabled    = false;
    });
}

function showSuccess(data) {
    const currency = Utils.getCurrency();
    const order    = pendingOrder || {};
    document.getElementById('successMessage').innerHTML = `
        <strong>${order.type}</strong>
        ${order.quantity} shares of
        <strong>${order.symbol}</strong>
        at ${Utils.formatPrice(data.currentPrice, currency)}<br>
        <span style="color:var(--text-secondary);
                     font-size:0.85rem;">
            Remaining Balance:
            ${Utils.formatPrice(data.balance, currency)}
        </span>
    `;
    document.getElementById('successOverlay')
        .classList.add('show');
}

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
        .catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
    initConfirmPage();
});
